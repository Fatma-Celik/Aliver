'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import {
  User,
  Bell,
  Globe,
  LogOut,
  Shield,
  ListChecks,
  Users,
  ChevronRight,
  Loader2,
  Sun,
  Moon,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { useAppStore } from '@/store/auth-store'

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.07, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stats {
  members: number
  lists: number
  completed: number
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProfileScreen() {
  const { user, family, logout, toggleTheme, theme } = useAppStore()
  const [notifications, setNotifications] = useState(true)
  const [stats, setStats] = useState<Stats>({ members: 0, lists: 0, completed: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  const fetchStats = useCallback(async () => {
    try {
      const token = useAppStore.getState().token
      const headers: Record<string, string> = {}
      if (token) headers['Authorization'] = `Bearer ${token}`

      const [listsRes] = await Promise.all([
        fetch('/api/shopping-lists', { headers }),
      ])

      if (listsRes.ok) {
        const data = await listsRes.json()
        const lists: Array<{ _count?: { items: number; completed: number } }> = data.lists ?? data ?? []
        const totalItems = lists.reduce((sum: number, l) => sum + (l._count?.items ?? 0), 0)
        const completedItems = lists.reduce((sum: number, l) => sum + (l._count?.completed ?? 0), 0)

        const familyId = useAppStore.getState().family?.id
        let memberCount = 1
        if (familyId) {
          try {
            const famRes = await fetch(`/api/family?XTransformPort=3000`, { headers })
            if (famRes.ok) {
              const famData = await famRes.json()
              memberCount = famData.members?.length ?? famData.family?.members?.length ?? 1
            }
          } catch {
            memberCount = family?.members?.length ?? 1
          }
        }

        setStats({
          members: memberCount,
          lists: Array.isArray(lists) ? lists.length : 0,
          completed: completedItems,
        })
      }
    } catch {
      // silently keep defaults
      const familyMembers = family?.members?.length ?? 1
      setStats({ members: familyMembers, lists: 0, completed: 0 })
    } finally {
      setLoadingStats(false)
    }
  }, [family])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!user) return null

  const firstLetter = user.name.charAt(0).toUpperCase()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-lg mx-auto px-4 pt-8 pb-24 space-y-6"
    >
      {/* ---- Profile Header ---- */}
      <motion.div variants={item} className="flex flex-col items-center gap-3">
        <div className="relative">
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-black select-none"
            style={{
              background: 'linear-gradient(135deg, #FCA311 0%, #e08e00 100%)',
            }}
          >
            {firstLetter}
          </div>
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary flex items-center justify-center">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>
        <div className="text-center">
          <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{user.email}</p>
        </div>
      </motion.div>

      {/* ---- Stats ---- */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {loadingStats ? (
          <div className="col-span-3 flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <StatCard icon={<Users className="w-4 h-4" />} label="Aile Üyeleri" value={stats.members} />
            <StatCard icon={<ListChecks className="w-4 h-4" />} label="Listeler" value={stats.lists} />
            <StatCard icon={<ListChecks className="w-4 h-4" />} label="Tamamlanan" value={stats.completed} />
          </>
        )}
      </motion.div>

      {/* ---- Settings List ---- */}
      <motion.div variants={item} className="glass-card rounded-2xl divide-y divide-border">
        {/* Notifications */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Bell className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Bildirimler</span>
          </div>
          <Switch
            checked={notifications}
            onCheckedChange={setNotifications}
            className="data-[state=checked]:bg-primary"
          />
        </div>

        {/* Theme */}
        <div
          className="flex items-center justify-between px-4 py-3.5 cursor-pointer"
          onClick={toggleTheme}
        >
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              {theme === 'light' ? <Sun className="w-4 h-4 text-primary" /> : <Moon className="w-4 h-4 text-primary" />}
            </div>
            <span className="text-sm font-medium text-foreground">Tema</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-sm">{theme === 'dark' ? 'Karanlık Platini' : 'Açık Platini'}</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>

        {/* Language */}
        <div className="flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <Globe className="w-4 h-4 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Dil Seçimi</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <span className="text-sm">Türkçe</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      </motion.div>

      {/* ---- Logout ---- */}
      <motion.div variants={item}>
        <button
          onClick={logout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Card sub-component                                            */
/* ------------------------------------------------------------------ */

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <div className="glass-card hover-border-glow rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
      <div className="text-primary">{icon}</div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
    </div>
  )
}