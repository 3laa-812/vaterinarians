import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { AppError, NotFoundError } from '@/lib/api/errors'
import { calculateWeightDelta, calculateTotalOwed } from '@/domain/animal'
import { paginate } from '@/lib/pagination'
import type { Session } from 'next-auth'
import type { AnimalInput } from '@/lib/validations/animal.schema'

export const animalService = {
  async list(session: Session, { page, limit }: { page: number; limit: number }) {
    const scope = clinicScope(session)

    const { data: animals, total } = await paginate(prisma.animal, {
      where: { ...scope, isArchived: false },
      include: {
        owner: { select: { id: true, name: true, phone: true } },
        weightRecords: { orderBy: { recordedAt: 'desc' }, take: 1 },
      },
      orderBy: { name: 'asc' },
    } as any, { page, limit })

    const animalIds = animals.map((a) => a.id)
    const [lastVisits, nextAppointments] = await Promise.all([
      this.getLastVisits(animalIds),
      this.getNextAppointments(animalIds),
    ])

    return {
      animals: animals.map((a) => this.toListItem(a, lastVisits, nextAppointments)),
      total,
      page,
      limit,
    }
  },

  async getById(session: Session, id: string) {
    const animal = await prisma.animal.findFirst({
      where: { id, ...clinicScope(session), isArchived: false },
      include: {
        owner: {
          include: {
            animals: {
              select: { id: true, name: true, species: true }
            }
          }
        },
        weightRecords: { orderBy: { recordedAt: 'desc' } },
        appointments: {
          where: session.user.role === 'DOCTOR' ? { doctorId: session.user.id } : undefined,
          include: { doctor: { select: { id: true, name: true } }, session: true, payment: true },
          orderBy: { scheduledAt: 'desc' },
        },
      },
    })

    if (!animal) throw new NotFoundError({ ar: 'الحيوان', en: 'Animal' })

    return {
      ...animal,
      latestWeight: animal.weightRecords[0]?.weight ?? null,
      weightDelta: calculateWeightDelta(animal.weightRecords),
      totalOwed: calculateTotalOwed(animal.appointments),
      sessionCount: animal.appointments.filter((a) => a.session !== null).length,
    }
  },

  async create(session: Session, input: AnimalInput) {
    const clinicId = session.user.role === 'SUPER_ADMIN' ? input.clinicId : session.user.clinicId
    if (!clinicId) throw new AppError('يجب تحديد العيادة', 'Clinic is required', 400, 'NO_CLINIC')

    return prisma.animal.create({
      data: {
        ...input,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        clinicId,
      },
    })
  },

  async update(session: Session, id: string, input: AnimalInput) {
    const scope = clinicScope(session)

    const existing = await prisma.animal.findFirst({
      where: { id, ...scope, isArchived: false },
    })

    if (!existing) throw new NotFoundError({ ar: 'الحيوان', en: 'Animal' })

    if ('clinicId' in scope) {
      const owner = await prisma.owner.findFirst({
        where: { id: input.ownerId, clinicId: scope.clinicId },
      })
      if (!owner) {
        throw new Error('INVALID_OWNER') // This should ideally be a typed AppError
      }
    }

    return prisma.animal.update({
      where: { id },
      data: {
        name: input.name,
        species: input.species,
        breed: input.breed || null,
        gender: input.gender || null,
        birthDate: input.birthDate ? new Date(input.birthDate) : null,
        color: input.color || null,
        medicalHistory: input.medicalHistory || null,
        notes: input.notes || null,
        ownerId: input.ownerId,
      },
    })
  },

  async delete(session: Session, id: string) {
    const scope = clinicScope(session)

    const existing = await prisma.animal.findFirst({
      where: { id, ...scope, isArchived: false },
    })

    if (!existing) throw new NotFoundError({ ar: 'الحيوان', en: 'Animal' })

    await prisma.animal.update({
      where: { id },
      data: { isArchived: true }
    })
  },

  // Private helpers — not exported, only used within this service
  async getLastVisits(animalIds: string[]) {
    if (animalIds.length === 0) return []
    return prisma.appointment.groupBy({
      by: ['animalId'],
      where: { animalId: { in: animalIds }, status: 'COMPLETED' },
      _max: { scheduledAt: true },
    })
  },

  async getNextAppointments(animalIds: string[]) {
    if (animalIds.length === 0) return []
    return prisma.appointment.findMany({
      where: { animalId: { in: animalIds }, status: 'SCHEDULED', scheduledAt: { gt: new Date() } },
      orderBy: { scheduledAt: 'asc' },
      distinct: ['animalId'],
      select: { animalId: true, scheduledAt: true },
    })
  },

  toListItem(animal: any, lastVisits: any[], nextAppointments: any[]) {
    const lastVisit = lastVisits.find((v) => v.animalId === animal.id)?._max.scheduledAt ?? null
    const nextAppt = nextAppointments.find((a) => a.animalId === animal.id)?.scheduledAt ?? null

    return {
      id: animal.id,
      name: animal.name,
      species: animal.species,
      breed: animal.breed,
      gender: animal.gender,
      owner: animal.owner,
      latestWeight: animal.weightRecords[0]?.weight ?? null,
      lastVisit: lastVisit?.toISOString() ?? null,
      nextAppointment: nextAppt?.toISOString() ?? null,
    }
  },
}
