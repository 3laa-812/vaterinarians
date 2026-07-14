import { AlertTriangle } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon'

export function AtRiskBanner({ phone }: { phone: string }) {
  const t = useTranslations('atRisk')

  // Clean the phone number to be Whatsapp compatible (assuming Egypt country code +20 if starts with 01)
  const whatsappNumber = phone.startsWith('0') ? `+20${phone.substring(1)}` : phone

  return (
    <div className="bg-error/10 border border-error/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 animate-slide-down mb-6">
      <div className="bg-error/20 text-error p-3 rounded-full flex-shrink-0">
        <AlertTriangle size={24} />
      </div>
      
      <div className="flex-1 text-center md:text-start">
        <h3 className="text-error font-bold text-lg">{t('title')}</h3>
        <p className="text-error/80 text-sm">{t('missedVisits')}</p>
      </div>

      <a
        href={`https://wa.me/${whatsappNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2.5 rounded-xl font-bold hover:bg-[#20bd5a] transition-colors"
      >
        <WhatsAppIcon className="w-[18px] h-[18px]" />
        {t('contactWhatsapp')}
      </a>
    </div>
  )
}
