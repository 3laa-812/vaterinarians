'use server'

import { revalidatePath } from 'next/cache'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { clinicScope } from '@/lib/scope'


export async function bookFollowUpAppointment(params: { animalId: string, scheduledAt: Date, notes?: string, fee?: number }) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'DOCTOR' && session.user.role !== 'CLINIC_ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return { error: 'Unauthorized' }
    }

    const { animalId, scheduledAt, notes, fee } = params
    const scope = clinicScope(session)

    // Verify animal belongs to clinic
    const animal = await prisma.animal.findFirst({
      where: { id: animalId, ...scope }
    })

    if (!animal) return { error: 'Animal not found' }

    // Fetch clinic default session fee if fee is not provided
    let finalFee = fee
    if (finalFee === undefined) {
      const clinic = await prisma.clinic.findUnique({ where: { id: scope.clinicId } })
      finalFee = clinic?.defaultSessionFee || 0
    }

    const appointment = await prisma.appointment.create({
      data: {
        animalId,
        doctorId: session.user.id, // Booked with current doctor
        scheduledAt,
        notes,
        fee: finalFee,
        status: 'SCHEDULED'
      }
    })

    revalidatePath(`/dashboard/animals/${animalId}`)
    return { success: true, appointmentId: appointment.id }
  } catch (error) {
    console.error(error)
    return { error: 'Failed to book appointment' }
  }
}
