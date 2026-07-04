'use client'

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, ReferenceLine,
} from 'recharts'
import { useLocale, useTranslations } from 'next-intl'
import type { WeightRecord } from '@prisma/client'

interface WeightChartProps {
  records:      WeightRecord[]
  targetWeight?: number | null
}

export function WeightChart({ records, targetWeight }: WeightChartProps) {
  const locale = useLocale()
  const t      = useTranslations('animal')

  if (records.length < 2) {
    return (
      <div className="flex items-center justify-center h-28 text-sm text-on-surface-variant">
        {t('notEnoughWeightData')}
      </div>
    )
  }

  const sorted = [...records].sort(
    (a, b) => new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime()
  )

  const data = sorted.map((r) => ({
    date:   new Date(r.recordedAt).toLocaleDateString(
      locale === 'ar' ? 'ar-EG' : 'en-US',
      { month: 'short', day: 'numeric' }
    ),
    weight: r.weight,
  }))

  const weights = sorted.map((r) => r.weight)
  const minY    = Math.max(0, Math.floor(Math.min(...weights) - 2))
  const maxY    = Math.ceil(Math.max(...weights) + 2)

  return (
    <ResponsiveContainer width="100%" height={200}>
      <LineChart data={data} margin={{ top: 5, right: 10, left: -15, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
        <XAxis
          dataKey="date"
          tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          domain={[minY, maxY]}
          tick={{ fill: 'var(--color-on-surface-variant)', fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}`}
        />
        <Tooltip
          contentStyle={{
            background:   'var(--color-surface-container)',
            border:       '1px solid var(--color-outline-variant)',
            borderRadius: '12px',
            color:        'var(--color-on-surface)',
            fontSize:     13,
          }}
          formatter={(value: any) => [`${value} ${t('kg')}`, '']}
        />
        {targetWeight && (
          <ReferenceLine
            y={targetWeight}
            stroke="var(--color-secondary)"
            strokeDasharray="6 4"
            label={{
              value:    t('targetWeight'),
              fill:     'var(--color-secondary)',
              fontSize: 10,
              position: 'insideTopRight',
            }}
          />
        )}
        <Line
          type="monotone"
          dataKey="weight"
          stroke="var(--color-primary)"
          strokeWidth={2.5}
          dot={{ fill: 'var(--color-primary)', r: 4, strokeWidth: 0 }}
          activeDot={{ r: 6 }}
        />
      </LineChart>
    </ResponsiveContainer>
  )
}
