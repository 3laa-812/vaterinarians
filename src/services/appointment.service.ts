import { prisma } from '@/lib/db'
import { clinicScope, appointmentClinicFilter } from '@/lib/scope'
import { NotFoundError, AppError } from '@/lib/api/errors'
import type { Session } from 'next-auth'
import type { AppointmentInput } from '@/lib/validations/appointment.schema'

export const appointmentService = {
  async list(session: Session, { dateStr, doctorId }: { dateStr?: string | null; doctorId?: string | null }) {
    const dateFilter = dateStr
      ? {
          scheduledAt: {
            gte: new Date(`${dateStr}T00:00:00.000Z`),
            lte: new Date(`${dateStr}T23:59:59.999Z`),
          },
        }
      : undefined

    const appointments = await prisma.appointment.findMany({
      where: {
        ...appointmentClinicFilter(session),
        doctorId: doctorId || undefined,
        ...dateFilter,
      },
      include: {
        animal: {
          select: {
            id: true,
            name: true,
            species: true,
            owner: { select: { name: true, phone: true } },
          },
        },
        doctor: { select: { id: true, name: true } },
        payment: { select: { status: true, totalAmount: true, paidAmount: true } },
        session: { select: { id: true } },
      },
      orderBy: { scheduledAt: 'asc' },
    })

    return appointments.map((ap) => ({
      id: ap.id,
      scheduledAt: ap.scheduledAt,
      status: ap.status,
      notes: ap.notes,
      animalId: ap.animalId,
      doctorId: ap.doctorId,
      animal: { id: ap.animal.id, name: ap.animal.name, species: ap.animal.species },
      doctor: { id: ap.doctor.id, name: ap.doctor.name },
      payment: ap.payment
        ? { status: ap.payment.status, remaining: ap.payment.totalAmount - ap.payment.paidAmount }
        : null,
      hasSession: ap.session !== null,
      owner: { name: ap.animal.owner.name, phone: ap.animal.owner.phone },
      reminderSent24h: ap.reminderSent24h,
      reminderSent1h: ap.reminderSent1h,
      createdAt: ap.createdAt,
      updatedAt: ap.updatedAt,
    }))
  },

  async getById(session: Session, id: string) {
    const appointment = await prisma.appointment.findFirst({
      where: { id, ...appointmentClinicFilter(session) },
      include: {
        animal: { include: { owner: true } },
        doctor: { select: { id: true, name: true } },
        session: true,
        payment: true,
      },
    })

    if (!appointment) throw new NotFoundError({ ar: 'الموعد', en: 'Appointment' })
    return appointment
  },

  async create(session: Session, input: AppointmentInput) {
    let fee = input.fee ?? 0
    if (session.user.role !== 'SUPER_ADMIN') {
      const animal = await prisma.animal.findFirst({
        where: { id: input.animalId, clinicId: session.user.clinicId! },
        include: { clinic: { select: { defaultSessionFee: true } } },
      })
      if (!animal) {
        throw new AppError('الحيوان غير موجود في عيادتك', 'Animal not found in your clinic', 400, 'INVALID_ANIMAL')
      }
      if (fee === 0) {
        fee = animal.clinic.defaultSessionFee
      }

      const doctor = await prisma.user.findFirst({
        where: { id: input.doctorId, role: 'DOCTOR', clinicId: session.user.clinicId! },
      })
      if (!doctor) {
        throw new AppError('الطبيب غير موجود في عيادتك', 'Doctor not found in your clinic', 400, 'INVALID_DOCTOR')
      }
    }

    return prisma.appointment.create({
      data: {
        scheduledAt: new Date(input.scheduledAt),
        animalId: input.animalId,
        doctorId: input.doctorId,
        notes: input.notes || null,
        status: input.status,
        fee,
      },
    })
  },

  async update(session: Session, id: string, input: AppointmentInput) {
    const existing = await prisma.appointment.findFirst({
      where: { id, ...appointmentClinicFilter(session) },
    })

    if (!existing) throw new NotFoundError({ ar: 'الموعد', en: 'Appointment' })

    if (session.user.role !== 'SUPER_ADMIN') {
      const [animal, doctor] = await Promise.all([
        prisma.animal.findFirst({ where: { id: input.animalId, clinicId: session.user.clinicId! } }),
        prisma.user.findFirst({ where: { id: input.doctorId, role: 'DOCTOR', clinicId: session.user.clinicId! } }),
      ])

      if (!animal || !doctor) {
        throw new AppError('الحيوان أو الطبيب غير موجود في عيادتك', 'Animal or doctor not found in your clinic', 400, 'INVALID_REFERENCE')
      }
    }

    return prisma.appointment.update({
      where: { id },
      data: {
        scheduledAt: new Date(input.scheduledAt),
        status: input.status,
        notes: input.notes || null,
        doctorId: input.doctorId,
        animalId: input.animalId,
      },
    })
  },

  async delete(session: Session, id: string) {
    const existing = await prisma.appointment.findFirst({
      where: { id, ...appointmentClinicFilter(session) },
    })

    if (!existing) throw new NotFoundError({ ar: 'الموعد', en: 'Appointment' })

    await prisma.appointment.delete({ where: { id } })
  },
}
