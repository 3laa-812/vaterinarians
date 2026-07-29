import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { financeService } from '@/services/finance.service'

export const GET = withAuth(
  async (req, { session }) => {
    const { searchParams } = new URL(req.url)
    const now = new Date()
    const month = Number(searchParams.get('month') ?? (now.getMonth() + 1).toString())
    const year = Number(searchParams.get('year') ?? now.getFullYear().toString())

    const result = await financeService.getDashboard(session.user.clinicId!, month, year)
    return apiSuccess(result)
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] },
)
