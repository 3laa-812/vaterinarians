import React from 'react'

interface StatGridProps {
  children: React.ReactNode
  className?: string
  minCardWidth?: string // e.g. '200px'
}

export function StatGrid({ children, className = '', minCardWidth = '200px' }: StatGridProps) {
  return (
    <div 
      className={`grid gap-4 ${className}`}
      style={{
        gridTemplateColumns: `repeat(auto-fit, minmax(${minCardWidth}, 1fr))`
      }}
    >
      {children}
    </div>
  )
}
