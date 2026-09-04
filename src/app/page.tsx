'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingCart } from 'lucide-react'
import { useAppStore } from '@/store/auth-store'
import AuthScreen from '@/components/aliver/auth-screen'
import HomeScreen from '@/components/aliver/home-screen'
import FamilyScreen from '@/components/aliver/family-screen'
import ListScreen from '@/components/aliver/list-screen'
import ProfileScreen from '@/components/aliver/profile-screen'
import BottomNav from '@/components/aliver/bottom-nav'

function ThemeSync() {
  const { theme } = useAppStore()
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  return null
}

function FabWidget() {
  const { setActiveTab, setActiveList, activeTab, family, lists } = useAppStore()

  const handleClick = () => {
    if (lists.length > 0 && family) {
      setActiveList(lists[0])
    }
    setActiveTab('list')
  }

  // Hide when on list tab with an active list, or on profile tab
  if ((activeTab === 'list' && useAppStore.getState().activeList) || activeTab === 'profile') return null

  return (
    <motion.button
      className="fab-basket"
      onClick={handleClick}
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.92 }}
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.3 }}
      aria-label="Alışveriş Listesine Git"
    >
      <motion.div
        animate={{
          boxShadow: [
            '0 6px 24px rgba(252,163,17,0.3), 0 0 20px rgba(252,163,17,0.15)',
            '0 6px 28px rgba(252,163,17,0.45), 0 0 35px rgba(252,163,17,0.25)',
            '0 6px 24px rgba(252,163,17,0.3), 0 0 20px rgba(252,163,17,0.15)',
          ],
        }}
        transition={{ repeat: Infinity, duration: 2.5, ease: 'easeInOut' }}
        className="w-14 h-14 rounded-full flex items-center justify-center"
        style={{
          background: 'linear-gradient(145deg, #FCA311 0%, #E8920A 100%)',
        }}
      >
        <ShoppingCart className="size-6 text-white" strokeWidth={2} />
      </motion.div>
    </motion.button>
  )
}

function AppContent() {
  const { token, user, activeTab } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [initialCheck, setInitialCheck] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    // OAuth callback'ten gelen token'ı yakala
    const handleOAuthCallback = () => {
      const hash = window.location.hash
      if (!hash || !hash.startsWith('#token=')) return
      try {
        const hashParams = new URLSearchParams(hash.slice(1))
        const tokenParam = hashParams.get('token')
        const userParam = hashParams.get('user')
        if (tokenParam && userParam) {
          const user = JSON.parse(decodeURIComponent(userParam))
          useAppStore.getState().setAuth(tokenParam, user)
          window.history.replaceState(null, '', window.location.pathname)
        }
      } catch {
        // Geçersiz callback verisi
      }
    }
    handleOAuthCallback()
  }, [])

  useEffect(() => {
    if (!token) {
      setInitialCheck(false)
      return
    }
    // Optimistically assume the token is valid and show the app instantly!
    setInitialCheck(false) 

    const verifyToken = async () => {
      try {
        const res = await fetch((process.env.NEXT_PUBLIC_APP_URL || '') + '/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (res.status === 401) {
          useAppStore.getState().logout()
        }
      } catch {
        // silent
      }
    }
    verifyToken()
  }, [token])

  if (!mounted || initialCheck) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <h1 className="text-5xl font-bold platini-text-gradient mb-4">
            ALIVER
          </h1>
          <motion.div
            className="w-8 h-8 rounded-full platini-gradient mx-auto"
            animate={{ scale: [1, 1.3, 1], opacity: [0.5, 1, 0.5] }}
            transition={{ repeat: Infinity, duration: 1.2 }}
          />
        </motion.div>
      </div>
    )
  }

  if (!token || !user) {
    return <><ThemeSync /><AuthScreen /></>
  }

  return (
    <div className="min-h-screen bg-background">
      <ThemeSync />
      <main className="pb-24">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div key="home" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <HomeScreen />
            </motion.div>
          )}
          {activeTab === 'family' && (
            <motion.div key="family" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <FamilyScreen />
            </motion.div>
          )}
          {activeTab === 'list' && (
            <motion.div key="list" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <ListScreen />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.2 }}>
              <ProfileScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <FabWidget />
      <BottomNav />
    </div>
  )
}

export default function Page() {
  return <AppContent />
}
