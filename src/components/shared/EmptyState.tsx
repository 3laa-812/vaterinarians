// EmptyState — consistent "nothing here yet" block across every list page.

import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  message: string
}

export function EmptyState({ icon: Icon, message }: EmptyStateProps) {
  return (
    <div className="text-center py-16 rounded-2xl border border-outline-variant bg-surface-container-low">
      <Icon size={40} className="mx-auto mb-3 text-on-surface-variant" />
      <p className="text-on-surface-variant">{message}</p>
    </div>
  )
}
