import { z } from 'zod'

export const appointmentSchema = z.object({
  scheduledAt: z.string().min(1, { message: 'Date and time is required' }),
  animalId: z.string().min(1, { message: 'Animal is required' }),
  doctorId: z.string().min(1, { message: 'Doctor is required' }),
  notes: z.string().optional().or(z.literal('')),
  fee: z.number().min(0).optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'ABSENT', 'POSTPONED']).default('SCHEDULED'),
  force: z.boolean().optional(),
})

export type AppointmentInput = z.infer<typeof appointmentSchema>
