import { z } from 'zod'

export const medicationSchema = z.object({
  name:     z.string().min(1),
  dosage:   z.string().min(1),
  duration: z.string().min(1),
  notes:    z.string().optional().or(z.literal('')),
})

export const sessionSchema = z.object({
  weight:          z.number().nullable().optional(),
  chiefComplaint:  z.string().optional().or(z.literal('')),
  diagnosis:       z.string().optional().or(z.literal('')),
  clinicalNotes:   z.string().optional().or(z.literal('')),
  treatmentPlan:   z.string().optional().or(z.literal('')),
  medications:     z.array(medicationSchema).optional().default([]),
  nextVisitDate:   z.string().nullable().optional(),
  totalAmount:     z.number().min(0),
  paidAmount:      z.number().min(0),
  notes:           z.string().optional().or(z.literal('')),
})

export type SessionInput    = z.infer<typeof sessionSchema>
export type MedicationInput = z.infer<typeof medicationSchema>
