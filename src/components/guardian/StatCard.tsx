'use client'

import type { LucideIcon } from 'lucide-react'

type StatCardProps = {
  icon: LucideIcon
  value: number | string
  label: string
  iconBg: string
  iconColor: string
}

export function GuardianStatCard({ icon: Icon, value, label, iconBg, iconColor }: StatCardProps) {
  return (
    <div className="card stat-card">
      <div className="icon" style={{ background: iconBg, color: iconColor }}>
        <Icon width={18} height={18} strokeWidth={2} />
      </div>
      <div className="val num">{value}</div>
      <div className="lbl">{label}</div>
    </div>
  )
}
