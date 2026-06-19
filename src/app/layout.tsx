// Root layout — minimal wrapper, locale layout handles lang/dir on <html>
// This file exists to satisfy Next.js App Router requirements

import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'نظام العيادة البيطرية',
  description: 'نظام متابعة المرضى والمواعيد البيطرية',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
