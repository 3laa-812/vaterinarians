import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { animalSchema } from '@/lib/validations/animal.schema'
import { animalService } from '@/services/animal.service'

export const GET = withAuth<{ id: string }>(async (req, { session, params }) => {
  const animal = await animalService.getById(session, params.id)
  return apiSuccess({ animal })
})

export const PUT = withAuth<{ id: string }>(async (req, { session, params }) => {
  const body = await req.json()
  const parsed = animalSchema.parse(body)
  const updated = await animalService.update(session, params.id, parsed)
  return apiSuccess(updated)
})

export const DELETE = withAuth<{ id: string }>(async (req, { session, params }) => {
  await animalService.delete(session, params.id)
  return apiSuccess({ success: true })
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN'] })
