import type { WeightRecord, Appointment, Payment } from '@prisma/client'
import { calculateRemaining } from './payment'

export function calculateWeightDelta(weightRecords: WeightRecord[]): number | null {
  if (weightRecords.length < 2) return null
  return weightRecords[0].weight - weightRecords[1].weight
}

export function calculateTotalWeightLost(weightRecords: WeightRecord[]): number | null {
  if (weightRecords.length < 2) return null
  const latest = weightRecords[0].weight
  const oldest = weightRecords[weightRecords.length - 1].weight
  return oldest - latest
}

export function calculateTotalOwed(
  appointments: (Appointment & { payment: Payment | null })[],
): number {
  return appointments.reduce((sum, appt) => {
    if (!appt.payment) return sum
    return sum + calculateRemaining(appt.payment.totalAmount, appt.payment.paidAmount)
  }, 0)
}
