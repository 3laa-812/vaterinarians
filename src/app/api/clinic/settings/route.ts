import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'

export async function GET() {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  if (!session.user.clinicId) {
    return NextResponse.json(
      { error: { ar: 'المستخدم غير مرتبط بعيادة', en: 'User not associated with a clinic', code: 'NO_CLINIC' } },
      { status: 400 },
    )
  }

  try {
    const clinic = await prisma.clinic.findUnique({
      where: { id: session.user.clinicId },
      select: {
        id: true,
        name: true,
        defaultSessionFee: true,
      },
    })

    if (!clinic) {
      return NextResponse.json(
        { error: { ar: 'العيادة غير موجودة', en: 'Clinic not found', code: 'NOT_FOUND' } },
        { status: 404 },
      )
    }

    return NextResponse.json({ data: { clinic } })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب إعدادات العيادة', en: 'Failed to fetch clinic settings', detail: message } },
      { status: 500 },
    )
  }
}
