import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { financeService } from '@/services/finance.service'

export const GET = withAuth(
  async (req, { session }) => {
    // Can be expanded to query DB properly, simple placeholder for now
    return apiSuccess({ expenses: [] })
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] },
)

export const POST = withAuth(
  async (req, { session }) => {
    const body = await req.json()
    if (!session || !session.user || !session.user.clinicId) {
      throw new Error('Unauthorized')
    }
    const expense = await financeService.addExpense(session.user.clinicId!, session.user.id!, {
      ...body,
      date: new Date(body.date),
    })
    return apiSuccess({ expense })
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] },
)
