import { apiSuccess, apiError } from '@/lib/api/response'
import { prisma } from '@/lib/db'
import { triggerAppointmentReminder, triggerVaccinationReminder } from '@/lib/novu'
import { addHours, addDays, startOfDay, endOfDay } from 'date-fns'

export async function GET(req: Request) {
  const authHeader = req.headers.get('authorization')
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return apiError(
      { ar: 'غير مصرح', en: 'Unauthorized', code: 'UNAUTHORIZED' },
      401,
    )
  }

  const now = new Date()

  try {
    const range24hStart = addHours(now, 23)
    const range24hEnd = addHours(now, 25)

    const appointments24h = await prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: range24hStart,
          lte: range24hEnd,
        },
        reminderSent24h: false,
      },
      include: {
        animal: {
          include: {
            owner: true,
            clinic: true,
          },
        },
        doctor: true,
      },
    })

    const range1hStart = addHours(now, 0.5)
    const range1hEnd = addHours(now, 1.5)

    const appointments1h = await prisma.appointment.findMany({
      where: {
        status: 'SCHEDULED',
        scheduledAt: {
          gte: range1hStart,
          lte: range1hEnd,
        },
        reminderSent1h: false,
      },
      include: {
        animal: {
          include: {
            owner: true,
            clinic: true,
          },
        },
        doctor: true,
      },
    })

    const results = []

    for (const app of appointments24h) {
      try {
        await triggerAppointmentReminder({
          subscriberId: app.doctor.id,
          patientName: app.animal.name,
          ownerName: app.animal.owner.name,
          appointmentTime: app.scheduledAt.toISOString(),
          hoursUntil: 24,
          clinicName: app.animal.clinic.nameAr || app.animal.clinic.name,
        })

        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSent24h: true },
        })

        results.push({ id: app.id, type: '24h', success: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.push({ id: app.id, type: '24h', success: false, error: message })
      }
    }

    for (const app of appointments1h) {
      try {
        await triggerAppointmentReminder({
          subscriberId: app.doctor.id,
          patientName: app.animal.name,
          ownerName: app.animal.owner.name,
          appointmentTime: app.scheduledAt.toISOString(),
          hoursUntil: 1,
          clinicName: app.animal.clinic.nameAr || app.animal.clinic.name,
        })

        await prisma.appointment.update({
          where: { id: app.id },
          data: { reminderSent1h: true },
        })

        results.push({ id: app.id, type: '1h', success: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.push({ id: app.id, type: '1h', success: false, error: message })
      }
    }
    // ── VACCINATION REMINDERS (14 days advance) ────────────
    const range14dStart = startOfDay(addDays(now, 14))
    const range14dEnd = endOfDay(addDays(now, 14))

    const vaccinations14d = await prisma.petVaccination.findMany({
      where: {
        nextDueDate: {
          gte: range14dStart,
          lte: range14dEnd,
        },
        reminderSent: false,
      },
      include: {
        pet: {
          include: {
            owner: true,
            clinic: true,
          },
        },
        vaccine: true,
      },
    })

    for (const vax of vaccinations14d) {
      try {
        await triggerVaccinationReminder({
          subscriberId: vax.pet.owner.id,
          patientName: vax.pet.name,
          ownerName: vax.pet.owner.name,
          vaccineName: vax.vaccine.name,
          dueDate: vax.nextDueDate!.toISOString(),
          clinicName: vax.pet.clinic.nameAr || vax.pet.clinic.name,
        })

        await prisma.petVaccination.update({
          where: { id: vax.id },
          data: { reminderSent: true },
        })

        results.push({ id: vax.id, type: 'vax-14d', success: true })
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : 'Unknown error'
        results.push({ id: vax.id, type: 'vax-14d', success: false, error: message })
      }
    }

    return apiSuccess({ processed: results.length, details: results })
  } catch (error: unknown) {
    console.error('Cron send-reminders failed:', error)
    return apiError(
      { ar: 'فشل إرسال التذكيرات', en: 'Failed to send reminders', code: 'INTERNAL_ERROR' },
      500,
    )
  }
}
