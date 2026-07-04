import { withAuth } from '@/lib/api/handler'
import { apiSuccess } from '@/lib/api/response'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) return apiSuccess({ animals: [] })

  const animals = await prisma.animal.findMany({
    where: {
      ...clinicScope(session),
      OR: [
        { name:  { contains: q, mode: 'insensitive' } },
        { breed: { contains: q, mode: 'insensitive' } },
        { owner: { name:  { contains: q, mode: 'insensitive' } } },
        { owner: { phone: { contains: q } } },
      ],
    },
    include: {
      owner:        { select: { id: true, name: true, phone: true } },
      weightRecords: { orderBy: { recordedAt: 'desc' }, take: 1 },
    },
    orderBy: { name: 'asc' },
    take: 8,
  })

  return apiSuccess({
    animals: animals.map((a) => ({
      id:           a.id,
      name:         a.name,
      species:      a.species,
      breed:        a.breed,
      latestWeight: a.weightRecords[0]?.weight ?? null,
      owner:        a.owner,
    })),
  })
})
