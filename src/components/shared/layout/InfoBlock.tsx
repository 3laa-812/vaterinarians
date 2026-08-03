import React from 'react'

interface InfoBlockProps {
  children: React.ReactNode
  className?: string
}

export function InfoBlock({ children, className = '' }: InfoBlockProps) {
  return (
    <div className={`pl-4 border-l-4 border-outline-variant/30 text-sm text-on-surface whitespace-pre-line py-1 ${className}`}>
      {children}
    </div>
  )
}
