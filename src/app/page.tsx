// Root page — redirects to the Arabic home (default locale)

import { redirect } from 'next/navigation'

export default function RootPage() {
  redirect('/ar/home')
}
