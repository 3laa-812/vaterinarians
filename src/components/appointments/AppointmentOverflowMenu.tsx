'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical } from 'lucide-react'
import { Button } from '@/components/shared/Button'
import { useTranslations } from 'next-intl'

interface AppointmentOverflowMenuProps {
  onPostpone: () => void
  onMarkAbsent: () => void
}

export function AppointmentOverflowMenu({ onPostpone, onMarkAbsent }: AppointmentOverflowMenuProps) {
  const [isOpen, setIsOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)
  const t = useTranslations('appointment')

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={menuRef}>
      <Button 
        variant="secondary" 
        onClick={() => setIsOpen(!isOpen)}
        className="w-9 h-9 p-0 flex items-center justify-center rounded-xl"
        aria-label="More options"
      >
        <MoreVertical size={18} />
      </Button>

      {isOpen && (
        <div className="absolute left-0 bottom-full mb-2 w-32 bg-surface-container-high border border-outline-variant rounded-xl shadow-lg overflow-hidden z-50">
          <button 
            className="w-full text-start px-4 py-3 text-sm font-semibold text-secondary hover:bg-surface-container active:bg-surface transition-colors border-b border-outline-variant"
            onClick={() => {
              onPostpone()
              setIsOpen(false)
            }}
          >
            {t('status.POSTPONED')}
          </button>
          <button 
            className="w-full text-start px-4 py-3 text-sm font-semibold text-error hover:bg-surface-container active:bg-surface transition-colors"
            onClick={() => {
              onMarkAbsent()
              setIsOpen(false)
            }}
          >
            {t('status.ABSENT')}
          </button>
        </div>
      )}
    </div>
  )
}
