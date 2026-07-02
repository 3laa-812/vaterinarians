import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { AppError, NotFoundError } from '@/lib/api/errors'
import { clinicScope } from '@/lib/scope'

export const GET = withAuth<{ id: string }>(async (req, { session, params }) => {
  const scope = clinicScope(session)

  const animalExists = await prisma.animal.findFirst({
    where: { id: params.id, ...scope },
  })

  if (!animalExists) {
    throw new NotFoundError({ ar: 'الحيوان', en: 'Animal' })
  }

  const records = await prisma.weightRecord.findMany({
    where: { animalId: params.id },
    orderBy: { recordedAt: 'asc' },
  })

  return apiSuccess({ weightRecords: records })
})

export const POST = withAuth<{ id: string }>(async (req, { session, params }) => {
  const scope = clinicScope(session)

  const animalExists = await prisma.animal.findFirst({
    where: { id: params.id, ...scope },
  })

  if (!animalExists) {
    throw new NotFoundError({ ar: 'الحيوان', en: 'Animal' })
  }

  const body = await req.json()
  if (typeof body.weight !== 'number' || body.weight <= 0) {
    throw new AppError('وزن غير صالح', 'Invalid weight value', 400, 'INVALID_INPUT')
  }

  const record = await prisma.weightRecord.create({
    data: {
      weight: body.weight,
      recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
      animalId: params.id,
    },
  })

  return apiSuccess({ weightRecord: record })
})
