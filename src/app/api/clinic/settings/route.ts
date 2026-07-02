import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { clinicService } from '@/services/clinic.service'

export const GET = withAuth(async (req, { session }) => {
  const clinic = await clinicService.getSettings(session)
  return apiSuccess({ clinic })
})
