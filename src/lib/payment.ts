export type PaymentStatus = 'UNPAID' | 'PARTIAL' | 'PAID'

export function calculatePaymentStatus(totalAmount: number, paidAmount: number): PaymentStatus {
  if (totalAmount <= 0) return 'UNPAID'
  if (paidAmount <= 0) return 'UNPAID'
  if (paidAmount >= totalAmount) return 'PAID'
  return 'PARTIAL'
}

export function calculateRemaining(totalAmount: number, paidAmount: number): number {
  return Math.max(0, totalAmount - paidAmount)
}
