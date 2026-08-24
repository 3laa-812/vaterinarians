"use client";

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

/** Matches guardian-portal.html `.page.active` fadeUp entrance */
export function PageTransition({ children, className }: PageTransitionProps) {
  return <div className={`page active${className ? ` ${className}` : ""}`}>{children}</div>;
}
