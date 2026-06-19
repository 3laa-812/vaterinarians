import { z } from 'zod'

export const sessionSchema = z.object({
  weight: z.number().nullable().optional(),
  clinicalNotes: z.string().optional().or(z.literal('')),
  treatmentPlan: z.string().optional().or(z.literal('')),
  nextVisitDate: z.string().nullable().optional(),
  totalAmount: z.number().min(0, { message: 'Total amount must be at least 0' }),
  paidAmount: z.number().min(0, { message: 'Paid amount must be at least 0' }),
  notes: z.string().optional().or(z.literal('')),
})

export type SessionInput = z.infer<typeof sessionSchema>
