'use client'

import { useEffect, useState, useRef } from 'react'
import { PawPrint, Loader2, QrCode, Camera } from 'lucide-react'
import { useRouter } from '@/lib/i18n-navigation'
import { useSearchParams } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { signIn } from 'next-auth/react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import { Button } from '@/components/shared/Button'

export default function GuardianLoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get('token')
  const t = useTranslations('guardian')

  const [loading, setLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')
  const [showScanner, setShowScanner] = useState(false)
  const [manualToken, setManualToken] = useState('')
  const videoRef = useRef<HTMLVideoElement>(null)

  useEffect(() => {
    if (token) {
      handleTokenLogin(token)
    }
  }, [token])

  useEffect(() => {
    let reader: BrowserMultiFormatReader | null = null
    if (showScanner && videoRef.current) {
       reader = new BrowserMultiFormatReader()
       reader.decodeFromVideoDevice(undefined, videoRef.current, (result, error) => {
          if (result) {
            const text = result.getText()
            let extractedToken = text
            try {
              const url = new URL(text)
              const urlToken = url.searchParams.get('token')
              if (urlToken) extractedToken = urlToken
            } catch (e) {}
            
            handleTokenLogin(extractedToken)
            setShowScanner(false)
          }
       }).catch((err) => {
          console.error(err)
          setErrorMsg('Camera access denied or unavailable.')
          setShowScanner(false)
       })
    }
    return () => {
       if (reader) (reader as any).reset()
    }
  }, [showScanner])

  const handleTokenLogin = async (qrToken: string) => {
    setLoading(true)
    setErrorMsg('')
    try {
      const res = await signIn('guardian-qr', {
        token: qrToken,
        redirect: false,
      })

      if (res?.error) {
        setErrorMsg('Invalid or expired QR code.')
        toast.error('Invalid or expired QR code.')
      } else {
        toast.success(t('welcome'))
        router.push('/guardian') // Or /portal once routes are restructured
      }
    } catch (error: any) {
      setErrorMsg(error.message || 'Verification failed')
      toast.error(error.message || 'Verification failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="guardian-theme min-h-screen bg-guardian-bg text-guardian-text flex flex-col justify-center py-12 px-4 sm:px-6 relative overflow-hidden">
      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-guardian-surface py-10 px-6 shadow-[0_4px_20px_rgba(28,25,23,0.05)] rounded-3xl border border-stone-100">
          <div className="flex flex-col gap-8">
            <div className="flex justify-center">
              <div className="bg-primary p-5 rounded-2xl text-white shadow-md">
                <PawPrint size={42} strokeWidth={2.5} />
              </div>
            </div>

            <div className="text-center">
              <h2 className="text-2xl font-bold tracking-tight">
                {t('welcome')}
              </h2>
              <p className="mt-2 text-sm text-guardian-text-muted">
                Guardian Access
              </p>
            </div>

            <div className="flex flex-col items-center justify-center text-center gap-4">
              {loading ? (
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="animate-spin text-primary" size={32} />
                  <p className="text-guardian-text-muted font-medium">Verifying your QR code...</p>
                </div>
              ) : showScanner ? (
                <div className="w-full flex flex-col gap-4">
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-black">
                    <video ref={videoRef} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 border-2 border-primary/50 m-8 rounded-xl pointer-events-none" />
                  </div>
                  <Button variant="secondary" onClick={() => setShowScanner(false)} className="w-full">
                    Cancel Scan
                  </Button>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-4">
                  <div className="p-6 bg-guardian-bg border border-stone-200 rounded-2xl shadow-sm">
                    <QrCode size={64} className="text-primary/80 mb-4 mx-auto" />
                    <p className="text-sm font-medium mb-4">
                      Scan the QR code provided by the clinic to access your pet's file.
                    </p>
                    <Button onClick={() => setShowScanner(true)} className="w-full flex justify-center items-center gap-2">
                      <Camera size={18} /> Open Camera
                    </Button>
                  </div>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-stone-200" />
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-guardian-surface text-guardian-text-muted">Or enter code manually</span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      placeholder="Access Token" 
                      value={manualToken}
                      onChange={(e) => setManualToken(e.target.value)}
                      className="flex-1 bg-guardian-bg border border-stone-200 rounded-xl px-4 focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                    <Button onClick={() => handleTokenLogin(manualToken)} disabled={!manualToken.trim()}>
                      Submit
                    </Button>
                  </div>

                  {errorMsg && (
                    <p className="text-red-500 text-sm font-semibold mt-2">{errorMsg}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
