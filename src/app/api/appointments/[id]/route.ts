import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { appointmentSchema } from '@/lib/validations/appointment.schema'
import { appointmentService } from '@/services/appointment.service'

export const GET = withAuth<{ id: string }>(async (req, { session, params }) => {
  const appointment = await appointmentService.getById(session, params.id)
  return apiSuccess({ appointment })
})

export const PUT = withAuth<{ id: string }>(async (req, { session, params }) => {
  const body = await req.json()
  const parsed = appointmentSchema.parse(body)
  const updated = await appointmentService.update(session, params.id, parsed)
  return apiSuccess(updated)
})

export const DELETE = withAuth<{ id: string }>(async (req, { session, params }) => {
  await appointmentService.delete(session, params.id)
  return apiSuccess({ success: true })
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'] })
