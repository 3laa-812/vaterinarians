import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { appointmentSchema } from '@/lib/validations/appointment.schema'

export async function GET(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  try {
    const { searchParams } = new URL(req.url)
    const dateStr = searchParams.get('date') // YYYY-MM-DD
    const doctorId = searchParams.get('doctorId')

    const dateFilter = dateStr
      ? {
          scheduledAt: {
            gte: new Date(`${dateStr}T00:00:00.000Z`),
            lte: new Date(`${dateStr}T23:59:59.999Z`),
          },
        }
      : undefined

    const appointments = await prisma.appointment.findMany({
      where: {
        animal: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
        doctorId: doctorId || undefined,
        ...dateFilter,
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: {
              select: {
                name: true,
                phone: true,
              },
            },
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        payment: {
          select: {
            status: true,
            totalAmount: true,
            paidAmount: true,
          },
        },
        session: {
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        scheduledAt: 'asc',
      },
    })

    // Map to AppointmentWithDetails type
    const mapped = appointments.map((ap) => ({
      id: ap.id,
      scheduledAt: ap.scheduledAt,
      status: ap.status,
      notes: ap.notes,
      animalId: ap.animalId,
      doctorId: ap.doctorId,
      animal: {
        id: ap.animal.id,
        name: ap.animal.name,
        species: ap.animal.species,
      },
      doctor: {
        id: ap.doctor.id,
        name: ap.doctor.name,
      },
      payment: ap.payment
        ? {
            status: ap.payment.status,
            remaining: ap.payment.totalAmount - ap.payment.paidAmount,
          }
        : null,
      hasSession: ap.session !== null,
      owner: {
        name: ap.animal.owner.name,
        phone: ap.animal.owner.phone,
      },
      reminderSent24h: ap.reminderSent24h,
      reminderSent1h: ap.reminderSent1h,
      createdAt: ap.createdAt,
      updatedAt: ap.updatedAt,
    }))

    return NextResponse.json({ data: { appointments: mapped } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب المواعيد', en: 'Failed to fetch appointments', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  try {
    const body = await req.json()
    const parsed = appointmentSchema.parse(body)

    // Verify animal belongs to clinic
    let fee = parsed.fee ?? 0
    if (session.user.role !== 'SUPER_ADMIN') {
      const animal = await prisma.animal.findFirst({
        where: { id: parsed.animalId, clinicId: session.user.clinicId! },
        include: { clinic: { select: { defaultSessionFee: true } } },
      })
      if (!animal) {
        return NextResponse.json(
          { error: { ar: 'الحيوان غير موجود في عيادتك', en: 'Animal not found in your clinic' } },
          { status: 400 },
        )
      }
      if (fee === 0) {
        fee = animal.clinic.defaultSessionFee
      }
    }

    const appointment = await prisma.appointment.create({
      data: {
        scheduledAt: new Date(parsed.scheduledAt),
        animalId: parsed.animalId,
        doctorId: parsed.doctorId,
        notes: parsed.notes || null,
        status: parsed.status,
        fee,
      },
    })

    return NextResponse.json({ data: { appointment } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في حجز الموعد', en: 'Failed to create appointment', detail: error.message } },
      { status: 400 }
    )
  }
}
