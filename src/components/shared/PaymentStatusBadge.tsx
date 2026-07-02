import { useTranslations } from 'next-intl'
import type { PaymentStatus } from '@/types'

const styles: Record<PaymentStatus, string> = {
  PAID: 'bg-primary/10 text-primary border-primary/30',
  PARTIAL: 'bg-secondary/10 text-secondary border-secondary/30',
  UNPAID: 'bg-error/10 text-error border-error/30',
}

export function PaymentStatusBadge({ status }: { status: PaymentStatus }) {
  const t = useTranslations('payment.status')
  return (
    <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${styles[status]}`}>
      {t(status)}
    </span>
  )
}
