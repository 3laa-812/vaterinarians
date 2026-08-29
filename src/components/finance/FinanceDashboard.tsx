'use client'

import React, { useState } from 'react'
import { Card } from '@/components/shared/Card'
import { TrendingUp, TrendingDown, DollarSign, AlertCircle, Plus, PieChart, Activity, Wallet } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { RecordExpenseModal } from './RecordExpenseModal'
import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api/client'

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Legend
} from 'recharts'
import { Button } from '@/components/shared/Button'

export function FinanceDashboard({ data, month, year }: { data: any; month: number; year: number }) {
  const t = useTranslations('finance')
  const { pl, alerts } = data
  const [expenseModalOpen, setExpenseModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'reports'>('overview')

  // Chart Date Range - default to last 30 days
  const [dateRange] = useState({
    startDate: new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  })

  // Fetch reports data
  const { data: reportsData, isLoading: reportsLoading } = useQuery({
    queryKey: ['financial-reports', dateRange],
    queryFn: async () => {
      const q = new URLSearchParams(dateRange).toString()
      return apiClient.get(`/api/reports/financial?${q}`)
    }
  })

  const chartData = (reportsData as any)?.chartData || []

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        
        {/* Custom Tab Navigation */}
        <div className="flex p-1 bg-surface-container-low border border-outline-variant/30 rounded-2xl w-full sm:w-auto overflow-hidden">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'overview' 
                ? 'bg-primary text-on-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <Activity size={18} /> {t('overview')}
          </button>
          <button
            onClick={() => setActiveTab('reports')}
            className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all duration-300 ${
              activeTab === 'reports' 
                ? 'bg-primary text-on-primary shadow-sm' 
                : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container'
            }`}
          >
            <PieChart size={18} /> {t('reports')}
          </button>
        </div>

        <Button onClick={() => setExpenseModalOpen(true)} className="flex justify-center items-center gap-2 w-full sm:w-auto shadow-md hover:shadow-lg transition-shadow rounded-2xl">
          <Plus size={18} /> {t('addExpense')}
        </Button>
      </div>

      <RecordExpenseModal opened={expenseModalOpen} onClose={() => setExpenseModalOpen(false)} />

      {activeTab === 'overview' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
          {/* ROW 1: KPIs */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <Card className="flex flex-col p-5 md:p-6 rounded-[24px] shadow-sm hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 border-outline-variant/30 bg-surface">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <TrendingUp size={22} />
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant uppercase tracking-wider font-bold">{t('revenue')}</p>
              </div>
              <div className="flex flex-col mt-auto">
                <p className="text-2xl md:text-3xl font-black text-on-surface tracking-tight mb-1">{pl.revenues.total.toLocaleString()} <span className="text-sm font-bold text-on-surface-variant uppercase">{t('currency')}</span></p>
                {pl.revenueGrowth !== null && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center self-start ${pl.revenueGrowth >= 0 ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'}`}>
                    {pl.revenueGrowth >= 0 ? '+' : ''}{pl.revenueGrowth}%
                  </span>
                )}
              </div>
            </Card>

            <Card className="flex flex-col p-5 md:p-6 rounded-[24px] shadow-sm hover:shadow-lg hover:shadow-error/5 hover:-translate-y-1 transition-all duration-300 border-outline-variant/30 bg-surface">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-error/10 text-error">
                  <TrendingDown size={22} />
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant uppercase tracking-wider font-bold">{t('expenses')}</p>
              </div>
              <div className="flex flex-col mt-auto">
                <p className="text-2xl md:text-3xl font-black text-on-surface tracking-tight mb-1">{pl.expenses.total.toLocaleString()} <span className="text-sm font-bold text-on-surface-variant uppercase">{t('currency')}</span></p>
                {pl.expenseGrowth !== null && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center self-start ${pl.expenseGrowth <= 0 ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'}`}>
                    {pl.expenseGrowth > 0 ? '+' : ''}{pl.expenseGrowth}%
                  </span>
                )}
              </div>
            </Card>

            <Card className="flex flex-col p-5 md:p-6 rounded-[24px] shadow-sm hover:shadow-lg hover:shadow-secondary/5 hover:-translate-y-1 transition-all duration-300 border-outline-variant/30 bg-surface">
              <div className="flex items-center gap-3 mb-6">
                <div className={`p-3 rounded-xl shrink-0 me-4 shadow-sm ring-1 ring-inset ${pl.netProfit >= 0 ? 'bg-green-500/15 ring-green-500/20' : 'bg-red-500/15 ring-red-500/20'}`}>
                  <Wallet className={`h-6 w-6 ${pl.netProfit >= 0 ? 'text-green-600' : 'text-red-600'}`} />
                </div>
              </div>
              <div className="flex flex-col mt-auto">
                <p className={`text-2xl md:text-3xl font-black tracking-tight mb-1 ${pl.netProfit >= 0 ? 'text-green-600' : 'text-error'}`}>
                  {pl.netProfit.toLocaleString()} <span className="text-sm font-bold text-on-surface-variant uppercase">{t('currency')}</span>
                </p>
                {pl.profitGrowth !== null && (
                  <span className={`text-xs px-2.5 py-1 rounded-full font-bold shadow-sm inline-flex items-center self-start ${pl.profitGrowth >= 0 ? 'bg-green-500/15 text-green-600' : 'bg-red-500/15 text-red-600'}`}>
                    {pl.profitGrowth >= 0 ? '+' : ''}{pl.profitGrowth}%
                  </span>
                )}
              </div>
            </Card>

            <Card className="flex flex-col p-5 md:p-6 rounded-[24px] shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 border-outline-variant/30 bg-surface">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-2xl bg-primary/10 text-primary">
                  <Activity size={22} />
                </div>
                <p className="text-xs md:text-sm text-on-surface-variant uppercase tracking-wider font-bold">{t('profitMargin')}</p>
              </div>
              <div className="flex flex-col mt-auto">
                <p className="text-2xl md:text-3xl font-black text-on-surface tracking-tight mb-1">{pl.profitMargin}%</p>
                <span className="text-xs px-2.5 py-1 rounded-full font-bold shadow-sm bg-surface-container text-on-surface-variant inline-flex items-center self-start">
                  Margin
                </span>
              </div>
            </Card>
          </div>

          {/* ROW 4: Alerts */}
          {alerts && alerts.length > 0 && (
            <Card className="bg-error/5 border-error/20 p-6 md:p-8 rounded-[24px] shadow-sm">
              <h3 className="text-lg md:text-xl font-black tracking-tight text-error mb-4 flex items-center gap-2">
                <AlertCircle size={20} /> {t('actionNeeded')}
              </h3>
              <div className="space-y-3">
                {alerts.map((alert: any, i: number) => (
                  <div key={i} className="flex items-center gap-3 bg-surface/50 p-4 rounded-xl border border-error/10">
                    <AlertCircle size={18} className="text-error" />
                    <span className="text-sm font-semibold text-on-surface">{alert.message}</span>
                    {alert.amount && <span className="text-sm font-black text-on-surface ms-auto">{alert.amount.toLocaleString()} <span className="text-xs text-on-surface-variant">{t('currency')}</span></span>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
          {/* ROW 2: Chart */}
          <Card className="p-6 md:p-8 h-[450px] border-outline-variant/30 shadow-sm rounded-[24px] bg-surface">
            <h3 className="text-lg md:text-xl font-black tracking-tight text-on-surface mb-6">{t('revenueVsCollected')}</h3>
            {reportsLoading ? (
              <div className="h-full w-full bg-surface-container-low animate-pulse rounded-2xl" />
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-on-surface-variant font-medium bg-surface-container-lowest rounded-2xl border border-dashed border-outline-variant/50">
                {t('noData')}
              </div>
            ) : (
              <div style={{ width: '100%', height: 350 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 30 }} barGap={8} barCategoryGap={32}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={1}/>
                        <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.6}/>
                      </linearGradient>
                      <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-tertiary)" stopOpacity={1}/>
                        <stop offset="95%" stopColor="var(--color-tertiary)" stopOpacity={0.6}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--color-outline-variant)" opacity={0.3} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 500 }}
                      dy={15}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 12, fontWeight: 500 }}
                      tickFormatter={(value) => `${value}`}
                      dx={-10}
                    />
                    <Tooltip 
                      cursor={{ fill: 'var(--color-surface-container-highest)', opacity: 0.4 }}
                      contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', padding: '12px 16px', fontWeight: 600 }}
                      labelStyle={{ color: 'var(--color-on-surface-variant)', marginBottom: '8px', fontSize: '13px' }}
                      itemStyle={{ paddingTop: '8px' }}
                    />
                    <Legend 
                      wrapperStyle={{ paddingTop: '30px', fontSize: '13px', fontWeight: 600 }} 
                      iconType="circle"
                      iconSize={10}
                    />
                    <Bar dataKey="revenue" name={t('totalRevenue')} fill="url(#colorRevenue)" radius={[8, 8, 8, 8]} barSize={16} />
                    <Bar dataKey="collected" name={t('collected')} fill="url(#colorCollected)" radius={[8, 8, 8, 8]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </Card>

          {/* ROW 3: Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
            <Card className="p-6 md:p-8 rounded-[24px] border-outline-variant/30 shadow-sm bg-surface">
              <h3 className="text-lg md:text-xl font-black tracking-tight text-on-surface mb-8">{t('revenueBreakdown')}</h3>
              <div className="space-y-6">
                {pl.revenues.breakdown.map((item: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-on-surface-variant font-semibold">{item.category}</span>
                      <span className="font-black text-on-surface">{item.amount.toLocaleString()} <span className="text-xs opacity-70">{t('currency')}</span> ({item.percent}%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                      <div className="bg-primary h-full rounded-full transition-all duration-1000" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
                {pl.revenues.breakdown.length === 0 && <p className="text-on-surface-variant font-medium bg-surface-container-lowest p-4 rounded-xl text-center border border-dashed border-outline-variant/50">{t('noRevenueData')}</p>}
              </div>
            </Card>

            <Card className="p-6 md:p-8 rounded-[24px] border-outline-variant/30 shadow-sm bg-surface">
              <h3 className="text-lg md:text-xl font-black tracking-tight text-on-surface mb-8">{t('expenseBreakdown')}</h3>
              <div className="space-y-6">
                {pl.expenses.byCategory.map((item: any, i: number) => (
                  <div key={i}>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-on-surface-variant font-semibold">{item.category}</span>
                      <span className="font-black text-on-surface">{item.amount.toLocaleString()} <span className="text-xs opacity-70">{t('currency')}</span> ({item.percent}%)</span>
                    </div>
                    <div className="w-full bg-surface-container-high rounded-full h-2.5 overflow-hidden">
                      <div className="bg-error h-full rounded-full transition-all duration-1000" style={{ width: `${item.percent}%` }}></div>
                    </div>
                  </div>
                ))}
                {pl.expenses.byCategory.length === 0 && <p className="text-on-surface-variant font-medium bg-surface-container-lowest p-4 rounded-xl text-center border border-dashed border-outline-variant/50">{t('noExpenseData')}</p>}
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
