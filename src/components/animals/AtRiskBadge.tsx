import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'

export function AtRiskBadge({ className = '' }: { className?: string }) {
  const t = useTranslations('atRisk')

  return (
    <span className={`inline-flex items-center gap-1 bg-error text-on-error text-[10px] font-bold px-1.5 py-0.5 rounded-full ${className}`}>
      <AlertTriangle size={12} />
      <span>{t('title')}</span>
    </span>
  )
}
