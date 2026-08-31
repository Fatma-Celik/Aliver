'use client'

import { useState, type FormEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card'
import { useAppStore, type User } from '@/store/auth-store'

type AuthMode = 'login' | 'register'

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 80 : -80,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -80 : 80,
    opacity: 0,
  }),
}

export default function AuthScreen() {
  const [mode, setMode] = useState<AuthMode>('login')
  const [direction, setDirection] = useState(0)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const setAuth = useAppStore((s) => s.setAuth)

  const toggleMode = () => {
    setDirection(mode === 'login' ? 1 : -1)
    setMode((prev) => (prev === 'login' ? 'register' : 'login'))
    setError('')
    setName('')
    setEmail('')
    setPassword('')
    setShowPassword(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'register' && !name.trim()) {
      setError('Lütfen adınızı girin.')
      return
    }
    if (!email.trim()) {
      setError('Lütfen e-posta adresinizi girin.')
      return
    }
    if (!password) {
      setError('Lütfen şifrenizi girin.')
      return
    }

    setLoading(true)

    try {
      const endpoint =
        mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const body: Record<string, string> = { email, password }
      if (mode === 'register') body.name = name

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error || 'Bir hata oluştu. Lütfen tekrar deneyin.')
      }

      const data = await res.json()
      setAuth(data.token, data.user as User)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Beklenmeyen bir hata oluştu.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center bg-black px-4 py-8">
      {/* Decorative gold glow behind card */}
      <div
        className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        aria-hidden="true"
      >
        <div className="h-[500px] w-[500px] rounded-full bg-[#FCA311]/10 blur-[120px] sm:h-[600px] sm:w-[600px]" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="relative z-10 w-full max-w-md"
      >
        <Card className="glass-card shadow-2xl">
          {/* Header – Logo / Title */}
          <CardHeader className="flex flex-col items-center gap-2 pb-2 pt-2">
            <motion.h1
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-gradient-to-r from-[#FCA311] to-[#e8960f] bg-clip-text text-4xl font-extrabold tracking-tight text-transparent sm:text-5xl text-glow-gold"
            >
              ALIVER
            </motion.h1>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="text-sm text-white/60"
            >
              Aile Alışveriş Asistanınız
            </motion.p>
          </CardHeader>

          {/* Form body */}
          <CardContent className="pt-2">
            <AnimatePresence mode="wait" custom={direction}>
              <motion.form
                key={mode}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                onSubmit={handleSubmit}
                className="flex flex-col gap-5"
              >
                {/* Name – register only */}
                <AnimatePresence>
                  {mode === 'register' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                      className="overflow-hidden"
                    >
                      <div className="flex flex-col gap-2 pb-1">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-white/80"
                        >
                          Adınız
                        </Label>
                        <Input
                          id="name"
                          type="text"
                          placeholder="Adınızı girin"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          autoComplete="name"
                          className="h-11 border-[#FCA311]/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-[#FCA311] focus-visible:ring-[#FCA311]/30 glass-input"
                        />
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Email */}
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="email"
                    className="text-sm font-medium text-white/80"
                  >
                    E-posta
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ornek@mail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    autoComplete="email"
                    className="h-11 border-[#FCA311]/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-[#FCA311] focus-visible:ring-[#FCA311]/30 glass-input"
                  />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-2">
                  <Label
                    htmlFor="password"
                    className="text-sm font-medium text-white/80"
                  >
                    Şifre
                  </Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete={
                        mode === 'register'
                          ? 'new-password'
                          : 'current-password'
                      }
                      className="h-11 border-[#FCA311]/20 bg-black/40 pr-11 text-white placeholder:text-white/30 focus-visible:border-[#FCA311] focus-visible:ring-[#FCA311]/30 glass-input"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white/70"
                      aria-label={
                        showPassword ? 'Şifreyi gizle' : 'Şifreyi göster'
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Error message */}
                <AnimatePresence>
                  {error && (
                    <motion.p
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden text-sm text-red-400"
                    >
                      {error}
                    </motion.p>
                  )}
                </AnimatePresence>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="h-11 w-full rounded-full bg-gradient-to-r from-[#FCA311] to-[#e8960f] text-sm font-semibold text-black shadow-lg shadow-[#FCA311]/20 transition-all hover:from-[#f5b533] hover:to-[#FCA311] hover:shadow-[#FCA311]/30 disabled:opacity-70 hover-shine"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <Loader2 className="size-4 animate-spin" />
                      {mode === 'login' ? 'Giriş yapılıyor…' : 'Kayıt olunuyor…'}
                    </span>
                  ) : mode === 'login' ? (
                    'Giriş Yap'
                  ) : (
                    'Kayıt Ol'
                  )}
                </Button>
              </motion.form>
            </AnimatePresence>
          </CardContent>

          {/* Footer – toggle mode */}
          <CardFooter className="justify-center pb-6 pt-0 hover-glow rounded-b-2xl">
            <p className="text-sm text-white/50">
              {mode === 'login'
                ? 'Hesabınız yok mu?'
                : 'Zaten hesabınız var mı?'}{' '}
              <button
                type="button"
                onClick={toggleMode}
                className="font-semibold text-[#FCA311] transition-colors hover:text-[#f5b533]"
              >
                {mode === 'login' ? 'Kayıt Ol' : 'Giriş Yap'}
              </button>
            </p>
          </CardFooter>
        </Card>
      </motion.div>
    </div>
  )
}
