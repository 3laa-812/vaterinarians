'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { LangToggle } from '@/components/shared/LangToggle'
import { Button } from '@/components/shared/Button'
import { Eye, EyeOff } from 'lucide-react'

export default function LoginPage() {
  const t = useTranslations('auth')
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await signIn('credentials', { email, password, redirect: false })
    setLoading(false)
    if (result?.error) { setError(t('invalidCredentials')); return }
    router.push('/home')
    router.refresh()
  }

  return (
    <div className="min-h-screen bg-auth flex items-center justify-center p-4 relative">
      {/* Ambient circles */}
      <div className="absolute top-1/4 start-1/4 w-96 h-96 rounded-full bg-primary/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 end-1/4 w-64 h-64 rounded-full bg-tertiary/4 blur-3xl pointer-events-none" />

      {/* Lang toggle — top corner */}
      <div className="absolute top-5 end-5">
        <LangToggle />
      </div>

      <div className="w-full max-w-sm animate-slide-up">
        {/* Logo + headline */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 mb-4">
            <Logo size={36} />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('welcome')}</h1>
          <p className="text-sm text-on-surface-variant mt-1">{t('welcomeSubtitle')}</p>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-outline-variant bg-surface-container-low p-7 shadow-medical">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                {t('email')}
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-xl bg-surface-container border border-outline-variant px-4 py-3 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                placeholder="doctor@vetcare.com"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-on-surface-variant uppercase tracking-wider mb-2">
                {t('password')}
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                  className="w-full rounded-xl bg-surface-container border border-outline-variant px-4 py-3 pe-12 text-on-surface placeholder:text-on-surface-variant/40 focus:outline-none focus:border-primary transition-colors"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute end-3 top-1/2 -translate-y-1/2 text-on-surface-variant hover:text-on-surface transition-colors p-1"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-sm text-error bg-error-container/20 rounded-xl px-4 py-3 border border-error/20">
                <span className="mt-0.5">⚠</span>
                <span>{error}</span>
              </div>
            )}

            <Button type="submit" disabled={loading} loading={loading} className="w-full py-3.5 text-base">
              {t('loginButton')}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
