'use client'

import { useTranslations, useLocale } from 'next-intl'
import Link from 'next/link'
import { FileText, Plus, Eye, Printer } from 'lucide-react'

export function InvoiceList({ initialData }: { initialData: any }) {
  const t = useTranslations('printing')
  const locale = useLocale()

  return (
    <div className="bg-surface-container-low rounded-2xl shadow-sm border border-outline-variant/50 overflow-hidden">
      {initialData.invoices.length === 0 ? (
        <div className="p-12 text-center">
          <div className="bg-surface-container w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText size={24} className="text-on-surface-variant" />
          </div>
          <h3 className="text-lg font-bold text-on-surface">{t('noInvoices')}</h3>
          <p className="text-on-surface-variant mt-1 text-sm max-w-sm mx-auto">
            {t('noInvoicesDesc')}
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-start">
            <thead className="bg-surface-container border-b border-outline-variant/50 text-on-surface-variant">
              <tr>
                <th className="px-6 py-4 font-semibold text-start">{t('invoiceNumber')}</th>
                <th className="px-6 py-4 font-semibold text-start">{t('date')}</th>
                <th className="px-6 py-4 font-semibold text-start">{t('owner')}</th>
                <th className="px-6 py-4 font-semibold text-start">{t('total')}</th>
                <th className="px-6 py-4 font-semibold text-end">{t('actions')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-outline-variant/30">
              {initialData.invoices.map((invoice: any) => (
                <tr
                  key={invoice.id}
                  className="hover:bg-surface-container-lowest transition-colors group"
                >
                  <td className="px-6 py-4 font-medium text-on-surface">
                    {invoice.invoiceNumber}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {new Date(invoice.createdAt).toLocaleDateString(
                      locale === 'ar' ? 'ar-EG' : 'en-US'
                    )}
                  </td>
                  <td className="px-6 py-4 text-on-surface-variant">
                    {invoice.owner?.name || '—'}
                  </td>
                  <td className="px-6 py-4 font-medium text-on-surface">
                    {invoice.total.toLocaleString()} EGP
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-2 transition-opacity">
                      <Link
                        href={`/${locale}/invoices/${invoice.id}`}
                        className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors flex items-center gap-2"
                        title={t('printPreview', { defaultMessage: 'Print Preview' })}
                      >
                        <Printer size={18} />
                        <span className="text-xs font-semibold">{t('print', { defaultMessage: 'Print' })}</span>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
