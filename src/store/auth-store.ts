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

export interface AppState {
  token: string | null
  user: User | null
  setAuth: (token: string, user: User) => void
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
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
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
    }),
    {
      name: 'aliver-storage',
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        activeTab: state.activeTab,
      }),
    }
  )
)
