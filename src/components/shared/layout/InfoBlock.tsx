import React from 'react'

interface InfoBlockProps {
  children: React.ReactNode
  className?: string
}

export function InfoBlock({ children, className = '' }: InfoBlockProps) {
  return (
    <div className={`ps-4 border-s-4 border-outline-variant/30 text-sm text-on-surface whitespace-pre-line py-1 ${className}`}>
      {children}
    </div>
  )
}
