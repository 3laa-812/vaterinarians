'use client'

import { useEffect, useState, useRef } from 'react'
import { Keyboard, Check, Loader2 } from 'lucide-react'
import { useRouter } from '@/lib/i18n-navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { BrowserMultiFormatReader } from '@zxing/browser'

export default function GuardianLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('guardian')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showManual, setShowManual] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const [scanState, setScanState] = useState<'idle' | 'scanning' | 'success'>('idle')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (token) handleTokenLogin(token)
  }, [token])

  useEffect(() => {
    let reader: BrowserMultiFormatReader | null = null
    if (!showManual && videoRef.current) {
      reader = new BrowserMultiFormatReader()
      reader
        .decodeFromVideoDevice(undefined, videoRef.current, (result) => {
          if (result) {
            let extractedToken = result.getText()
            try {
              const url = new URL(extractedToken)
              const urlToken = url.searchParams.get('token')
              if (urlToken) extractedToken = urlToken
            } catch {
              /* plain token */
            }
            setScanState('scanning')
            handleTokenLogin(extractedToken)
          }
        })
        .catch(() => setErrorMsg(t('cameraUnavailable')))
    }
    return () => {
      if (reader && typeof (reader as any).reset === 'function') (reader as any).reset()
    }
  }, [showManual])

  const handleTokenLogin = async (qrToken: string) => {
    setLoading(true)
    setErrorMsg('')
    setScanState('scanning')
    try {
      const res = await signIn('guardian-qr', { token: qrToken, redirect: false })
      if (res?.error) {
        setScanState('idle')
        setErrorMsg(t('invalidQr'))
        toast.error(t('invalidQr'))
      } else {
        setScanState('success')
        toast.success(t('welcome'))
        setTimeout(() => router.push('/guardian'), 450)
      }
    } catch (error: unknown) {
      setScanState('idle')
      const msg = error instanceof Error ? error.message : t('verifyFailed')
      setErrorMsg(msg)
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={`qr-auth${scanState === 'success' ? ' leaving' : ''}`}>
      <div className="qr-auth-inner">
        <span className="qr-eyebrow">
          <span className="liveDot" />
          {t('qrReady')}
        </span>
        <h1 className="qr-title">{t('qrWelcomeTitle')}</h1>
        <p className="qr-sub">{t('qrWelcomeSub')}</p>

        <div className={`qr-frame${scanState === 'scanning' ? ' scanning' : ''}${scanState === 'success' ? ' success' : ''}`}>
          <span className="qr-corner tl" />
          <span className="qr-corner tr" />
          <span className="qr-corner bl" />
          <span className="qr-corner br" />
          {!showManual && scanState !== 'success' && (
            <>
              <video ref={videoRef} className="absolute inset-0 h-full w-full object-cover" playsInline muted />
              <span className="qr-scanline" />
            </>
          )}
          {loading && (
            <div className="absolute inset-0 z-10 flex items-center justify-center bg-[rgba(251,250,238,0.85)]">
              <Loader2 className="animate-spin text-[var(--pulse)]" size={40} />
            </div>
          )}
          <div className="qr-status">
            <div className="qr-status-circle">
              <Check strokeWidth={3} />
            </div>
          </div>
        </div>

        {errorMsg && <p className="muted" style={{ marginBottom: 16, color: 'var(--danger)' }}>{errorMsg}</p>}

        <div className="qr-actions">
          <button type="button" className="btn btn-primary btn-block qr-manual-btn" onClick={() => setShowManual(true)}>
            <Keyboard width={17} height={17} strokeWidth={2} />
            {t('manualLogin')}
          </button>
          <button type="button" className="btn btn-ghost btn-block qr-help" onClick={() => toast.message(t('qrHelpToast'))}>
            {t('needHelp')}
          </button>
        </div>
      </div>

      <div className={`manual-sheet${showManual ? ' open' : ''}`}>
        <div className="manual-backdrop" onClick={() => setShowManual(false)} role="presentation" />
        <div className="manual-card">
          <button type="button" className="manual-close" onClick={() => setShowManual(false)} aria-label={t('close')}>
            ×
          </button>
          <div className="manual-sheet-handle" />
          <div className="auth-mark">VC</div>
          <h2 style={{ fontSize: 18, fontWeight: 800, color: 'var(--olive)', marginBottom: 6 }}>{t('manualLoginTitle')}</h2>
          <p className="muted" style={{ fontSize: 12.5, marginBottom: 22 }}>{t('manualLoginSub')}</p>

          <label className="field-label" style={{ textAlign: 'right' }}>
            {t('manualTokenLabel')}
          </label>
          <input
            className="input"
            style={{ direction: 'ltr', textAlign: 'right', marginBottom: 18 }}
            placeholder={t('manualTokenPlaceholder')}
            value={manualToken}
            onChange={(e) => setManualToken(e.target.value)}
          />
          <button
            type="button"
            className="btn btn-primary btn-block"
            disabled={!manualToken.trim() || loading}
            onClick={() => handleTokenLogin(manualToken.trim())}
          >
            {loading ? t('verifying') : t('verifyLogin')}
          </button>
        </div>
      </div>
    </div>
  )
}
