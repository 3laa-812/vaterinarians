import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { createGuardianAccessToken } from '@/lib/guardian-auth-qr'
import { ownerService } from '@/services/owner.service'

export const POST = withAuth<{ id: string }>(async (req, { session, params }) => {
  // Ensure the owner exists and belongs to the clinic (ownerService.getById handles this)
  await ownerService.getById(session, params.id)
  
  // Generate a new QR token for the guardian
  const qrToken = await createGuardianAccessToken(params.id)
  
  return apiSuccess({ qrToken })
})
