'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useTranslations } from 'next-intl'
import { apiClient } from '@/lib/api/client'
import { useSession } from 'next-auth/react'
import { useRouter } from '@/lib/i18n-navigation'
import { useEffect } from 'react'
import { Card } from '@/components/shared/Card'
import { Input } from '@/components/shared/Input'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'

export default function ReportsPage() {
  const t = useTranslations('reports')
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return
    if (session && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLINIC_ADMIN') {
      router.replace('/home')
    }
  }, [session, status, router])

  const [dateRange, setDateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate:   new Date().toISOString().split('T')[0]
  })

  const { data, isLoading } = useQuery({
    queryKey: ['financial-reports', dateRange],
    queryFn: async () => {
      const q = new URLSearchParams(dateRange).toString()
      return apiClient.get(`/api/reports/financial?${q}`)
    }
  })

  const stats = (data as any)?.data?.summary || { totalRevenue: 0, totalCollected: 0, totalPending: 0 }
  const chartData = (data as any)?.data?.chartData || []

  if (status === 'loading' || (session && session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLINIC_ADMIN')) {
    return null
  }

  return (
    <div className="p-4 md:p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">{t('financialOverview')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t('subtitle')}</p>
        </div>
        
        <div className="flex items-center gap-3 bg-surface-container p-2 rounded-2xl border border-outline-variant">
          <Input 
            type="date" 
            value={dateRange.startDate}
            onChange={e => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="border-none bg-transparent"
          />
          <span className="text-on-surface-variant">-</span>
          <Input 
            type="date" 
            value={dateRange.endDate}
            onChange={e => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="border-none bg-transparent"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">{t('totalRevenue')}</span>
          <p className="text-3xl font-bold text-on-surface mt-2 font-mono">
            {stats.totalRevenue.toLocaleString()} {t('currency')}
          </p>
        </Card>
        
        <Card className="p-6 border-l-4 border-l-success">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">{t('collected')}</span>
          <p className="text-3xl font-bold text-success mt-2 font-mono">
            {stats.totalCollected.toLocaleString()} {t('currency')}
          </p>
        </Card>

        <Card className="p-6 border-l-4 border-l-warning">
          <span className="text-xs text-on-surface-variant uppercase tracking-wider font-semibold">{t('pending')}</span>
          <p className="text-3xl font-bold text-warning mt-2 font-mono">
            {stats.totalPending.toLocaleString()} {t('currency')}
          </p>
        </Card>
      </div>

      <Card className="p-6 h-[400px]">
        <h3 className="text-lg font-semibold text-on-surface mb-6">{t('revenueVsCollected')}</h3>
        {isLoading ? (
          <div className="h-full w-full bg-outline-variant/20 animate-pulse rounded-xl" />
        ) : chartData.length === 0 ? (
          <div className="h-full flex items-center justify-center text-on-surface-variant">
            {t('noData')}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis 
                dataKey="date" 
                tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
              />
              <YAxis 
                tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12 }} 
                axisLine={false} 
                tickLine={false}
                tickFormatter={(val) => val >= 1000 ? `${val/1000}k` : val}
              />
              <Tooltip 
                cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                contentStyle={{ 
                  background: 'var(--color-surface-container)', 
                  border: '1px solid var(--color-outline-variant)',
                  borderRadius: '12px',
                  color: 'var(--color-on-surface)'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: '20px' }} />
              <Bar dataKey="revenue" name={t('totalRevenue')} fill="var(--color-primary)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="collected" name={t('collected')} fill="var(--color-secondary)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        )}
      </Card>
    </div>
  )
}
