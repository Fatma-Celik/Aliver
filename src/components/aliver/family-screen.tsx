'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QRCodeSVG } from 'qrcode.react'
import {
  Users,
  UserPlus,
  QrCode,
  Copy,
  Check,
  Crown,
  LogOut,
  Shield,
  Loader2,
  ScanLine,
  Mail,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { useAppStore, type Family } from '@/store/auth-store'
import { toast } from 'sonner'
import { useTranslation } from '@/lib/i18n'

/* ------------------------------------------------------------------ */
/*  Relative time helper                                               */
/* ------------------------------------------------------------------ */

function relativeTime(dateStr: string, t: Record<string, string>): string {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then
  const diffSec = Math.floor(diffMs / 1000)
  const diffMin = Math.floor(diffSec / 60)
  const diffHour = Math.floor(diffMin / 60)
  const diffDay = Math.floor(diffHour / 24)
  const diffWeek = Math.floor(diffDay / 7)
  const diffMonth = Math.floor(diffDay / 30)

  if (diffSec < 60) return t['family.time.justNow']
  if (diffMin < 60) return `${diffMin} ${t['family.time.minutesAgo']}`
  if (diffHour < 24) return `${diffHour} ${t['family.time.hoursAgo']}`
  if (diffDay < 7) return `${diffDay} ${t['family.time.daysAgo']}`
  if (diffWeek < 4) return `${diffWeek} ${t['family.time.weeksAgo']}`
  if (diffMonth < 12) return `${diffMonth} ${t['family.time.monthsAgo']}`
  const diffYear = Math.floor(diffMonth / 12)
  return `${diffYear} ${t['family.time.yearsAgo']}`
}

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: 'easeOut' as const },
  },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function FamilyScreen() {
  const { token, family, setFamily, setLoading, isLoading, user } = useAppStore()
  const { t } = useTranslation()

  // Form states
  const [createName, setCreateName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [qrData, setQrData] = useState<{ inviteCode: string; familyName: string; url: string } | null>(null)
  const [copied, setCopied] = useState(false)
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  /* ---------- Fetch family data on mount ---------- */
  const fetchFamily = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/my-family', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setFamily(data.family as Family)
      } else {
        setFamily(null)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [token, setFamily, setLoading])

  useEffect(() => {
    fetchFamily()
  }, [fetchFamily])

  /* ---------- Fetch QR data when family exists ---------- */
  const fetchQrData = useCallback(async () => {
    if (!token) return
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/qr', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        setQrData({
          inviteCode: data.inviteCode,
          familyName: data.familyName,
          url: data.url,
        })
      }
    } catch {
      // silent
    }
  }, [token])

  useEffect(() => {
    if (family) {
      fetchQrData()
      setQrData(null)
    } else {
      setQrData(null)
    }
  }, [family, fetchQrData])

  /* ---------- Create family ---------- */
  const handleCreate = async () => {
    const name = createName.trim()
    if (!name) {
      toast.error(t['family.error.nameRequired'])
      return
    }
    if (!token) return
    setActionLoading(true)
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name }),
      })
      if (res.ok) {
        const data = await res.json()
        setFamily(data.family as Family)
        setCreateName('')
        toast.success(t['family.created'])
      } else {
        const err = await res.json()
        toast.error(err.error || t['family.error.createFailed'])
      }
    } catch {
      toast.error(t['profile.connectionError'])
    } finally {
      setActionLoading(false)
    }
  }

  /* ---------- Join family ---------- */
  const handleJoin = async () => {
    const code = joinCode.trim().toUpperCase()
    if (!code) {
      toast.error(t['family.error.codeRequired'])
      return
    }
    if (!token) return
    setActionLoading(true)
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/join', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ inviteCode: code }),
      })
      if (res.ok) {
        const data = await res.json()
        setFamily(data.family as Family)
        setJoinCode('')
        toast.success(t['family.joined'])
      } else {
        const err = await res.json()
        toast.error(err.error || t['family.error.joinFailed'])
      }
    } catch {
      toast.error(t['profile.connectionError'])
    } finally {
      setActionLoading(false)
    }
  }

  /* ---------- Copy invite code ---------- */
  const handleCopyCode = async () => {
    if (!qrData) return
    try {
      await navigator.clipboard.writeText(qrData.inviteCode)
      setCopied(true)
      toast.success(t['family.codeCopied'])
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error(t['family.copyFailed'])
    }
  }

  /* ---------- Leave family ---------- */
  const handleLeave = async () => {
    if (!token) return
    setActionLoading(true)
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/leave', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        setFamily(null)
        setLeaveDialogOpen(false)
        toast.success(t['family.left'])
      } else {
        const err = await res.json()
        toast.error(err.error || t['family.error.leaveFailed'])
      }
    } catch {
      toast.error(t['profile.connectionError'])
    } finally {
      setActionLoading(false)
    }
  }

  /* ---------- Send Invite Email ---------- */
  const handleSendInvite = async () => {
    if (!inviteEmail || !family?.inviteCode) return
    setInviteLoading(true)
    try {
      const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: inviteEmail,
          inviteCode: family.inviteCode,
        }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Davet gönderilemedi')
      toast.success('Davet e-postası başarıyla gönderildi!')
      setInviteEmail('')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setInviteLoading(false)
    }
  }

  /* ---------- Loading state ---------- */
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  /* ================================================================ */
  /*  STATE 1: NO FAMILY                                                */
  /* ================================================================ */
  if (!family) {
    return (
      <main className="mx-auto min-h-screen w-full max-w-lg bg-background px-4 pb-24 pt-6">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* Header */}
          <motion.section variants={itemVariants} className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-foreground/90">{t['family.title']}</h1>
            <p className="text-sm text-muted-foreground">
              {t['family.createDesc']} {t['common.or'].toLowerCase()} {t['family.joinDesc'].toLowerCase()}
            </p>
          </motion.section>

          {/* Two cards: Create + Join */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Create Family Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              className="glass-card hover-glow flex flex-col gap-4 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Users className="size-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{t['family.create']}</h2>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="family-name" className="text-xs text-muted-foreground">
                  {t['family.familyName']}
                </Label>
                <Input
                  id="family-name"
                  placeholder={t['family.familyNamePlaceholder']}
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
                  className="h-10 rounded-lg border-primary/25 text-foreground placeholder:text-muted-foreground/50 focus-visible:ring-primary/40 glass-input"
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={actionLoading || !createName.trim()}
                className="w-full rounded-full font-semibold text-black hover-shine"
                style={{
                  background: 'linear-gradient(135deg, #FCA311 0%, #E8920A 50%, #D48000 100%)',
                  boxShadow: '0 4px 16px rgba(252, 163, 17, 0.2)',
                }}
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Users className="size-4" />
                )}
                {t['family.createBtn']}
              </Button>
            </motion.div>

            {/* Join Family Card */}
            <motion.div
              variants={itemVariants}
              whileHover={{ scale: 1.02, transition: { type: 'spring', stiffness: 400, damping: 25 } }}
              className="glass-card hover-glow flex flex-col gap-4 rounded-2xl p-5"
            >
              <div className="flex items-center gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <UserPlus className="size-5 text-primary" />
                </div>
                <h2 className="text-base font-semibold text-foreground">{t['family.join']}</h2>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="invite-code" className="text-xs text-muted-foreground">
                  {t['family.inviteCode']}
                </Label>
                <Input
                  id="invite-code"
                  placeholder={t['family.inviteCodePlaceholder']}
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
                  className="h-10 rounded-lg border-primary/25 font-mono uppercase tracking-widest text-foreground placeholder:text-muted-foreground/50 placeholder:normal-case placeholder:tracking-normal focus-visible:ring-primary/40 glass-input"
                />
              </div>

              <Button
                onClick={handleJoin}
                disabled={actionLoading || !joinCode.trim()}
                className="w-full rounded-full bg-secondary font-semibold text-primary hover:bg-secondary/80 hover-shine"
              >
                {actionLoading ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {t['family.joinBtn']}
              </Button>

              <p className="flex items-center gap-1.5 text-center text-xs text-muted-foreground/50">
                <ScanLine className="size-3 shrink-0" />
                {t['family.qrScanHint']}
              </p>
            </motion.div>
          </div>
        </motion.div>
      </main>
    )
  }

  /* ================================================================ */
  /*  STATE 2: HAS FAMILY                                               */
  /* ================================================================ */
  return (
    <main className="mx-auto min-h-screen w-full max-w-lg bg-background px-4 pb-24 pt-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={family.id}
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="flex flex-col gap-6"
        >
          {/* ─── Family Header ─── */}
          <motion.section variants={itemVariants} className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                <Shield className="size-5 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground/90">{family.name}</h1>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="rounded-full bg-primary/10 px-2 py-0 text-xs font-medium text-primary hover:bg-primary/15"
                  >
                    {family.members.length} {t['home.members']}
                  </Badge>
                </div>
              </div>
            </div>
          </motion.section>

          {/* ─── QR Code Section ─── */}
          <motion.section
            variants={itemVariants}
            className="glass-card flex flex-col items-center gap-4 rounded-2xl p-6"
          >
            <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
              <QrCode className="size-4 text-primary" />
              {t['family.qrTitle']}
            </div>

            {/* QR Code */}
            <div className="rounded-xl bg-white p-3">
              <QRCodeSVG
                value={qrData?.url ?? `aliver://join/${family.inviteCode}`}
                size={180}
                bgColor="#FFFFFF"
                fgColor="#14213D"
                level="M"
                includeMargin={false}
              />
            </div>

            {/* Invite Code Display */}
            <div className="flex flex-col items-center gap-2">
              <p className="text-xs text-muted-foreground/70">{t['family.inviteCode']}</p>
              <div className="flex items-center gap-2">
                <span className="rounded-lg bg-primary/10 px-4 py-1.5 font-mono text-lg font-bold tracking-[0.2em] text-primary">
                  {qrData?.inviteCode ?? family.inviteCode}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleCopyCode}
                  className="size-9 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary"
                >
                  {copied ? (
                    <Check className="size-4 text-green-500" />
                  ) : (
                    <Copy className="size-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Invite via Email */}
            <div className="mt-4 flex w-full max-w-xs flex-col gap-3 border-t border-border/50 pt-5">
              <Label className="text-center text-xs font-medium text-muted-foreground">E-posta ile Davet Gönder</Label>
              <div className="flex w-full items-center gap-2">
                <Input 
                  placeholder="E-posta adresi" 
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendInvite()}
                  className="h-10 text-sm glass-input"
                />
                <Button 
                  disabled={inviteLoading || !inviteEmail} 
                  onClick={handleSendInvite}
                  className="size-10 shrink-0 rounded-xl bg-primary text-black hover:bg-primary/90"
                  size="icon"
                >
                  {inviteLoading ? <Loader2 className="size-4 animate-spin" /> : <Mail className="size-4" />}
                </Button>
              </div>
            </div>
          </motion.section>

          <Separator className="bg-border" />

          {/* ─── Members List ─── */}
          <motion.section variants={itemVariants} className="flex flex-col gap-3">
            <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
              <Users className="size-4 text-primary" />
              {t['family.members']}
            </h3>

            <div className="flex max-h-96 flex-col gap-2 overflow-y-auto">
              {family.members.map((member, index) => {
                const isAdmin = member.role === 'admin'
                const isYou = member.user.id === user?.id
                return (
                  <motion.div
                    key={member.id}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.35,
                      delay: 0.15 + index * 0.06,
                      ease: 'easeOut',
                    }}
                    className="glass-card hover-border-glow flex items-center gap-3 rounded-xl px-4 py-3"
                  >
                    {/* Avatar - first letter circle in gold */}
                    <div
                      className="flex size-10 shrink-0 items-center justify-center rounded-full text-sm font-bold"
                      style={{
                        background: isAdmin
                          ? 'linear-gradient(135deg, #FCA311 0%, #E8920A 100%)'
                          : 'rgba(252, 163, 17, 0.12)',
                        color: isAdmin ? '#000000' : '#FCA311',
                      }}
                    >
                      {member.user.name.charAt(0).toUpperCase()}
                    </div>

                    {/* Name & meta */}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {member.user.name} {isYou && <span className="text-muted-foreground/60">{t['family.you']}</span>}
                      </p>
                      <p className="text-xs text-muted-foreground/70">
                        {relativeTime(member.joinedAt, t)} {t['family.joinedAt']}
                      </p>
                    </div>

                    {/* Role badge */}
                    <Badge
                      variant="secondary"
                      className={
                        isAdmin
                          ? 'shrink-0 gap-1 rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-medium text-primary'
                          : 'shrink-0 rounded-full bg-border px-2.5 py-0.5 text-xs font-medium text-muted-foreground/70'
                      }
                    >
                      {isAdmin ? (
                        <>
                          <Crown className="size-3" />
                          {t['family.admin']}
                        </>
                      ) : (
                        t['family.member']
                      )}
                    </Badge>
                  </motion.div>
                )
              })}
            </div>
          </motion.section>

          {/* ─── Leave Family Button ─── */}
          <motion.section variants={itemVariants} className="mt-2">
            <Button
              onClick={() => setLeaveDialogOpen(true)}
              variant="ghost"
              className="w-full rounded-xl border border-destructive/20 bg-destructive/5 py-5 text-sm font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive/80"
            >
              <LogOut className="size-4" />
              {t['family.leave']}
            </Button>
          </motion.section>
        </motion.div>
      </AnimatePresence>

      {/* ─── Leave Family Dialog ─── */}
      <Dialog open={leaveDialogOpen} onOpenChange={setLeaveDialogOpen}>
        <DialogContent className="max-w-sm rounded-2xl border-border bg-background p-6 sm:rounded-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-lg font-bold text-foreground">
              <LogOut className="size-5 text-destructive" />
              {t['family.leave']}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground">
              <span className="font-semibold text-foreground/80">{family.name}</span>{' '}
              {t['family.leaveConfirm']} {t['family.leaveDesc']}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex gap-3 pt-2">
            <Button
              variant="ghost"
              onClick={() => setLeaveDialogOpen(false)}
              className="flex-1 rounded-xl bg-secondary text-muted-foreground hover:bg-secondary/80 hover:text-foreground"
            >
              {t['common.cancel']}
            </Button>
            <Button
              onClick={handleLeave}
              disabled={actionLoading}
              className="flex-1 rounded-xl bg-destructive/90 font-semibold text-foreground hover:bg-destructive"
            >
              {actionLoading ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                t['family.leave']
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}