import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'
import { NotFoundError } from '@/lib/api/errors'
import { calculatePaymentStatus } from '@/domain/payment'
import type { Session } from 'next-auth'
import type { SessionInput } from '@/lib/validations/session.schema'

export const sessionService = {
  async getByAppointmentId(userSession: Session, appointmentId: string) {
    const scope = clinicScope(userSession)
    
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        animal: { ...scope },
      },
      include: {
        session: true,
        payment: true,
        animal: {
          select: { id: true, name: true, species: true, breed: true },
        },
      },
    })

    if (!appointment) throw new NotFoundError({ ar: 'الموعد', en: 'Appointment' })

    return appointment
  },

  async save(userSession: Session, appointmentId: string, input: SessionInput) {
    const scope = clinicScope(userSession)
    
    const appointment = await prisma.appointment.findFirst({
      where: {
        id: appointmentId,
        animal: { ...scope },
      },
    })

    if (!appointment) throw new NotFoundError({ ar: 'الموعد', en: 'Appointment' })

    const paymentStatus = calculatePaymentStatus(input.totalAmount, input.paidAmount)
    const nextVisitDate = input.nextVisitDate ? new Date(input.nextVisitDate) : null

    return prisma.$transaction(async (tx) => {
      const examSession = await tx.session.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          weight: input.weight || null,
          clinicalNotes: input.clinicalNotes || '',
          treatmentPlan: input.treatmentPlan || '',
          nextVisitDate,
        },
        update: {
          weight: input.weight || null,
          clinicalNotes: input.clinicalNotes || '',
          treatmentPlan: input.treatmentPlan || '',
          nextVisitDate,
        },
      })

      const payment = await tx.payment.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          totalAmount: input.totalAmount,
          paidAmount: input.paidAmount,
          status: paymentStatus,
          notes: input.notes || '',
        },
        update: {
          totalAmount: input.totalAmount,
          paidAmount: input.paidAmount,
          status: paymentStatus,
          notes: input.notes || '',
        },
      })

      if (input.weight) {
        await tx.weightRecord.create({
          data: {
            animalId: appointment.animalId,
            weight: input.weight,
          },
        })
      }

      await tx.appointment.update({
        where: { id: appointmentId },
        data: { status: 'COMPLETED' },
      })

      let nextAppointment = null

      if (nextVisitDate) {
        const conflict = await tx.appointment.findFirst({
          where: {
            animalId: appointment.animalId,
            scheduledAt: nextVisitDate,
            status: 'SCHEDULED',
          },
        })

        if (conflict) {
          nextAppointment = conflict
        } else {
          nextAppointment = await tx.appointment.create({
            data: {
              animalId: appointment.animalId,
              doctorId: appointment.doctorId,
              scheduledAt: nextVisitDate,
              status: 'SCHEDULED',
              fee: input.totalAmount,
            },
          })
        }
      }

      return { session: examSession, payment, nextAppointment }
    })
  },
}
