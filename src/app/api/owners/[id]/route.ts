import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { ownerSchema } from '@/lib/validations/owner.schema'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        animals: {
          where: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
          include: {
            weightRecords: {
              orderBy: { recordedAt: 'desc' },
              take: 1,
            },
            appointments: {
              orderBy: { scheduledAt: 'desc' },
              take: 1,
            },
          },
        },
      },
    })

    if (!owner) {
      return NextResponse.json(
        { error: { ar: 'لم يتم العثور على المرافق', en: 'Owner not found' } },
        { status: 404 }
      )
    }

    // Check if the owner has animals in user's clinic (unauthorized check)
    if (session.user.role !== 'SUPER_ADMIN' && owner.animals.length === 0) {
      // It's possible they exist but have no animals in this clinic
      const hasAnimalsInClinic = await prisma.animal.findFirst({
        where: { ownerId: id, clinicId: session.user.clinicId! },
      })
      if (!hasAnimalsInClinic) {
        return NextResponse.json(
          { error: { ar: 'غير مصرح للوصول إلى هذا المرافق', en: 'Unauthorized access to owner' } },
          { status: 403 }
        )
      }
    }

    return NextResponse.json({ data: { owner } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات المرافق', en: 'Failed to fetch owner details', detail: error.message } },
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
    const parsed = ownerSchema.parse(body)

    // Check permissions (must have animals in this clinic to edit)
    if (session.user.role !== 'SUPER_ADMIN') {
      const hasAnimalsInClinic = await prisma.animal.findFirst({
        where: { ownerId: id, clinicId: session.user.clinicId! },
      })
      if (!hasAnimalsInClinic) {
        return NextResponse.json(
          { error: { ar: 'غير مصرح بتعديل هذا المرافق', en: 'Unauthorized to edit owner' } },
          { status: 403 }
        )
      }
    }

    const updated = await prisma.owner.update({
      where: { id },
      data: {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || null,
        address: parsed.address || null,
        notes: parsed.notes || null,
      },
    })

    return NextResponse.json(updated)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في تحديث بيانات المرافق', en: 'Failed to update owner', detail: error.message } },
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
    // Check permissions
    if (session.user.role !== 'SUPER_ADMIN') {
      const hasAnimalsInClinic = await prisma.animal.findFirst({
        where: { ownerId: id, clinicId: session.user.clinicId! },
      })
      if (!hasAnimalsInClinic) {
        return NextResponse.json(
          { error: { ar: 'غير مصرح بحذف هذا المرافق', en: 'Unauthorized to delete owner' } },
          { status: 403 }
        )
      }
    }

    // Instead of deleting (which would cascade delete animals in other clinics if global),
    // we delete the animals associated with this clinic. If no animals are left anywhere, we can delete the owner.
    if (session.user.role !== 'SUPER_ADMIN') {
      await prisma.animal.deleteMany({
        where: { ownerId: id, clinicId: session.user.clinicId! },
      })

      const remainingAnimals = await prisma.animal.count({
        where: { ownerId: id },
      })

      if (remainingAnimals === 0) {
        await prisma.owner.delete({ where: { id } })
      }
    } else {
      await prisma.owner.delete({ where: { id } })
    }

    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في حذف المرافق', en: 'Failed to delete owner', detail: error.message } },
      { status: 500 }
    )
  }
}
