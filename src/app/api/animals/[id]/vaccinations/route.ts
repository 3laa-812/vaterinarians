import { withAuth } from '@/lib/api/handler'
import { apiSuccess, apiError } from '@/lib/api/response'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'

export const GET = withAuth<{ id: string }>(async (req, { session, params }) => {
  const scope = clinicScope(session)
  
  // Verify animal belongs to clinic
  const animal = await prisma.animal.findFirst({
    where: { id: params.id, ...scope },
  })
  
  if (!animal) {
    return apiError({ ar: 'الحيوان غير موجود', en: 'Animal not found', code: 'NOT_FOUND' }, 404)
  }

  const vaccinations = await prisma.petVaccination.findMany({
    where: { petId: params.id },
    include: {
      vaccine: true,
    },
    orderBy: { dateAdministered: 'desc' },
  })
  
  return apiSuccess(vaccinations)
})

export const POST = withAuth<{ id: string }>(async (req, { session, params }) => {
  const body = await req.json()
  const scope = clinicScope(session)
  
  // Verify animal belongs to clinic
  const animal = await prisma.animal.findFirst({
    where: { id: params.id, ...scope },
  })
  
  if (!animal) {
    return apiError({ ar: 'الحيوان غير موجود', en: 'Animal not found', code: 'NOT_FOUND' }, 404)
  }

  if (!body.vaccineId) {
    return apiError({ ar: 'اللقاح مطلوب', en: 'Vaccine is required', code: 'BAD_REQUEST' }, 400)
  }

  const dateAdministered = body.dateAdministered ? new Date(body.dateAdministered) : new Date()
  const nextDueDate = body.nextDueDate ? new Date(body.nextDueDate) : null

  const newVaccination = await prisma.petVaccination.create({
    data: {
      petId: params.id,
      vaccineId: body.vaccineId,
      dateAdministered,
      nextDueDate,
      administeredBy: body.administeredBy ?? session.user.name,
      clinicName: body.clinicName ?? null,
      manufacturer: body.manufacturer ?? null,
      lotNumber: body.lotNumber ?? null,
      productExpirationDate: body.productExpirationDate ? new Date(body.productExpirationDate) : null,
      doseNumber: body.doseNumber ?? null,
      notes: body.notes ?? null,
      certificateFileUrl: body.certificateFileUrl ?? null,
    },
  })

  return apiSuccess(newVaccination)
}, { roles: ['SUPER_ADMIN', 'CLINIC_ADMIN', 'DOCTOR'] })
