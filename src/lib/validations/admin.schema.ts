import { z } from 'zod'

export const clinicCreateSchema = z.object({
  name: z.string().min(1, { message: 'Clinic name is required' }),
  nameAr: z.string().optional().or(z.literal('')),
  address: z.string().optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
})

export const doctorCreateSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  phone: z.string().optional().or(z.literal('')),
  role: z.enum(['CLINIC_ADMIN', 'DOCTOR']).default('DOCTOR'),
  clinicId: z.string().optional(),
})

export type ClinicCreateInput = z.infer<typeof clinicCreateSchema>
export type DoctorCreateInput = z.infer<typeof doctorCreateSchema>
