import React from 'react'

interface MetaRowProps {
  items: (string | React.ReactNode | null | undefined)[]
  className?: string
}

export function MetaRow({ items, className = '' }: MetaRowProps) {
  const validItems = items.filter((item) => item !== null && item !== undefined && item !== '')

  if (validItems.length === 0) return null

  return (
    <div className={`flex flex-wrap items-center gap-2 ${className}`}>
      {validItems.map((item, index) => (
        <React.Fragment key={index}>
          <span className="inline-flex items-center text-sm text-on-surface-variant bg-surface-container px-2 py-1 rounded-md">
            {item}
          </span>
          {index < validItems.length - 1 && (
            <span className="text-outline-variant text-xs">•</span>
          )}
        </React.Fragment>
      ))}
    </div>
  )
}
