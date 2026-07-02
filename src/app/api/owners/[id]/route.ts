import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { ownerSchema } from '@/lib/validations/owner.schema'
import { ownerService } from '@/services/owner.service'

export const GET = withAuth<{ id: string }>(async (req, { session, params }) => {
  const owner = await ownerService.getById(session, params.id)
  return apiSuccess({ owner })
})

export const PUT = withAuth<{ id: string }>(async (req, { session, params }) => {
  const body = await req.json()
  const parsed = ownerSchema.parse(body)
  const updated = await ownerService.update(session, params.id, parsed)
  return apiSuccess(updated)
})

export const DELETE = withAuth<{ id: string }>(async (req, { session, params }) => {
  await ownerService.delete(session, params.id)
  return apiSuccess({ success: true })
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'] })
