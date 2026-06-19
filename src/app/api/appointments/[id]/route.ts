import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { appointmentSchema } from '@/lib/validations/appointment.schema'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const appointment = await prisma.appointment.findFirst({
      where: {
        id,
        animal: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
      },
      include: {
        animal: {
          include: {
            owner: true,
          },
        },
        doctor: {
          select: {
            id: true,
            name: true,
          },
        },
        session: true,
        payment: true,
      },
    })

    if (!appointment) {
      return NextResponse.json(
        { error: { ar: 'الموعد غير موجود أو غير مصرح لك بمشاهدته', en: 'Appointment not found or unauthorized' } },
        { status: 404 }
      )
    }

    return NextResponse.json({ data: { appointment } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات الموعد', en: 'Failed to fetch appointment', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const body = await req.json()
    const parsed = appointmentSchema.parse(body)

    // Check ownership and clinic scope
    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        animal: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: { ar: 'الموعد غير موجود أو غير مصرح بتعديله', en: 'Appointment not found or unauthorized' } },
        { status: 404 }
      )
    }

    const updated = await prisma.appointment.update({
      where: { id },
      data: {
        scheduledAt: new Date(parsed.scheduledAt),
        status: parsed.status,
        notes: parsed.notes || null,
        doctorId: parsed.doctorId,
        animalId: parsed.animalId,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في تحديث الموعد', en: 'Failed to update appointment', detail: error.message } },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth(['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'])
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    // Check ownership and clinic scope
    const existing = await prisma.appointment.findFirst({
      where: {
        id,
        animal: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: { ar: 'الموعد غير موجود أو غير مصرح بحذفه', en: 'Appointment not found or unauthorized' } },
        { status: 404 }
      )
    }

    await prisma.appointment.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في حذف الموعد', en: 'Failed to delete appointment', detail: error.message } },
      { status: 500 }
    )
  }
}
