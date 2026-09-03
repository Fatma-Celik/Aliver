'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/auth-store'
import { toast } from 'sonner'

export default function DeepLinkListener() {
  const router = useRouter()

  useEffect(() => {
    let listener: any = null

    const setupListener = async () => {
      try {
        if (
          typeof window === 'undefined' ||
          !(window as any).Capacitor?.isNativePlatform()
        ) {
          return
        }

        const { App } = await import('@capacitor/app')

        listener = await App.addListener('appUrlOpen', async (data) => {
          try {
            const url = data.url

            // aliver://auth/callback#access_token=...
            // Check if this is an auth callback
            if (url.startsWith('aliver://auth/callback')) {
              const hashIndex = url.indexOf('#')
              if (hashIndex === -1) {
                toast.error('Giriş bilgisi bulunamadı.')
                return
              }

              const hashStr = url.substring(hashIndex + 1)
              const params = new URLSearchParams(hashStr)
              const accessToken = params.get('access_token')

              if (!accessToken) {
                toast.error('Access token bulunamadı.')
                return
              }

              // Directly sync with backend — don't navigate to callback page
              try {
                const res = await fetch(
                  (process.env.NEXT_PUBLIC_APP_URL || '') + '/api/auth/sync',
                  {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ access_token: accessToken }),
                  }
                )

                const resData = await res.json()
                if (res.ok && resData.token && resData.user) {
                  useAppStore.getState().setAuth(resData.token, resData.user)
                  toast.success('Google ile giriş başarılı!')
                  router.push('/')
                } else {
                  toast.error(resData.error || 'Giriş başarısız.')
                }
              } catch {
                toast.error('Sunucuya bağlanılamadı.')
              }
              return
            }

            // Other deep links — navigate normally
            const parsed = new URL(url)
            if (parsed.protocol === 'aliver:') {
              const route =
                '/' + parsed.host + parsed.pathname + parsed.search
              router.push(route)
            }
          } catch (e) {
            console.error('Deep link parse error:', e)
          }
        })
      } catch (e) {
        // Capacitor not available — ignore
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