import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { animalSchema } from '@/lib/validations/animal.schema'
import { animalService } from '@/services/animal.service'

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url)
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  const result = await animalService.list(session, { page, limit })
  return apiSuccess(result)
})

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json()
  const parsed = animalSchema.parse(body)
  const animal = await animalService.create(session, parsed)
  return apiSuccess({ animal })
})
