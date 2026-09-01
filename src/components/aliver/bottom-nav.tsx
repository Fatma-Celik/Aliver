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

  return (
    <nav
      role="navigation"
      aria-label="Ana navigasyon"
      className="fixed bottom-0 left-0 right-0 z-50 h-16 flex items-center justify-around px-2 glass-nav relative"
    >
      {/* Active indicator dot — uses layoutId for shared layout animation */}
      {TABS.map((tab) => {
        const isActive = activeTab === tab.key
        const Icon = tab.icon

        return (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            aria-label={tab.label}
            aria-current={isActive ? 'page' : undefined}
            className="relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full py-1 outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-lg"
          >
            {/* Gold dot above active icon */}
            {isActive && (
              <motion.span
                layoutId="nav-active-dot"
                className="absolute -top-1 w-1 h-1 rounded-full bg-primary"
                transition={{ type: 'spring', stiffness: 500, damping: 35 }}
              />
            )}

            <motion.div
              whileTap={{ scale: 0.85 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20 }}
              onClick={(e) => { e.stopPropagation(); setActiveTab(tab.key) }}
              className="cursor-pointer"
            >
              <Icon
                className={`w-5 h-5 transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`}
                strokeWidth={isActive ? 2.2 : 1.8}
              />
            </motion.div>

            <span
              className={`text-[10px] leading-none font-medium transition-colors duration-200 ${isActive ? 'text-primary' : 'text-muted-foreground/40'}`}
            >
              {tab.label}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
