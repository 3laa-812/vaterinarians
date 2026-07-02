import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { adminService } from '@/services/admin.service'

export const GET = withAuth(async (req, { session }) => {
  const doctors = await adminService.listDoctorsBasic(session)
  return apiSuccess({ doctors })
})
