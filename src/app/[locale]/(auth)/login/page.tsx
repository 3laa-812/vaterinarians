'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from '@/lib/i18n-navigation'
import { useTranslations } from 'next-intl'
import { Logo } from '@/components/brand/Logo'
import { LangToggle } from '@/components/shared/LangToggle'
import { Button } from '@/components/shared/Button'

export default function LoginPage() {
  const t = useTranslations('auth')
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

    router.push('/home')
    router.refresh()
  }

  return (
    <div className="w-full max-w-sm">
      <div className="flex justify-end mb-6">
        <LangToggle />
      </div>

      <div className="glass rounded-2xl p-8 shadow-medical">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size={56} />
          </div>
          <h1 className="text-2xl font-bold text-on-surface">{t('welcome')}</h1>
        </div>

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

          {error && (
            <p
              role="alert"
              className="text-sm text-error bg-error-container/30 rounded-lg px-3 py-2 border border-error/20"
            >
              {error}
            </p>
          )}

          <Button
            id="login-button"
            type="submit"
            disabled={loading}
            loading={loading}
            className="w-full mt-2 active:scale-[0.98]"
          >
            {t('loginButton')}
          </Button>
        </form>
      </div>
    </div>
  )
}
