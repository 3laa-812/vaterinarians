'use client'

import { useState } from 'react'
import { Loader2, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Button } from '@/components/shared/Button'
import { Input } from '@/components/shared/Input'
import { addExpenseAction } from '@/app/actions/finance.actions'
import { logger } from '@/lib/logger';

export function RecordExpenseModal({ opened, onClose }: { opened: boolean; onClose: () => void }) {
  const t = useTranslations('finance')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    try {
      await addExpenseAction(formData)
      onClose()
    } catch (err) {
      logger.error(err)
      alert(t('addExpenseError'))
    } finally {
      setLoading(false)
    }
  }

  if (!opened) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-surface-container w-full max-w-md rounded-2xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-4 border-b border-outline-variant">
          <h3 className="font-bold text-lg text-on-surface">{t('addExpense')}</h3>
          <button onClick={onClose} aria-label="Close" className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant transition-colors">
            <X size={20} />
          </button>
        </div>
        <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">{t('amount')} ({t('currency')})</label>
          <Input type="number" name="amount" required min="0" step="0.01" placeholder="0.00" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('category')}</label>
          <select 
            name="category" 
            required 
            className="w-full h-11 px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          >
            <option value="RENT">{t('category_RENT')}</option>
            <option value="UTILITIES">{t('category_UTILITIES')}</option>
            <option value="SALARIES">{t('category_SALARIES')}</option>
            <option value="MEDICAL_SUPPLIES">{t('category_MEDICAL_SUPPLIES')}</option>
            <option value="MAINTENANCE">{t('category_MAINTENANCE')}</option>
            <option value="MARKETING">{t('category_MARKETING')}</option>
            <option value="OTHER">{t('category_OTHER')}</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('description')}</label>
          <Input type="text" name="description" required placeholder="Ex: Internet Bill" />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('date')}</label>
          <Input type="date" name="date" required defaultValue={new Date().toISOString().split('T')[0]} />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">{t('notes')} (Optional)</label>
          <textarea 
            name="notes"
            rows={3}
            className="w-full px-3 py-2 rounded-xl border border-outline-variant bg-surface-container-low text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
          />
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-outline-variant/30 mt-6">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>{t('cancel')}</Button>
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin me-2" /> : null}
            {t('save')}
          </Button>
        </div>
      </form>
        </div>
      </div>
    </div>
  )
}
