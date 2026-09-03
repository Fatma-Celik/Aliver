'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useAppStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()
  const handled = useRef(false)

  useEffect(() => {
    if (handled.current) return
    handled.current = true

    const handleAuth = async () => {
      // 1) Hash'ten access_token'ı doğrudan parse et
      const hash = window.location.hash
      if (!hash) {
        toast.error('Giriş bilgisi bulunamadı.')
        router.push('/')
        return
      }

      const params = new URLSearchParams(hash.substring(1))
      const accessToken = params.get('access_token')

      if (!accessToken) {
        toast.error('Access token bulunamadı.')
        router.push('/')
        return
      }

      // 2) Token'ı backend'e gönder ve lokal JWT + user bilgisini al
      try {
        const res = await fetch(
          (process.env.NEXT_PUBLIC_APP_URL || '') + '/api/auth/sync',
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ access_token: accessToken }),
          }
        )

        const data = await res.json()
        if (res.ok && data.token && data.user) {
          useAppStore.getState().setAuth(data.token, data.user)
          toast.success('Giriş başarılı!')
          router.push('/')
        } else {
          toast.error(data.error || 'Giriş senkronizasyonu başarısız.')
          router.push('/')
        }
      } catch {
        toast.error('Sunucuya bağlanılamadı.')
        router.push('/')
      }
    }

    handleAuth()
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-black">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="size-10 animate-spin text-[#FCA311]" />
        <p className="text-white">Giriş yapılıyor, lütfen bekleyin...</p>
      </div>
    </div>
  )
}