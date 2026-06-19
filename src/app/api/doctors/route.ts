import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        clinicId: session.user.role !== 'SUPER_ADMIN' ? session.user.clinicId : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(doctors)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب الأطباء', en: 'Failed to fetch doctors', detail: error.message } },
      { status: 500 }
    )
  }
}
