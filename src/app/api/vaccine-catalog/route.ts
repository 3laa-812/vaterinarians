import { withAuth } from '@/lib/api/handler'
import { apiSuccess, apiError } from '@/lib/api/response'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'

export const GET = withAuth(async (req, { session }) => {
  const scope = clinicScope(session)
  const catalog = await prisma.vaccineCatalog.findMany({
    where: {
      ...scope,
      isActive: true,
    },
    orderBy: { name: 'asc' },
  })
  
  return apiSuccess(catalog)
})

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json()
  const scope = clinicScope(session)
  
  if (!body.name || !body.species) {
    return apiError({ ar: 'مطلوب الاسم والنوع', en: 'Name and species are required', code: 'BAD_REQUEST' }, 400)
  }

  const newCatalogEntry = await prisma.vaccineCatalog.create({
    data: {
      name: body.name,
      species: body.species,
      isCore: body.isCore ?? false,
      defaultIntervalDays: body.defaultIntervalDays ? parseInt(body.defaultIntervalDays) : null,
      description: body.description ?? null,
      clinicId: session.user.clinicId!,
    },
  })

  return apiSuccess(newCatalogEntry)
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'] })
