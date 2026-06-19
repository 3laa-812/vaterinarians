import { z } from 'zod'

export const animalSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  species: z.string().min(1, { message: 'Species is required' }),
  breed: z.string().optional().or(z.literal('')),
  gender: z.enum(['MALE', 'FEMALE']).optional().nullable(),
  birthDate: z.string().optional().nullable().or(z.literal('')),
  color: z.string().optional().or(z.literal('')),
  medicalHistory: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  ownerId: z.string().min(1, { message: 'Owner is required' }),
  clinicId: z.string().optional(),
})

export type AnimalInput = z.infer<typeof animalSchema>
