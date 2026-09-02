'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { KeyRound, ArrowLeft, Loader2, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardFooter } from '@/components/ui/card'
import { supabase } from '@/lib/supabase'
import { useRouter } from 'next/navigation'
import Image from 'next/image'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [sessionChecked, setSessionChecked] = useState(false)
  const router = useRouter()

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSessionChecked(true)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
        setSessionChecked(true)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    
    if (password.length < 6) {
      setError('Şifre en az 6 karakter olmalıdır.')
      return
    }
    if (password !== confirmPassword) {
      setError('Şifreler eşleşmiyor.')
      return
    }

    setLoading(true)
    try {
      const { error } = await supabase.auth.updateUser({ password })
      if (error) {
        setError(error.message)
      } else {
        setSuccess(true)
        await supabase.auth.signOut()
      }
    } catch (err: any) {
      setError(err.message || 'Bir hata oluştu')
    } finally {
      setLoading(false)
    }
  }

  const handleGoHome = () => {
    const search = typeof window !== 'undefined' ? window.location.search : ''
    router.push('/' + search)
  }

  if (!sessionChecked) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  if (success) {
    return (
      <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
        <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
          <div className="h-[500px] w-[500px] rounded-full bg-[#FCA311]/10 blur-[120px]" />
        </div>
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="relative z-10 w-full max-w-sm">
          <Card className="glass-card shadow-2xl">
            <CardHeader className="flex flex-col items-center gap-4 pb-2 pt-8">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="flex size-20 items-center justify-center rounded-2xl bg-gradient-to-br from-green-400 to-green-600">
                <CheckCircle2 className="size-10 text-white" strokeWidth={2} />
              </motion.div>
              <h2 className="text-xl font-bold text-foreground">Şifre Güncellendi</h2>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-3 px-6 pb-6">
              <p className="text-center text-sm leading-relaxed text-muted-foreground">
                Yeni şifreniz başarıyla kaydedildi. Artık yeni şifrenizle giriş yapabilirsiniz.
              </p>
            </CardContent>
            <CardFooter className="justify-center pb-6 pt-0">
              <Button onClick={handleGoHome} className="rounded-full bg-gradient-to-r from-[#FCA311] to-[#e8960f] font-semibold text-black hover-shine">
                Giriş Yapmaya Git
              </Button>
            </CardFooter>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-background px-4 py-8">
      <div className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2" aria-hidden="true">
        <div className="h-[500px] w-[500px] rounded-full bg-[#FCA311]/10 blur-[120px]" />
      </div>

      <motion.div initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 w-full max-w-md">
        <Card className="glass-card shadow-2xl">
          <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-6">
            <Image src="/aliver-logo-light.png" alt="ALIVER" width={200} height={65} className="mb-4 h-auto w-48" priority />
            <h2 className="text-xl font-bold text-foreground">Yeni Şifre Belirle</h2>
            <p className="text-center text-sm text-muted-foreground">Hesabınız için yeni bir şifre girin.</p>
          </CardHeader>

          <CardContent className="pt-4">
            <form onSubmit={handleUpdate} className="flex flex-col gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="password">Yeni Şifre</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="glass-input"
                  placeholder="En az 6 karakter"
                  required
                />
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="confirmPassword">Şifreyi Onayla</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="glass-input"
                  placeholder="Şifreyi tekrar girin"
                  required
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.p initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="text-sm text-red-400">
                    {error}
                  </motion.p>
                )}
              </AnimatePresence>

              <Button type="submit" disabled={loading} className="mt-2 h-11 w-full rounded-full bg-gradient-to-r from-[#FCA311] to-[#e8960f] font-semibold text-black hover-shine disabled:opacity-70">
                {loading ? <Loader2 className="size-4 animate-spin" /> : 'Şifreyi Güncelle'}
              </Button>

              <button type="button" onClick={handleGoHome} className="mt-4 flex items-center justify-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground">
                <ArrowLeft className="size-4" />
                Ana Sayfaya Dön
              </button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}