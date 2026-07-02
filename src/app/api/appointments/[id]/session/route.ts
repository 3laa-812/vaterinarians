import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { sessionSchema } from '@/lib/validations/session.schema'
import { sessionService } from '@/services/session.service'

export const GET = withAuth<{ id: string }>(async (req, { session, params }) => {
  const appointment = await sessionService.getByAppointmentId(session, params.id)
  return apiSuccess({ appointment })
})

export const POST = withAuth<{ id: string }>(async (req, { session, params }) => {
  const body = await req.json()
  const validated = sessionSchema.parse(body)
  const result = await sessionService.save(session, params.id, validated)
  return apiSuccess(result)
})
