import { z } from 'zod'

export const ownerSchema = z.object({
  name: z.string().min(2, { message: 'Name must be at least 2 characters' }),
  phone: z.string().min(7, { message: 'Phone must be a valid phone number' }),
  email: z.string().email().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  notes: z.string().optional().or(z.literal('')),
  clinicId: z.string().optional(),
})

export type OwnerInput = z.infer<typeof ownerSchema>
