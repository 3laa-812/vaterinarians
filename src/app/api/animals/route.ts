import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'
import { animalSchema } from '@/lib/validations/animal.schema'

export async function GET(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  try {
    const scope = clinicScope(session)
    const { searchParams } = new URL(req.url)
    const page = Number(searchParams.get('page') ?? '1')
    const limit = Number(searchParams.get('limit') ?? '20')

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
      },
      orderBy: {
        name: 'asc',
      },
      skip: (page - 1) * limit,
      take: limit,
    })

    const animalIds = animals.map((a) => a.id)

    const [lastVisits, nextAppointments, total] = await Promise.all([
      animalIds.length > 0
        ? prisma.appointment.groupBy({
            by: ['animalId'],
            where: { animalId: { in: animalIds }, status: 'COMPLETED' },
            _max: { scheduledAt: true },
          })
        : Promise.resolve([]),
      animalIds.length > 0
        ? prisma.appointment.findMany({
            where: {
              animalId: { in: animalIds },
              status: 'SCHEDULED',
              scheduledAt: { gt: new Date() },
            },
            orderBy: { scheduledAt: 'asc' },
            distinct: ['animalId'],
            select: { animalId: true, scheduledAt: true },
          })
        : Promise.resolve([]),
      prisma.animal.count({ where: { ...scope } }),
    ])

    const lastVisitMap = new Map(lastVisits.map((v) => [v.animalId, v._max.scheduledAt]))
    const nextApptMap = new Map(nextAppointments.map((a) => [a.animalId, a.scheduledAt]))

    const mapped = animals.map((a) => ({
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
      lastVisit: lastVisitMap.get(a.id)?.toISOString() ?? null,
      nextAppointment: nextApptMap.get(a.id)?.toISOString() ?? null,
    }))

    return NextResponse.json({ data: { animals: mapped, total, page, limit } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات الحيوانات', en: 'Failed to fetch animals', detail: message } },
      { status: 500 },
    )
  }
}

export async function POST(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  if (!session.user.clinicId && session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: { ar: 'المستخدم غير مرتبط بعيادة', en: 'User not associated with a clinic' } },
      { status: 400 },
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
        clinicId: session.user.clinicId || body.clinicId,
      },
    })

    return NextResponse.json({ data: { animal } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'فشل في حفظ بيانات الحيوان', en: 'Failed to create animal', detail: message } },
      { status: 400 },
    )
  }
}
