import { withAuth } from '@/lib/api/handler'
import { apiSuccess, apiError } from '@/lib/api/response'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'

export const PUT = withAuth(async (req, { params, session }) => {
  const { id } = await params
  const body = await req.json()
  const scope = clinicScope(session)

  if (!body.name || !body.species) {
    return apiError({ ar: 'مطلوب الاسم والنوع', en: 'Name and species are required', code: 'BAD_REQUEST' }, 400)
  }

  // Ensure the vaccine belongs to the clinic
  const existing = await prisma.vaccineCatalog.findFirst({
    where: { id, ...scope }
  })

  if (!existing) {
    return apiError({ ar: 'غير موجود', en: 'Not found', code: 'NOT_FOUND' }, 404)
  }

  const updatedCatalogEntry = await prisma.vaccineCatalog.update({
    where: { id },
    data: {
      name: body.name,
      species: body.species,
      isCore: body.isCore ?? existing.isCore,
      defaultIntervalDays: body.defaultIntervalDays !== undefined ? (body.defaultIntervalDays ? parseInt(body.defaultIntervalDays) : null) : existing.defaultIntervalDays,
      description: body.description ?? existing.description,
      isActive: body.isActive ?? existing.isActive,
    },
  })

  return apiSuccess(updatedCatalogEntry)
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'] })

export const DELETE = withAuth(async (req, { params, session }) => {
  const { id } = await params
  const scope = clinicScope(session)

  const existing = await prisma.vaccineCatalog.findFirst({
    where: { id, ...scope }
  })

  if (!existing) {
    return apiError({ ar: 'غير موجود', en: 'Not found', code: 'NOT_FOUND' }, 404)
  }

  // Soft delete (or full delete if no relations exist)
  // Check if it's used in pet_vaccinations
  const usageCount = await prisma.petVaccination.count({
    where: { vaccineId: id }
  })

  if (usageCount > 0) {
    // Soft delete
    const softDeleted = await prisma.vaccineCatalog.update({
      where: { id },
      data: { isActive: false }
    })
    return apiSuccess(softDeleted)
  }

  // Hard delete
  await prisma.vaccineCatalog.delete({
    where: { id }
  })

  return apiSuccess({ deleted: true })
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'] })
