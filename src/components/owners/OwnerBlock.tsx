'use client'

import { useTranslations } from 'next-intl'
import { Link } from '@/lib/i18n-navigation'
import type { OwnerListItem } from '@/types'
import { SpeciesTag } from '@/components/shared/SpeciesTag'
import { Card } from '@/components/shared/Card'
import { Button } from '@/components/shared/Button'
import { WhatsAppIcon } from '@/components/shared/WhatsAppIcon'
import { Modal } from '@/components/shared/Modal'
import { QRDisplay } from '@/components/guardian/QRDisplay'
import { useRegenerateQRToken } from '@/hooks/useOwners'
import { QrCode } from 'lucide-react'
import { useState } from 'react'

interface OwnerBlockProps {
  owner: OwnerListItem
  className?: string
}

export function OwnerBlock({ owner, className = '' }: OwnerBlockProps) {
  const t = useTranslations('owner')
  const tAnimal = useTranslations('animal')
  
  const [showQRModal, setShowQRModal] = useState(false)
  const [qrToken, setQrToken] = useState<string | null>(null)
  
  const regenerateMutation = useRegenerateQRToken(owner.id)

  const handleShowQR = async () => {
    try {
      const data = await regenerateMutation.mutateAsync()
      if (data.qrToken) {
        setQrToken(data.qrToken)
        setShowQRModal(true)
      }
    } catch (error) {
      console.error('Failed to regenerate QR', error)
    }
  }

  return (
    <>
    <Card className={`p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-6 mb-6">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">{owner.name}</h2>
          <p className="text-sm text-on-surface-variant mt-1 font-mono">{owner.phone}</p>
        </div>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/${owner.phone.startsWith('0') ? `+20${owner.phone.substring(1)}` : owner.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 bg-[#25D366] text-white px-4 py-2 text-sm rounded-xl font-bold hover:bg-[#20bd5a] transition-colors"
          >
            <WhatsAppIcon className="w-4 h-4" />
            WhatsApp
          </a>

          {owner.email && (
            <a href={`mailto:${owner.email}`}>
              <Button variant="secondary" className="px-4 py-2 text-sm">
                {t('email')}
              </Button>
            </a>
          )}
          
          <Button 
            variant="secondary" 
            className="px-4 py-2 text-sm flex items-center gap-2"
            onClick={handleShowQR}
            disabled={regenerateMutation.isPending}
          >
            <QrCode className="w-4 h-4" />
            {t('showQR')}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          {owner.address && (
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                {t('address')}
              </h3>
              <p className="text-sm text-on-surface">{owner.address}</p>
            </div>
          )}

          {owner.notes && (
            <div>
              <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-1">
                {t('notes')}
              </h3>
              <p className="text-sm text-on-surface bg-surface-container rounded-xl p-3">
                {owner.notes}
              </p>
            </div>
          )}
        </div>

        <div>
          <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-3">
            {t('animals')}
          </h3>
          {owner.animals.length === 0 ? (
            <p className="text-sm text-on-surface-variant italic">
              {t('noAnimals')}
            </p>
          ) : (
            <div className="space-y-2">
              {owner.animals.map((animal) => (
                <Link
                  key={animal.id}
                  href={`/animals/${animal.id}`}
                  className="flex items-center justify-between p-3 rounded-xl border border-outline-variant hover:bg-surface-container transition-all group"
                >
                  <span className="text-sm font-medium text-on-surface group-hover:text-primary transition-colors">
                    {animal.name}
                  </span>
                  <SpeciesTag species={animal.species} />
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
    
    <Modal isOpen={showQRModal} onClose={() => setShowQRModal(false)} title={t('guardianQR')}>
      {qrToken && <QRDisplay token={qrToken} />}
    </Modal>
    </>
  )
}
