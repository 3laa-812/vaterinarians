// EmptyState — consistent "nothing here yet" block across every list page.

import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  message: string;
  title?: string;
  actionLabel?: string;
  onAction?: () => void;
  variant?: "default" | "guardian";
}

export function EmptyState({
  icon: Icon,
  message,
  title,
  actionLabel,
  onAction,
  variant = "default",
}: EmptyStateProps) {
  if (variant === "guardian") {
    return (
      <div className="empty">
        <div className="empty-icon">
          <Icon strokeWidth={2} />
        </div>
        {title && <h3>{title}</h3>}
        <p>{message}</p>
        {actionLabel && onAction && (
          <button type="button" className="btn btn-primary btn-sm" onClick={onAction}>
            {actionLabel}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="text-center py-16 rounded-2xl border border-outline-variant bg-surface-container-low">
      <Icon size={40} className="mx-auto mb-3 text-on-surface-variant" />
      {title && (
        <h3 className="text-lg font-bold mb-2 text-on-surface">{title}</h3>
      )}
      <p className="text-on-surface-variant">{message}</p>
      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-6 px-6 py-2 rounded-full font-bold shadow-sm transition-colors bg-primary text-on-primary hover:bg-primary/90"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
