import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'
import { animalSchema } from '@/lib/validations/animal.schema'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const scope = clinicScope(session)
    const animal = await prisma.animal.findFirst({
      where: {
        id,
        ...scope,
      },
      include: {
        owner: true,
        weightRecords: {
          orderBy: {
            recordedAt: 'desc',
          },
        },
        appointments: {
          include: {
            doctor: {
              select: {
                id: true,
                name: true,
              },
            },
            session: true,
            payment: true,
          },
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
    })

    if (!animal) {
      return NextResponse.json(
        { error: { ar: 'لم يتم العثور على الحيوان', en: 'Animal not found' } },
        { status: 404 }
      )
    }

    // Compute profile calculations
    const latestWeight = animal.weightRecords[0]?.weight ?? null
    const weightRecordsCount = animal.weightRecords.length
    const oldestWeight = weightRecordsCount > 1 ? animal.weightRecords[weightRecordsCount - 1].weight : null
    const previousWeight = weightRecordsCount > 1 ? animal.weightRecords[1].weight : null

    const weightDelta = latestWeight !== null && previousWeight !== null ? latestWeight - previousWeight : null
    const totalWeightLost = latestWeight !== null && oldestWeight !== null ? oldestWeight - latestWeight : null

    const nextAppointment = animal.appointments.find((ap) => ap.status === 'SCHEDULED' && ap.scheduledAt > new Date()) ?? null

    const unpaidAmount = animal.appointments.reduce((sum, ap) => {
      if (ap.payment) {
        return sum + (ap.payment.totalAmount - ap.payment.paidAmount)
      }
      return sum
    }, 0)

    const sessionCount = animal.appointments.filter((ap) => ap.session !== null).length

    const profile = {
      ...animal,
      latestWeight,
      weightDelta,
      totalWeightLost,
      sessionCount,
      nextAppointment,
      unpaidAmount,
    }

    return NextResponse.json({ data: { animal: profile } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات الملف الشخصي للحيوان', en: 'Failed to fetch animal profile', detail: error.message } },
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
    const parsed = animalSchema.parse(body)
    const scope = clinicScope(session)

    // Verify ownership and clinic scope first
    const existing = await prisma.animal.findFirst({
      where: {
        id,
        ...scope,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: { ar: 'غير مصرح أو لم يتم العثور على الحيوان', en: 'Animal not found or unauthorized' } },
        { status: 404 }
      )
    }

    const updated = await prisma.animal.update({
      where: { id },
      data: {
        name: parsed.name,
        species: parsed.species,
        breed: parsed.breed || null,
        gender: parsed.gender || null,
        birthDate: parsed.birthDate ? new Date(parsed.birthDate) : null,
        color: parsed.color || null,
        medicalHistory: parsed.medicalHistory || null,
        notes: parsed.notes || null,
        ownerId: parsed.ownerId,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في تحديث بيانات الحيوان', en: 'Failed to update animal', detail: error.message } },
      { status: 400 }
    )
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth(['SUPER_ADMIN', 'CLINIC_ADMIN'])
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const scope = clinicScope(session)

    const existing = await prisma.animal.findFirst({
      where: {
        id,
        ...scope,
      },
    })

    if (!existing) {
      return NextResponse.json(
        { error: { ar: 'لم يتم العثور على الحيوان أو غير مصرح به', en: 'Animal not found or unauthorized' } },
        { status: 404 }
      )
    }

    await prisma.animal.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في حذف الحيوان', en: 'Failed to delete animal', detail: error.message } },
      { status: 500 }
    )
  }
}
