'use client'

import { motion } from 'framer-motion'
import { Home, Users, ShoppingCart, User } from 'lucide-react'
import { useAppStore, type AppState } from '@/store/auth-store'

/* ------------------------------------------------------------------ */
/*  Tab config                                                         */
/* ------------------------------------------------------------------ */

interface TabConfig {
  key: AppState['activeTab']
  label: string
  icon: React.ElementType
}

const TABS: TabConfig[] = [
  { key: 'home', label: 'Ana Sayfa', icon: Home },
  { key: 'family', label: 'Aile', icon: Users },
  { key: 'list', label: 'Liste', icon: ShoppingCart },
  { key: 'profile', label: 'Profil', icon: User },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()
  const activeIndex = TABS.findIndex((t) => t.key === activeTab)

  // Each tab center is at (index * 25 + 12.5)%
  const indicatorLeft = `${activeIndex * 25 + 12.5}%`

  return (
    <nav
      role="navigation"
      aria-label="Ana navigasyon"
      className="fixed bottom-4 left-4 right-4 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div className="relative h-16 rounded-2xl bg-card dark:bg-black shadow-xl dark:shadow-black/40 shadow-black/10">
        {/* Semicircular notch at top center */}
        <div className="absolute -top-[18px] left-1/2 -translate-x-1/2 w-10 h-[18px] overflow-hidden">
          <div className="w-full h-full rounded-b-full bg-background" />
        </div>

        {/* Animated active indicator */}
        <motion.div
          className="absolute -top-[14px] z-10 pointer-events-none"
          animate={{ left: indicatorLeft }}
          transition={{ type: 'spring', stiffness: 500, damping: 35 }}
          style={{ x: '-50%' }}
        >
          <div className="w-12 h-12 rounded-full bg-foreground dark:bg-white flex items-center justify-center shadow-lg dark:shadow-black/30 shadow-black/15">
            {TABS.filter((t) => t.key === activeTab).map((tab) => {
              const Icon = tab.icon
              return (
                <Icon
                  key={tab.key}
                  className="w-5 h-5 text-primary"
                  strokeWidth={2.2}
                />
              )
            })}
          </div>
        </motion.div>

        {/* Tab icon buttons */}
        <div className="relative z-0 flex items-center justify-around h-full px-4">
          {TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = index === activeIndex

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className="flex-1 h-full flex items-center justify-center outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
              >
                <motion.div
                  whileTap={{ scale: 0.8 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key) }}
                  className="cursor-pointer"
                >
                  <Icon
                    className={`w-[18px] h-[18px] transition-all duration-200 ${
                      isActive
                        ? 'opacity-0'
                        : 'text-muted-foreground/50 dark:text-white/40'
                    }`}
                    strokeWidth={1.8}
                  />
                </motion.div>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
