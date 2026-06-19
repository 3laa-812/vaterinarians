// Auth layout — no sidebar, centered card for login page

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <main className="min-h-screen flex items-center justify-center p-4 bg-[#0C0E14]">
      {children}
    </main>
  )
}
