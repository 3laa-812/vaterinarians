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
    const scope = clinicScope(session)
    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search') || ''

    // Fetch owners who have animals in the clinic, or all if super admin
    const owners = await prisma.owner.findMany({
      where: {
        ...(session.user.role !== 'SUPER_ADMIN'
          ? {
              animals: {
                some: {
                  clinicId: session.user.clinicId!,
                },
              },
            }
          : {}),
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { phone: { contains: search } },
            ]
          : undefined,
      },
      include: {
        animals: {
          where: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
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
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب بيانات المرافقين', en: 'Failed to fetch owners', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }

  try {
    const body = await req.json()
    const parsed = ownerSchema.parse(body)

    // Check if an owner with the same phone already exists
    const existing = await prisma.owner.findFirst({
      where: { phone: parsed.phone },
    })

    if (existing) {
      return NextResponse.json(existing)
    }

    const owner = await prisma.owner.create({
      data: {
        name: parsed.name,
        phone: parsed.phone,
        email: parsed.email || null,
        address: parsed.address || null,
        notes: parsed.notes || null,
      },
    })

    return NextResponse.json(owner)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في حفظ بيانات المرافق', en: 'Failed to create owner', detail: error.message } },
      { status: 400 }
    )
  }
}
