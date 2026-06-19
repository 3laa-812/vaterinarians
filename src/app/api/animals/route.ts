import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'
import { animalSchema } from '@/lib/validations/animal.schema'

export async function GET() {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  try {
    const scope = clinicScope(session)
    const animals = await prisma.animal.findMany({
      where: {
        ...scope,
      },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
        weightRecords: {
          orderBy: {
            recordedAt: 'desc',
          },
          take: 1,
        },
        appointments: {
          orderBy: {
            scheduledAt: 'desc',
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Map to AnimalListItem
    const mapped = animals.map((a) => {
      const lastVisit = a.appointments.find((ap) => ap.status === 'COMPLETED')?.scheduledAt ?? null
      const nextAppointment = a.appointments.find((ap) => ap.status === 'SCHEDULED' && ap.scheduledAt > new Date())?.scheduledAt ?? null

      return {
        id: a.id,
        name: a.name,
        species: a.species,
        breed: a.breed,
        gender: a.gender,
        owner: {
          id: a.owner.id,
          name: a.owner.name,
          phone: a.owner.phone,
        },
        latestWeight: a.weightRecords[0]?.weight ?? null,
        lastVisit: lastVisit ? lastVisit.toISOString() : null,
        nextAppointment: nextAppointment ? nextAppointment.toISOString() : null,
      }
    })

    return NextResponse.json({ data: { animals: mapped } })
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات الحيوانات', en: 'Failed to fetch animals', detail: error.message } },
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

  // Verify the user belongs to a clinic
  if (!session.user.clinicId && session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: { ar: 'المستخدم غير مرتبط بعيادة', en: 'User not associated with a clinic' } },
      { status: 400 }
    )
  }

  try {
    const body = await req.json()
    const parsed = animalSchema.parse(body)

    const animal = await prisma.animal.create({
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
        clinicId: session.user.clinicId || body.clinicId, // Fallback for super admin
      },
    })

    return NextResponse.json(animal)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في حفظ بيانات الحيوان', en: 'Failed to create animal', detail: error.message } },
      { status: 400 }
    )
  }
}
