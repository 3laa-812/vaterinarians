import { NextResponse } from 'next/server'
import { GuardianService } from '@/services/guardian.service'
import { withAuth } from '@/lib/api/handler'

export const POST = withAuth(async (req, { session }) => {
  // In guardian token sessions, the user role should be 'GUARDIAN'
  // but the token might be differently structured. The withAuth middleware might handle it.
  // Let's get the ownerId and clinicId from the session.
  const ownerId = (session.user as any).ownerId || session.user.id
  const clinicId = session.user.clinicId

  if (!ownerId || !clinicId) {
    return NextResponse.json({ error: { ar: 'غير مصرح', en: 'Unauthorized', code: 'UNAUTHORIZED' } }, { status: 401 })
  }

  const guardianService = new GuardianService(ownerId, clinicId)
  const body = await req.json()

  if (!body.animalId || !body.scheduledAt) {
    return NextResponse.json({ error: { ar: 'بيانات مفقودة', en: 'Missing data', code: 'BAD_REQUEST' } }, { status: 400 })
  }

  const appointment = await guardianService.createAppointment({
    animalId: body.animalId,
    scheduledAt: new Date(body.scheduledAt),
    notes: body.notes,
  })

  return NextResponse.json({ data: { appointment } })
})
