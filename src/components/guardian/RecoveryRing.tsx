'use client'

import { useEffect, useState } from 'react'

interface RecoveryRingProps {
  progress: number
  size?: number
  strokeWidth?: number
  children?: React.ReactNode
  active?: boolean
}

export function RecoveryRing({
  progress,
  size = 60,
  strokeWidth = 4,
  children,
}: RecoveryRingProps) {
  const radius = 26
  const circumference = 2 * Math.PI * radius
  const clamped = Math.max(0, Math.min(100, progress))
  const offset = circumference - (clamped / 100) * circumference
  const [dashOffset, setDashOffset] = useState(circumference)

  useEffect(() => {
    const t = requestAnimationFrame(() => setDashOffset(offset))
    return () => cancelAnimationFrame(t)
  }, [offset])

  return (
    <div className="ring-wrap">
      <svg width={size} height={size}>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={radius} strokeWidth={strokeWidth} />
        <circle
          className="ring-progress"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
        />
      </svg>
      <div
        className="ring-avatar"
        style={{
          width: size - 16,
          height: size - 16,
          fontSize: size > 50 ? 16 : 14,
        }}
      >
        {children}
      </div>
    </div>
  )
}
