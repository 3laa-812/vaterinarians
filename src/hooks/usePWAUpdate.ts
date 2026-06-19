// usePWAUpdate — detects when a new service worker is waiting
// Returns updateAvailable flag and applyUpdate function
// skipWaiting is false in next-pwa config, so updates only apply when doctor taps

import { useEffect, useState } from 'react'

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] =
    useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.ready.then((reg) => {
      setRegistration(reg)

      reg.addEventListener('updatefound', () => {
        const newWorker = reg.installing
        newWorker?.addEventListener('statechange', () => {
          if (
            newWorker.state === 'installed' &&
            navigator.serviceWorker.controller
          ) {
            setUpdateAvailable(true)
          }
        })
      })
    })
  }, [])

  function applyUpdate() {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  return { updateAvailable, applyUpdate }
}
