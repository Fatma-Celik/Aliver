'use client'

import { motion } from 'framer-motion'
import { Home, Users, ShoppingCart, User } from 'lucide-react'
import { useAppStore, type AppState } from '@/store/auth-store'
import { useTranslation } from '@/lib/i18n'

interface TabConfig {
  key: AppState['activeTab']
  labelKey: string
  icon: React.ElementType
}

const TABS: TabConfig[] = [
  { key: 'home', labelKey: 'nav.home', icon: Home },
  { key: 'family', labelKey: 'nav.family', icon: Users },
  { key: 'list', labelKey: 'nav.lists', icon: ShoppingCart },
  { key: 'profile', labelKey: 'nav.profile', icon: User },
]

export default function BottomNav() {
  const { activeTab, setActiveTab } = useAppStore()
  const { t } = useTranslation()

  return (
    <nav
      role="navigation"
      aria-label="Ana navigasyon"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <div
        className="absolute -top-6 left-0 right-0 h-6 pointer-events-none"
        style={{ background: 'linear-gradient(to top, var(--background), transparent)' }}
      />
      <div className="mx-4 mb-4">
        <div className="nav-container relative flex items-center justify-around rounded-[22px] px-1 py-1.5">
          {TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = index === TABS.findIndex((t) => t.key === activeTab)
            const label = t[tab.labelKey]

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1 py-2.5 outline-none focus-visible:ring-2 focus-visible:ring-primary/40 rounded-2xl"
              >
                <motion.div
                  className="absolute inset-1 rounded-2xl"
                  animate={{ opacity: isActive ? 1 : 0 }}
                  transition={{ duration: 0.25, ease: 'easeOut' }}
                  style={{ background: 'var(--nav-active-bg, rgba(252, 163, 17, 0.12))' }}
                />
                <Icon
                  className="relative z-10 transition-colors duration-200"
                  strokeWidth={isActive ? 2 : 1.5}
                  style={{
                    width: '21px',
                    height: '21px',
                    color: isActive ? 'var(--color-primary)' : 'var(--nav-inactive, rgba(136, 153, 170, 0.45))',
                  }}
                />
                <span
                  className="relative z-10 text-[10px] font-medium leading-none transition-colors duration-200"
                  style={{
                    color: isActive ? 'var(--color-primary)' : 'var(--nav-inactive, rgba(136, 153, 170, 0.45))',
                  }}
                >
                  {label}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
