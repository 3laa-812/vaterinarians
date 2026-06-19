import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { triggerAppointmentReminder } from '@/lib/novu'
import { addHours, subHours } from 'date-fns'

export async function GET(req: Request) {
  // Validate cron secret if configured
  const authHeader = req.headers.get('authorization')
  if (process.env.CRON_SECRET && authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()

  try {
    // 1. Fetch appointments for 24-hour reminder
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

    // 2. Fetch appointments for 1-hour reminder
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

    // Trigger 24h reminders
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
      } catch (err: any) {
        results.push({ id: app.id, type: '24h', success: false, error: err.message })
      }
    }

    // Trigger 1h reminders
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
      } catch (err: any) {
        results.push({ id: app.id, type: '1h', success: false, error: err.message })
      }
    }

    return NextResponse.json({ processed: results.length, details: results })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
