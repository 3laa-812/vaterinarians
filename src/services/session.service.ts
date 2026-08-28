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
        ...(userSession.user.role === 'DOCTOR' ? { doctorId: userSession.user.id } : {}),
      },
      include: {
        session: { 
          include: { 
            medications: true,
            messages: {
              orderBy: { createdAt: 'asc' }
            }
          } 
        },
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
        ...(userSession.user.role === 'DOCTOR' ? { doctorId: userSession.user.id } : {}),
      },
      include: {
        animal: true,
      },
    })

    if (!appointment) throw new NotFoundError({ ar: 'الموعد', en: 'Appointment' })

    const paymentStatus = calculatePaymentStatus(input.totalAmount, input.paidAmount)
    const nextVisitDate = input.nextVisitDate ? new Date(input.nextVisitDate) : null

    return prisma.$transaction(async (tx) => {
      // 1. Upsert session with all fields
      const examSession = await tx.session.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          weight:         input.weight ?? null,
          chiefComplaint: input.chiefComplaint || null,
          diagnosis:      input.diagnosis || null,
          clinicalNotes:  input.clinicalNotes || null,
          treatmentPlan:  input.treatmentPlan || null,
          nextVisitDate,
        },
        update: {
          weight:         input.weight ?? null,
          chiefComplaint: input.chiefComplaint || null,
          diagnosis:      input.diagnosis || null,
          clinicalNotes:  input.clinicalNotes || null,
          treatmentPlan:  input.treatmentPlan || null,
          nextVisitDate,
        },
      })

      // 2. Replace medications (delete old, create new)
      await tx.medication.deleteMany({ where: { sessionId: examSession.id } })
      if (input.medications && input.medications.length > 0) {
        await tx.medication.createMany({
          data: input.medications.map((m) => ({
            sessionId: examSession.id,
            name:      m.name,
            dosage:    m.dosage,
            duration:  m.duration,
            notes:     m.notes || null,
          })),
        })
      }

      // 3. Upsert payment & invoice
      const existingPayment = await tx.payment.findUnique({
        where: { appointmentId },
      })

      let invoiceId = existingPayment?.invoiceId

      if (invoiceId) {
        await tx.invoice.update({
          where: { id: invoiceId },
          data: {
            subtotal: input.totalAmount,
            total: input.totalAmount,
            paidAmount: input.paidAmount,
            status: paymentStatus,
          },
        })
      } else {
        const invoice = await tx.invoice.create({
          data: {
            invoiceNumber: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
            subtotal: input.totalAmount,
            total: input.totalAmount,
            paidAmount: input.paidAmount,
            status: paymentStatus,
            clinicId: appointment.animal.clinicId,
            ownerId: appointment.animal.ownerId,
            animalId: appointment.animalId,
            createdById: userSession.user.id,
          },
        })
        invoiceId = invoice.id
      }

      const payment = await tx.payment.upsert({
        where: { appointmentId },
        create: {
          appointmentId,
          totalAmount: input.totalAmount,
          paidAmount:  input.paidAmount,
          status:      paymentStatus,
          notes:       input.notes || null,
          invoiceId,
        },
        update: {
          totalAmount: input.totalAmount,
          paidAmount:  input.paidAmount,
          status:      paymentStatus,
          notes:       input.notes || null,
          invoiceId,
        },
      })

      // 4. Record weight history
      if (input.weight) {
        await tx.weightRecord.create({
          data: { animalId: appointment.animalId, weight: input.weight },
        })
      }

      // 5. Mark appointment completed
      await tx.appointment.update({
        where: { id: appointmentId },
        data:  { status: 'COMPLETED' },
      })

      // 6. Auto-book next appointment
      let nextAppointment = null
      if (nextVisitDate) {
        const conflict = await tx.appointment.findFirst({
          where: {
            animalId:    appointment.animalId,
            scheduledAt: nextVisitDate,
            status:      'SCHEDULED',
          },
        })
        nextAppointment = conflict ?? await tx.appointment.create({
          data: {
            animalId:    appointment.animalId,
            doctorId:    appointment.doctorId,
            scheduledAt: nextVisitDate,
            status:      'SCHEDULED',
            fee:         input.totalAmount,
          },
        })
      }

      // 7. Generate a new QR token for the owner
      const { createGuardianAccessToken } = await import('@/lib/guardian-auth-qr')
      const qrToken = await createGuardianAccessToken(appointment.animal.ownerId)

      return { session: examSession, payment, nextAppointment, qrToken }
    })
  },
}
