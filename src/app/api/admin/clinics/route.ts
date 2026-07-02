import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { clinicCreateSchema } from '@/lib/validations/admin.schema'
import { adminService } from '@/services/admin.service'

export const GET = withAuth(async () => {
  const clinics = await adminService.listClinics()
  return apiSuccess({ clinics })
}, { roles: ['SUPER_ADMIN'] })

export const POST = withAuth(async (req) => {
  const body = await req.json()
  const validated = clinicCreateSchema.parse(body)
  const clinic = await adminService.createClinic(validated)
  return apiSuccess({ clinic })
}, { roles: ['SUPER_ADMIN'] })
