// Login page — email + password form, Arabic/English error messages
// Used by: doctors, clinic admins, super admin

'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useTranslations, useLocale } from 'next-intl'
import { PawPrint } from 'lucide-react'
import { LangToggle } from '@/components/shared/LangToggle'

export default function LoginPage() {
  const t = useTranslations('auth')
  const locale = useLocale()
  const router = useRouter()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await signIn('credentials', {
      email,
      password,
      redirect: false,
    })

    setLoading(false)

    if (result?.error) {
      setError(t('invalidCredentials'))
      return
    }

    router.push(`/${locale}/home`)
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      {/* Lang toggle */}
      <div className="flex justify-end mb-6">
        <LangToggle />
      </div>

      {/* Card */}
      <div className="glass rounded-2xl p-8 shadow-medical">
        {/* Logo / Title */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-4">
            <PawPrint size={32} className="text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('welcome')}</h1>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-on-surface-variant mb-1.5"
            >
              {t('email')}
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              className="w-full rounded-xl bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              placeholder="doctor@vetclinic.com"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-on-surface-variant mb-1.5"
            >
              {t('password')}
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              className="w-full rounded-xl bg-surface-container-low border border-outline-variant px-4 py-3 text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:border-primary transition-colors"
              placeholder="••••••••"
            />
          </div>

          {/* Error message */}
          {error && (
            <p
              role="alert"
              className="text-sm text-error bg-error-container/30 rounded-lg px-3 py-2 border border-error/20"
            >
              {error}
            </p>
          )}

          <button
            id="login-button"
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary text-on-primary font-semibold py-3 mt-2 hover:bg-primary/90 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? (
              <span className="inline-flex items-center gap-2">
                <span className="w-4 h-4 border-2 border-on-primary/30 border-t-on-primary rounded-full animate-spin" />
                {t('loginButton')}
              </span>
            ) : (
              t('loginButton')
            )}
          </button>
        </form>
      </div>
    </div>
  )
}
