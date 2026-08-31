'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { useAppStore } from '@/store/auth-store'
import AuthScreen from '@/components/aliver/auth-screen'
import HomeScreen from '@/components/aliver/home-screen'
import FamilyScreen from '@/components/aliver/family-screen'
import ListScreen from '@/components/aliver/list-screen'
import ProfileScreen from '@/components/aliver/profile-screen'
import BottomNav from '@/components/aliver/bottom-nav'

function AppContent() {
  const { token, user, activeTab } = useAppStore()
  const [mounted, setMounted] = useState(false)
  const [initialCheck, setInitialCheck] = useState(true)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Verify token on mount
  useEffect(() => {
    if (!token) {
      setInitialCheck(false)
      return
    }

    const verifyToken = async () => {
      try {
        const res = await fetch('/api/auth/me', {
          headers: { Authorization: `Bearer ${token}` },
        })
        if (!res.ok) {
          useAppStore.getState().logout()
        }
      } catch {
        // Token invalid or network error, keep as is for offline
      } finally {
        setInitialCheck(false)
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

  // Not authenticated
  if (!token || !user) {
    return <AuthScreen />
  }

  // Authenticated - show app with bottom nav
  return (
    <div className="min-h-screen bg-black">
      <main className="pb-20">
        <AnimatePresence mode="wait">
          {activeTab === 'home' && (
            <motion.div
              key="home"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <HomeScreen />
            </motion.div>
          )}
          {activeTab === 'family' && (
            <motion.div
              key="family"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <FamilyScreen />
            </motion.div>
          )}
          {activeTab === 'list' && (
            <motion.div
              key="list"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ListScreen />
            </motion.div>
          )}
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              <ProfileScreen />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      <BottomNav />
    </div>
  )
}

export default function Page() {
  return <AppContent />
}
