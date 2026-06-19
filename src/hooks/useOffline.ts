// useOffline — detects when the browser loses/regains network connection

import { useEffect, useState } from 'react'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    // Initialize from current state
    setIsOffline(!navigator.onLine)

    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  return isOffline
}
