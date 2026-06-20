import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations/session.schema'
import { calculatePaymentStatus } from '@/lib/payment'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const scope = clinicScope(session)
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        animal: {
          ...scope,
        },
      },
      include: {
        session: true,
        payment: true,
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            breed: true,
          },
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: { ar: 'الموعد غير موجود', en: 'Appointment not found' } },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: { appointment } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات الجلسة', en: 'Failed to fetch session', detail: message } },
      { status: 500 },
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session: userSession } = authCheck
  const { id } = await params

  try {
    const body = await req.json()
    const validated = sessionSchema.parse(body)

    const scope = clinicScope(userSession)
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        animal: {
          ...scope,
        },
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: { ar: 'الموعد غير موجود', en: 'Appointment not found' } },
        { status: 404 },
      )
    }

    const paymentStatus = calculatePaymentStatus(validated.totalAmount, validated.paidAmount)
    const nextVisitDate = validated.nextVisitDate ? new Date(validated.nextVisitDate) : null

    const result = await prisma.$transaction(async (tx) => {
      const examSession = await tx.session.upsert({
        where: { appointmentId: id },
        create: {
          appointmentId: id,
          weight: validated.weight || null,
          clinicalNotes: validated.clinicalNotes || '',
          treatmentPlan: validated.treatmentPlan || '',
          nextVisitDate,
        },
        update: {
          weight: validated.weight || null,
          clinicalNotes: validated.clinicalNotes || '',
          treatmentPlan: validated.treatmentPlan || '',
          nextVisitDate,
        },
      })

      const payment = await tx.payment.upsert({
        where: { appointmentId: id },
        create: {
          appointmentId: id,
          totalAmount: validated.totalAmount,
          paidAmount: validated.paidAmount,
          status: paymentStatus,
          notes: validated.notes || '',
        },
        update: {
          totalAmount: validated.totalAmount,
          paidAmount: validated.paidAmount,
          status: paymentStatus,
          notes: validated.notes || '',
        },
      })

      if (validated.weight) {
        await tx.weightRecord.create({
          data: {
            animalId: appointment.animalId,
            weight: validated.weight,
          },
        })
      }

      await tx.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })

      let nextAppointment = null

      if (nextVisitDate) {
        const conflict = await tx.appointment.findFirst({
          where: {
            animalId: appointment.animalId,
            scheduledAt: nextVisitDate,
            status: 'SCHEDULED',
          },
        })

        if (conflict) {
          nextAppointment = conflict
        } else {
          nextAppointment = await tx.appointment.create({
            data: {
              animalId: appointment.animalId,
              doctorId: appointment.doctorId,
              scheduledAt: nextVisitDate,
              status: 'SCHEDULED',
              fee: validated.totalAmount,
            },
          })
        }
      }

      return { session: examSession, payment, nextAppointment }
    })

    return NextResponse.json({
      data: {
        session: result.session,
        payment: result.payment,
        nextAppointment: result.nextAppointment,
      },
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'فشل حفظ الجلسة والدفع', en: 'Failed to save session and payment', detail: message } },
      { status: 500 },
    )
  }
}
