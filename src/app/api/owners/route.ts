import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { ownerSchema } from '@/lib/validations/owner.schema'
import { ownerService } from '@/services/owner.service'

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url)
  const search = searchParams.get('search') || ''
  const page = Number(searchParams.get('page') ?? '1')
  const limit = Number(searchParams.get('limit') ?? '20')

  const result = await ownerService.list(session, { search, page, limit })
  return apiSuccess(result)
})

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json()
  const parsed = ownerSchema.parse(body)
  const owner = await ownerService.create(session, parsed)
  return apiSuccess({ owner }, 201)
})
