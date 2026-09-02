'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase'
import { useAppStore } from '@/store/auth-store'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export default function AuthCallbackPage() {
  const router = useRouter()

  useEffect(() => {
    const handleAuth = async () => {
      // Supabase JS will automatically parse the hash (#access_token=...)
      // and establish a session if it's an implicit or PKCE callback.
      const { data: { session }, error } = await supabase.auth.getSession()
      
      if (error || !session) {
        toast.error('Giriş yapılamadı.')
        router.push('/')
        return
      }

      // We have a Supabase session. Now we sync it with our backend to get the local custom token.
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/auth/sync', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ access_token: session.access_token }),
        })
        
        const data = await res.json()
        if (res.ok && data.token && data.user) {
          useAppStore.getState().setAuth(data.token, data.user)
          router.push('/')
        } else {
          toast.error(data.error || 'Senkronizasyon hatası')
          router.push('/')
        }
      } catch {
        toast.error('Bağlantı hatası')
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