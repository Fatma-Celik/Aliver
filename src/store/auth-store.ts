import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string | null
}

export interface FamilyMember {
  id: string
  role: string
  joinedAt: string
  user: User
}

export interface Family {
  id: string
  name: string
  inviteCode: string
  createdBy: string
  createdAt: string
  members: FamilyMember[]
}

export interface ShoppingItem {
  id: string
  name: string
  quantity: number
  unit: string
  completed: boolean
  purchasedBy?: string | null
  purchasedAt?: string | null
  createdAt: string
  adder: { name: string }
  purchaser?: { name: string } | null
}

export interface ShoppingList {
  id: string
  name: string
  createdBy: string
  familyId: string
  createdAt: string
  _count?: { items: number; completed: number }
  items?: ShoppingItem[]
}

export interface NotificationSettings {
  listUpdates: boolean
  newItems: boolean
  purchaseAlerts: boolean
  familyActivity: boolean
}

export interface AppState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
  updateUser: (user: Partial<User>) => void
  logout: () => void
  family: Family | null
  setFamily: (family: Family | null) => void
  lists: ShoppingList[]
  setLists: (lists: ShoppingList[]) => void
  activeList: ShoppingList | null
  setActiveList: (list: ShoppingList | null) => void
  activeTab: 'home' | 'family' | 'list' | 'profile'
  setActiveTab: (tab: 'home' | 'family' | 'list' | 'profile') => void
  isLoading: boolean
  setLoading: (loading: boolean) => void
  theme: 'dark' | 'light'
  setTheme: (theme: 'dark' | 'light') => void
  toggleTheme: () => void
  notifications: NotificationSettings
  setNotifications: (settings: Partial<NotificationSettings>) => void
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      updateUser: (updates) => set((s) => ({ user: s.user ? { ...s.user, ...updates } : null })),
      logout: () => set({ token: null, user: null, family: null, lists: [], activeList: null }),
      family: null,
      setFamily: (family) => set({ family }),
      lists: [],
      setLists: (lists) => set({ lists }),
      activeList: null,
      setActiveList: (list) => set({ activeList: list }),
      activeTab: 'home',
      setActiveTab: (tab) => set({ activeTab: tab }),
      isLoading: false,
      setLoading: (loading) => set({ isLoading: loading }),
      theme: 'dark',
      setTheme: (theme) => set({ theme }),
      toggleTheme: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      notifications: {
        listUpdates: true,
        newItems: true,
        purchaseAlerts: true,
        familyActivity: false,
      },
      setNotifications: (settings) =>
        set((s) => ({ notifications: { ...s.notifications, ...settings } })),
    }),
    {
      name: 'aliver-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeTab: state.activeTab,
        theme: state.theme,
        notifications: state.notifications,
      }),
    }
  )
)
