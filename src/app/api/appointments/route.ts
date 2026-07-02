import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { appointmentSchema } from '@/lib/validations/appointment.schema'
import { appointmentService } from '@/services/appointment.service'

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url)
  const dateStr = searchParams.get('date')
  const doctorId = searchParams.get('doctorId')

  const appointments = await appointmentService.list(session, { dateStr, doctorId })
  return apiSuccess({ appointments })
})

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json()
  const parsed = appointmentSchema.parse(body)
  const appointment = await appointmentService.create(session, parsed)
  return apiSuccess({ appointment }, 201)
})
