import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { AppError, NotFoundError, ClinicMismatchError } from '@/lib/api/errors'
import type { Session } from 'next-auth'
import type { OwnerInput } from '@/lib/validations/owner.schema'
import { createGuardianAccessToken } from '@/lib/guardian-auth-qr'

export const ownerService = {
  async list(session: Session, { search = '', page = 1, limit = 20 }: { search?: string; page?: number; limit?: number }) {
    const scope = clinicScope(session)

    const where = {
      ...scope,
      OR: search
        ? [
            { name: { contains: search, mode: 'insensitive' as const } },
            { phone: { contains: search } },
          ]
        : undefined,
    }

    const [owners, total] = await Promise.all([
      prisma.owner.findMany({
        where,
        include: {
          animals: {
            select: { id: true, name: true, species: true },
          },
        },
        orderBy: { name: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.owner.count({ where }),
    ])

    return { owners, total, page, limit }
  },

  async getById(session: Session, id: string) {
    const owner = await prisma.owner.findUnique({
      where: { id },
      include: {
        animals: {
          where: session.user.role !== 'SUPER_ADMIN' ? { clinicId: session.user.clinicId! } : undefined,
          include: {
            weightRecords: { orderBy: { recordedAt: 'desc' }, take: 1 },
            appointments: { orderBy: { scheduledAt: 'desc' }, take: 1 },
          },
        },
      },
    })

    if (!owner) throw new NotFoundError({ ar: 'المرافق', en: 'Owner' })

    if (session.user.role !== 'SUPER_ADMIN' && owner.clinicId !== session.user.clinicId) {
      throw new ClinicMismatchError()
    }

    return owner
  },

  async create(session: Session, input: OwnerInput) {
    const clinicId = session.user.role === 'SUPER_ADMIN' ? input.clinicId : session.user.clinicId
    if (!clinicId) throw new AppError('يجب تحديد العيادة', 'Clinic is required', 400, 'NO_CLINIC')


    const existing = await prisma.owner.findFirst({
      where: { phone: input.phone, clinicId },
    })

    if (existing) {
      return { owner: existing, qrToken: null };
    }

    const owner = await prisma.owner.create({
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        address: input.address || null,
        notes: input.notes || null,
        clinicId,
      },
    })

    const qrToken = await createGuardianAccessToken(owner.id);

    return { owner, qrToken };
  },

  async regenerateQr(session: Session, id: string) {
    if (session.user.role !== 'SUPER_ADMIN') {
      const owner = await prisma.owner.findUnique({ where: { id } })
      if (!owner || owner.clinicId !== session.user.clinicId) throw new ClinicMismatchError()
    }
    const qrToken = await createGuardianAccessToken(id);
    return { qrToken };
  },

  async update(session: Session, id: string, input: OwnerInput) {
    if (session.user.role !== 'SUPER_ADMIN') {
      const owner = await prisma.owner.findUnique({ where: { id } })
      if (!owner || owner.clinicId !== session.user.clinicId) throw new ClinicMismatchError()
    }

    return prisma.owner.update({
      where: { id },
      data: {
        name: input.name,
        phone: input.phone,
        email: input.email || null,
        address: input.address || null,
        notes: input.notes || null,
      },
    })
  },

  async delete(session: Session, id: string) {
    if (session.user.role !== 'SUPER_ADMIN') {
      const owner = await prisma.owner.findUnique({ where: { id } })
      if (!owner || owner.clinicId !== session.user.clinicId) throw new ClinicMismatchError()
    }
    await prisma.owner.delete({ where: { id } })
  },
}
