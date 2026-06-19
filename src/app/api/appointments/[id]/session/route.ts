import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'
import { sessionSchema } from '@/lib/validations/session.schema'

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const scope = clinicScope(session)
    // Find appointment, ensuring it belongs to user's clinic
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
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { appointment } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات الجلسة', en: 'Failed to fetch session', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
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
    // Find appointment, ensuring it belongs to user's clinic
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
        { status: 404 }
      )
    }

    // Determine payment status
    let paymentStatus: 'PAID' | 'PARTIAL' | 'UNPAID' = 'UNPAID'
    if (validated.paidAmount >= validated.totalAmount && validated.totalAmount > 0) {
      paymentStatus = 'PAID'
    } else if (validated.paidAmount > 0) {
      paymentStatus = 'PARTIAL'
    }

    const nextVisitDate = validated.nextVisitDate ? new Date(validated.nextVisitDate) : null

    // Execute session creation/update inside a transaction
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create or Update Session
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

      // 2. Create or Update Payment
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

      // 3. Create weight record if weight is supplied
      if (validated.weight) {
        await tx.weightRecord.create({
          data: {
            animalId: appointment.animalId,
            weight: validated.weight,
          },
        })
      }

      // 4. Update appointment status to COMPLETED
      await tx.appointment.update({
        where: { id },
        data: { status: 'COMPLETED' },
      })

      return { session: examSession, payment }
    })

    return NextResponse.json(result)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل حفظ الجلسة والدفع', en: 'Failed to save session and payment', detail: error.message } },
      { status: 500 }
    )
  }
}
