'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  ShoppingCart,
  Users,
  Plus,
  TrendingUp,
  ChevronRight,
  ListChecks,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAppStore, type ShoppingList, type Family } from '@/store/auth-store'
import { useTranslation } from '@/lib/i18n'

/* ------------------------------------------------------------------ */
/*  Turkish date helpers                                               */
/* ------------------------------------------------------------------ */

const TURKISH_MONTHS = [
  'Ocak',
  'Şubat',
  'Mart',
  'Nisan',
  'Mayıs',
  'Haziran',
  'Temmuz',
  'Ağustos',
  'Eylül',
  'Ekim',
  'Kasım',
  'Aralık',
]

const TURKISH_DAYS = [
  'Pazar',
  'Pazartesi',
  'Salı',
  'Çarşamba',
  'Perşembe',
  'Cuma',
  'Cumartesi',
]

function formatTurkishDate(date: Date): string {
  const day = date.getDate()
  const month = TURKISH_MONTHS[date.getMonth()]
  const weekday = TURKISH_DAYS[date.getDay()]
  return `${day} ${month} ${weekday}`
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

const cardHover = {
  scale: 1.02,
  transition: { type: 'spring' as const, stiffness: 400, damping: 25 },
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function HomeScreen() {
  const {
    user,
    family,
    lists,
    token,
    setFamily,
    setLists,
    setActiveList,
    setActiveTab,
  } = useAppStore()

  const { t } = useTranslation()

  const [loading, setLoading] = useState(true)
  const [now] = useState(new Date())

  /* ---------- Data fetching on mount ---------- */
  const fetchData = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      // Fetch family
      const familyRes = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/family/my-family', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (familyRes.ok) {
        const data = await familyRes.json()
        setFamily(data.family as Family)
      } else {
        setFamily(null)
      }

      // Fetch lists
      const listsRes = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/lists', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (listsRes.ok) {
        const data = await listsRes.json()
        // Map API response to store shape
        const mapped: ShoppingList[] = (data.lists ?? []).map(
          (l: { id: string; name: string; createdBy: string; familyId?: string; createdAt: string; totalCount: number; completedCount: number }) => ({
            id: l.id,
            name: l.name,
            createdBy: l.createdBy,
            familyId: l.familyId ?? '',
            createdAt: l.createdAt,
            _count: {
              items: l.totalCount,
              completed: l.completedCount,
            },
          }),
        )
        setLists(mapped)
      }
    } catch {
      // Silently fail — data stays as-is from store
    } finally {
      setLoading(false)
    }
  }, [token, setFamily, setLists])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  /* ---------- Computed values ---------- */
  const totalLists = lists.length
  const totalPending = lists.reduce(
    (acc, l) => acc + (l._count?.items ?? 0) - (l._count?.completed ?? 0),
    0,
  )

  /* ---------- Handlers ---------- */
  const handleListClick = (list: ShoppingList) => {
    setActiveList(list)
    setActiveTab('list')
  }

  const handleCreateFamily = () => {
    setActiveTab('family')
  }

  /* ---------- Loading state ---------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="size-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg bg-background px-4 pb-24 pt-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* ─── Branding Header ─── */}
        <motion.section variants={itemVariants} className="flex flex-col items-center gap-3 pt-2">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20, delay: 0.05 }}
          >
            <Image
              src=""
              alt="ALIVER"
              width={120}
              height={120}
              className="w-28 h-28 object-contain"
              priority
            />
          </motion.div>

        </motion.section>

        {/* ─── Welcome Section ─── */}
        <motion.section variants={itemVariants} className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold text-foreground/90">
            {t['home.hello']},{' '}
            <span className="platini-text-gradient">{user?.name ?? 'Kullanıcı'}</span>
          </h2>
          <p className="text-sm text-muted-foreground">
            {formatTurkishDate(now)}
          </p>
        </motion.section>

        {/* ─── Family CTA (no family) ─── */}
        {!family && (
          <motion.section variants={itemVariants}>
            <motion.div
              whileHover={cardHover}
              className="relative overflow-hidden rounded-2xl p-6"
              style={{
                background: 'linear-gradient(135deg, #FCA311 0%, #E8920A 50%, #D48000 100%)',
              }}
            >
              {/* Decorative circles */}
              <div className="pointer-events-none absolute -right-6 -top-6 h-32 w-32 rounded-full bg-white/10" />
              <div className="pointer-events-none absolute -bottom-4 -left-4 h-24 w-24 rounded-full bg-white/10" />

              <div className="relative z-10 flex flex-col gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex size-10 items-center justify-center rounded-xl bg-black/20">
                    <Users className="size-5 text-black" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-black">
                      {t['home.createFamily']}
                    </h3>
                    <p className="text-sm text-black/70">
                      {t['home.createFamilyDesc']}
                    </p>
                  </div>
                </div>
                <Button
                  onClick={handleCreateFamily}
                  className="w-full justify-center gap-2 rounded-full bg-background text-sm font-semibold text-primary hover:bg-secondary/80"
                >
                  <Plus className="size-4" />
                  {t['home.createFamilyBtn']}
                </Button>
              </div>
            </motion.div>
          </motion.section>
        )}

        {/* ─── Family Card + Stats (family exists) ─── */}
        {family && (
          <>
            <motion.section variants={itemVariants}>
              <motion.div
                whileHover={cardHover}
                className="glass-card hover-glow flex cursor-pointer items-center gap-4 rounded-2xl p-4"
                onClick={handleCreateFamily}
              >
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary/15">
                  <Users className="size-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="truncate text-base font-semibold text-foreground">
                    {family.name}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {family.members.length} {t['home.members']}
                  </p>
                </div>
                <ChevronRight className="size-5 shrink-0 text-muted-foreground/50" />
              </motion.div>
            </motion.section>

            {/* Quick Stats */}
            <motion.section
              variants={itemVariants}
              className="grid grid-cols-2 gap-3"
            >
              <motion.div
                whileHover={cardHover}
                className="glass-card hover-border-glow flex flex-col items-center gap-2 rounded-2xl p-4"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
                  <ShoppingCart className="size-4 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">{totalLists}</span>
                <span className="text-xs text-muted-foreground">{t['home.lists']}</span>
              </motion.div>

              <motion.div
                whileHover={cardHover}
                className="glass-card hover-border-glow flex flex-col items-center gap-2 rounded-2xl p-4"
              >
                <div className="flex size-9 items-center justify-center rounded-lg bg-primary/15">
                  <TrendingUp className="size-4 text-primary" />
                </div>
                <span className="text-2xl font-bold text-foreground">
                  {totalPending}
                </span>
                <span className="text-xs text-muted-foreground">{t['home.pendingItems']}</span>
              </motion.div>
            </motion.section>
          </>
        )}

        {/* ─── Recent Lists Section ─── */}
        {family && (
          <motion.section variants={itemVariants} className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-base font-semibold text-foreground">
                <ListChecks className="size-4 text-primary" />
                {t['home.recentLists']}
              </h3>
              {lists.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {lists.length} {t['home.list']}
                </span>
              )}
            </div>

            {lists.length === 0 ? (
              /* Empty state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
                className="glass-card flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-12"
              >
                <div className="flex size-14 items-center justify-center rounded-full bg-primary/5">
                  <ShoppingCart className="size-7 text-muted-foreground/30" />
                </div>
                <div className="flex flex-col items-center gap-1">
                  <p className="text-sm font-medium text-muted-foreground">
                    {t['home.noLists']}
                  </p>
                  <p className="text-xs text-muted-foreground/50">
                    {t['home.noListsDesc']}
                  </p>
                </div>
              </motion.div>
            ) : (
              /* Horizontal scrollable list cards */
              <div className="flex gap-3 overflow-x-auto pb-2" style={{ scrollbarWidth: 'none' }}>
                {lists.map((list, index) => {
                  const total = list._count?.items ?? 0
                  const completed = list._count?.completed ?? 0
                  const progress = total > 0 ? (completed / total) * 100 : 0

                  return (
                    <motion.div
                      key={list.id}
                      variants={itemVariants}
                      whileHover={cardHover}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleListClick(list)}
                      className="glass-card hover-glow flex w-[200px] shrink-0 cursor-pointer flex-col gap-3 rounded-2xl p-4"
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {/* List name */}
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="truncate text-sm font-semibold text-foreground">
                          {list.name}
                        </h4>
                        <Sparkles className="size-3.5 shrink-0 text-primary/60" />
                      </div>

                      {/* Item counts */}
                      <p className="text-xs text-muted-foreground">
                        <span className="font-medium text-primary">
                          {completed}
                        </span>{' '}
                        / {total} {t['home.completed']}
                      </p>

                      {/* Progress bar */}
                      <div className="h-1.5 w-full overflow-hidden rounded-full bg-border">
                        <motion.div
                          className="h-full rounded-full"
                          style={{ background: 'linear-gradient(90deg, #FCA311 0%, #FFD60A 100%)' }}
                          initial={{ width: 0 }}
                          animate={{ width: `${progress}%` }}
                          transition={{ duration: 0.6, delay: 0.3 + index * 0.08, ease: 'easeOut' }}
                        />
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            )}
          </motion.section>
        )}
      </motion.div>
    </main>
  )
}
