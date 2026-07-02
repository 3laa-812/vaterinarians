import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { doctorCreateSchema } from '@/lib/validations/admin.schema'
import { adminService } from '@/services/admin.service'

export const GET = withAuth(async (req, { session }) => {
  const doctors = await adminService.listDoctors(session)
  return apiSuccess({ doctors })
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'] })

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json()
  const validated = doctorCreateSchema.parse(body)
  const doctor = await adminService.createDoctor(session, validated)
  return apiSuccess({ doctor })
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'] })
