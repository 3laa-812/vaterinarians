import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { clinicCreateSchema } from '@/lib/validations/admin.schema'

export async function GET() {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: { ar: 'غير مصرح لك', en: 'Unauthorized' } },
      { status: 403 }
    )
  }

  try {
    const clinics = await prisma.clinic.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    })
    return NextResponse.json(clinics)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل جلب العيادات', en: 'Failed to fetch clinics', detail: error.message } },
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

  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: { ar: 'غير مصرح لك', en: 'Unauthorized' } },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const validated = clinicCreateSchema.parse(body)

    const clinic = await prisma.clinic.create({
      data: {
        name: validated.name,
        nameAr: validated.nameAr || null,
        address: validated.address || null,
        phone: validated.phone || null,
      },
    })

    return NextResponse.json(clinic)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل إنشاء العيادة', en: 'Failed to create clinic', detail: error.message } },
      { status: 500 }
    )
  }
}
