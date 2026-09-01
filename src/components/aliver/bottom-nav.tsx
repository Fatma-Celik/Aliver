'use client'

import { motion, useMotionValue, useTransform, animate, AnimatePresence } from 'framer-motion'
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
  { key: 'list', label: 'Listeler', icon: ShoppingCart },
  { key: 'profile', label: 'Profil', icon: User },
]

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function BottomNav() {
  const { activeTab, setActiveTab, theme } = useAppStore()
  const activeIndex = TABS.findIndex((t) => t.key === activeTab)
  const isDark = theme === 'dark'

  // Motion value for smooth indicator animation
  const indicatorX = useMotionValue(0)

  // Calculate indicator position based on tab index
  const tabWidth = 25 // each tab is 25% width
  const centerOffset = tabWidth / 2
  const targetX = activeIndex * tabWidth + centerOffset

  // Animate the indicator
  animate(indicatorX, targetX, {
    type: 'spring',
    stiffness: 350,
    damping: 30,
  })

  const translateX = useTransform(indicatorX, (v) => `${v}%`)

  const primaryColor = isDark ? '#FCA311' : '#D4890E'
  const inactiveColor = isDark ? 'rgba(136, 153, 170, 0.45)' : 'rgba(122, 122, 122, 0.4)'
  const glowFilter = isDark ? 'drop-shadow(0 0 6px rgba(252, 163, 17, 0.4))' : 'drop-shadow(0 0 4px rgba(212, 137, 14, 0.35))'

  return (
    <nav
      role="navigation"
      aria-label="Ana navigasyon"
      className="fixed bottom-0 left-0 right-0 z-50"
      style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      {/* Top gradient fade - content behind nav */}
      <div
        className="absolute -top-10 left-0 right-0 h-10 pointer-events-none"
        style={{
          background: 'linear-gradient(to top, var(--background) 0%, transparent 100%)',
        }}
      />

      <div className="relative mx-3 mb-3">
        {/* Main nav container */}
        <div className="bottom-nav-bar relative flex items-center justify-around">
          {/* Subtle gold shimmer line on top */}
          <div className="bottom-nav-shimmer absolute top-0 left-[10%] right-[10%] pointer-events-none" />

          {/* Animated active indicator (pill) */}
          <motion.div
            className="bottom-nav-indicator absolute top-2 pointer-events-none z-0"
            style={{
              x: translateX,
              marginLeft: '-22px',
              width: '44px',
            }}
          />

          {/* Tab buttons */}
          {TABS.map((tab, index) => {
            const Icon = tab.icon
            const isActive = index === activeIndex

            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                aria-label={tab.label}
                aria-current={isActive ? 'page' : undefined}
                className="relative z-10 flex flex-1 flex-col items-center justify-center gap-1.5 h-full outline-none focus-visible:ring-2 focus-visible:ring-primary/50 rounded-2xl"
              >
                {/* Icon */}
                <motion.div
                  whileTap={{ scale: 0.82 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 20 }}
                >
                  <AnimatePresence mode="wait">
                    <motion.div
                      key={`${tab.key}-${isActive}`}
                      initial={isActive ? { scale: 0.5, opacity: 0.3 } : { scale: 1, opacity: 1 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                    >
                      <Icon
                        strokeWidth={isActive ? 2.2 : 1.6}
                        style={{
                          width: isActive ? '22px' : '20px',
                          height: isActive ? '22px' : '20px',
                          color: isActive ? primaryColor : inactiveColor,
                          filter: isActive ? glowFilter : 'none',
                          transition: 'color 0.3s ease, filter 0.3s ease',
                        }}
                      />
                    </motion.div>
                  </AnimatePresence>
                </motion.div>

                {/* Label */}
                <motion.span
                  animate={{
                    opacity: isActive ? 1 : 0.45,
                    y: isActive ? 0 : 2,
                  }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="text-[10px] leading-none font-medium select-none"
                  style={{
                    color: isActive ? primaryColor : inactiveColor,
                    transition: 'color 0.3s ease',
                  }}
                >
                  {tab.label}
                </motion.span>

                {/* Active dot indicator */}
                <motion.div
                  animate={{
                    scaleX: isActive ? 1 : 0,
                    opacity: isActive ? 1 : 0,
                  }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                  className="bottom-nav-dot absolute -bottom-0.5 left-1/2 -translate-x-1/2"
                  style={{ transformOrigin: 'center' }}
                />
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
