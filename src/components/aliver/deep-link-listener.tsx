'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { App } from '@capacitor/app'

export default function DeepLinkListener() {
  const router = useRouter()

  useEffect(() => {
    let listener: any = null;

    const setupListener = async () => {
      try {
        if (typeof window !== 'undefined' && (window as any).Capacitor?.isNativePlatform()) {
          listener = await App.addListener('appUrlOpen', (data) => {
            try {
              const url = new URL(data.url)
              if (url.protocol === 'aliver:') {
                const route = '/' + url.host + url.pathname + url.search + url.hash
                router.push(route)
              }
            } catch (e) {
              console.error('Deep link parse error:', e)
            }
          })
        }
      } catch (e) {
        // Ignore
      }
    }
    
    setupListener()

    return () => {
      if (listener && typeof listener.remove === 'function') {
        listener.remove()
      }
    }
  }, [router])

  return null
}