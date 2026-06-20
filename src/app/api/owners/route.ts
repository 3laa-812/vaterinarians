import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'
import { ownerSchema } from '@/lib/validations/owner.schema'

export async function GET(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  try {
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    const owners = await prisma.owner.findMany({
      where: {
        ...clinicScope(session),
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ]
          : undefined,
      },
      include: {
        animals: {
          select: {
            id: true,
            name: true,
            species: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ data: { owners } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات المرافقين', en: 'Failed to fetch owners', detail: message } },
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

  try {
    const body = await req.json()
    const parsed = ownerSchema.parse(body)

    const clinicId =
      session.user.role === 'SUPER_ADMIN'
        ? (body.clinicId as string | undefined)
        : session.user.clinicId

    if (!clinicId) {
      return NextResponse.json(
        { error: { ar: 'يجب تحديد العيادة', en: 'Clinic is required', code: 'NO_CLINIC' } },
        { status: 400 },
      )
    }

    const existing = await prisma.owner.findFirst({
      where: { phone: parsed.phone, clinicId },
    })

    if (existing) {
      return NextResponse.json({ data: { owner: existing } })
    }

    const owner = await prisma.owner.create({
      data: {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || null,
        address: parsed.address || null,
        notes: parsed.notes || null,
        clinicId,
      },
    })

    return NextResponse.json({ data: { owner } }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'فشل في حفظ بيانات المرافق', en: 'Failed to create owner', detail: message } },
      { status: 400 },
    )
  }
}
