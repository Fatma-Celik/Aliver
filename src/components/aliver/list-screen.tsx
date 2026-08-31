'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  Plus,
  ShoppingCart,
  Trash2,
  Check,
  Package,
  ShoppingBag,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore, type ShoppingList, type ShoppingItem } from '@/store/auth-store'

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const UNITS = ['adet', 'kg', 'litre', 'paket'] as const

/* ------------------------------------------------------------------ */
/*  Animation variants                                                 */
/* ------------------------------------------------------------------ */

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.35, ease: 'easeOut' },
  },
  exit: {
    opacity: 0,
    x: -40,
    transition: { duration: 0.25 },
  },
}

const slideInVariants = {
  hidden: { opacity: 0, x: -20, height: 0 },
  visible: {
    opacity: 1,
    x: 0,
    height: 'auto',
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
}

const cardHover = {
  scale: 1.02,
  transition: { type: 'spring', stiffness: 400, damping: 25 },
}

/* ------------------------------------------------------------------ */
/*  Helper: Auth headers                                               */
/* ------------------------------------------------------------------ */

function authHeaders(token: string) {
  return { Authorization: `Bearer ${token}` }
}

/* ------------------------------------------------------------------ */
/*  View A: List Selection                                             */
/* ------------------------------------------------------------------ */

function ListSelectionView() {
  const { token, lists, setLists, setActiveList } = useAppStore()
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [newListName, setNewListName] = useState('')
  const [creating, setCreating] = useState(false)

  const fetchLists = useCallback(async () => {
    if (!token) return
    setLoading(true)
    try {
      const res = await fetch('/api/lists', { headers: authHeaders(token) })
      if (res.ok) {
        const data = await res.json()
        const mapped: ShoppingList[] = (data.lists ?? []).map(
          (l: {
            id: string
            name: string
            createdBy: string
            familyId?: string
            createdAt: string
            totalCount: number
            completedCount: number
          }) => ({
            id: l.id,
            name: l.name,
            createdBy: l.createdBy,
            familyId: l.familyId ?? '',
            createdAt: l.createdAt,
            _count: { items: l.totalCount, completed: l.completedCount },
          }),
        )
        setLists(mapped)
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [token, setLists])

  useEffect(() => {
    fetchLists()
  }, [fetchLists])

  const handleCreate = async () => {
    if (!token || !newListName.trim()) return
    setCreating(true)
    try {
      const res = await fetch('/api/lists', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ name: newListName.trim() }),
      })
      if (res.ok) {
        toast.success('Liste oluşturuldu!')
        setNewListName('')
        setDialogOpen(false)
        fetchLists()
      } else {
        toast.error('Liste oluşturulamadı')
      }
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setCreating(false)
    }
  }

  const handleOpenList = (list: ShoppingList) => {
    setActiveList(list)
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="size-8 animate-spin text-[#FCA311]" />
      </div>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg bg-black px-4 pb-24 pt-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-6"
      >
        {/* ─── Header ─── */}
        <motion.section variants={itemVariants} className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-xl bg-[#FCA311]/15">
              <ShoppingBag className="size-5 text-[#FCA311]" />
            </div>
            <h1 className="text-2xl font-bold text-[#FCA311]">Alışveriş Listeleri</h1>
          </div>
          <Button
            onClick={() => setDialogOpen(true)}
            className="flex size-10 items-center justify-center rounded-full bg-[#FCA311] text-black hover:bg-[#FCA311]/90"
            size="icon"
          >
            <Plus className="size-5" />
          </Button>
        </motion.section>

        {/* ─── Lists ─── */}
        {lists.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            className="dark-card flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-16"
          >
            <div className="flex size-16 items-center justify-center rounded-full bg-white/5">
              <ShoppingCart className="size-8 text-white/20" />
            </div>
            <div className="flex flex-col items-center gap-1.5">
              <p className="text-sm font-medium text-white/50">
                Henüz liste oluşturulmadı
              </p>
              <p className="text-xs text-white/30">
                Yeni bir alışveriş listesi oluşturmak için + butonuna tıklayın
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div variants={containerVariants} className="flex flex-col gap-3">
            {lists.map((list) => {
              const total = list._count?.items ?? 0
              const completed = list._count?.completed ?? 0
              const progress = total > 0 ? (completed / total) * 100 : 0
              const isComplete = total > 0 && completed === total

              return (
                <motion.div
                  key={list.id}
                  variants={itemVariants}
                  whileHover={cardHover}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleOpenList(list)}
                  className="dark-card-elevated cursor-pointer rounded-2xl p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div
                        className={`flex size-10 shrink-0 items-center justify-center rounded-xl ${isComplete ? 'bg-green-500/15' : 'bg-[#FCA311]/15'}`}
                      >
                        {isComplete ? (
                          <Check className="size-5 text-green-400" />
                        ) : (
                          <Package className="size-5 text-[#FCA311]" />
                        )}
                      </div>
                      <div className="flex flex-col gap-1">
                        <h3 className="text-sm font-semibold text-white">
                          {list.name}
                        </h3>
                        <p className="text-xs text-white/50">
                          <span className="font-medium text-[#FCA311]">
                            {completed}
                          </span>{' '}
                          / {total} tamamlandı
                        </p>
                      </div>
                    </div>
                    {isComplete && (
                      <Badge
                        className="shrink-0 bg-green-500/15 text-xs text-green-400 hover:bg-green-500/20"
                      >
                        <Check className="size-3 mr-1" />
                        Tamamlandı
                      </Badge>
                    )}
                  </div>

                  {/* Progress bar */}
                  <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                    <motion.div
                      className="h-full rounded-full"
                      style={{
                        background: isComplete
                          ? 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)'
                          : 'linear-gradient(90deg, #FCA311 0%, #FFD60A 100%)',
                      }}
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
                    />
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
        )}
      </motion.div>

      {/* ─── Create List Dialog ─── */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="rounded-2xl border-white/10 bg-[#0D1B2A] sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Yeni Liste Oluştur</DialogTitle>
            <DialogDescription className="text-white/50">
              Alışveriş listenize bir isim verin
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <Input
              value={newListName}
              onChange={(e) => setNewListName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
              placeholder="Örn: Haftalık market alışverişi"
              className="border-[#FCA311]/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-[#FCA311] focus-visible:ring-[#FCA311]/30"
              autoFocus
            />
          </div>
          <DialogFooter className="flex-row gap-2">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="flex-1 text-white/60 hover:bg-white/5 hover:text-white"
              >
                İptal
              </Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={!newListName.trim() || creating}
              className="flex-1 rounded-full bg-[#FCA311] text-black hover:bg-[#FCA311]/90"
            >
              {creating && <Loader2 className="mr-2 size-4 animate-spin" />}
              Oluştur
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  View B: Items View                                                 */
/* ------------------------------------------------------------------ */

function ItemsView() {
  const { token, activeList, setActiveList, setLists, lists } = useAppStore()
  const [items, setItems] = useState<ShoppingItem[]>([])
  const [loading, setLoading] = useState(true)
  const [addItemOpen, setAddItemOpen] = useState(false)
  const [itemName, setItemName] = useState('')
  const [itemQty, setItemQty] = useState('1')
  const [itemUnit, setItemUnit] = useState('adet')
  const [adding, setAdding] = useState(false)
  const [togglingId, setTogglingId] = useState<string | null>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  /* ---------- Fetch items ---------- */
  const fetchItems = useCallback(async () => {
    if (!token || !activeList) return
    setLoading(true)
    try {
      const res = await fetch(
        `/api/lists/items?listId=${activeList.id}`,
        { headers: authHeaders(token) },
      )
      if (res.ok) {
        const data = await res.json()
        setItems(data.items ?? [])
      }
    } catch {
      // silent
    } finally {
      setLoading(false)
    }
  }, [token, activeList])

  useEffect(() => {
    fetchItems()
  }, [fetchItems])

  /* ---------- Computed ---------- */
  const totalItems = items.length
  const completedCount = items.filter((i) => i.completed).length
  const progress = totalItems > 0 ? (completedCount / totalItems) * 100 : 0
  const allCompleted = totalItems > 0 && completedCount === totalItems

  const sortedItems = [...items].sort((a, b) => {
    if (a.completed !== b.completed) return a.completed ? 1 : -1
    return 0
  })

  /* ---------- Handlers ---------- */
  const handleBack = () => {
    setActiveList(null)
  }

  const handleAddItem = async () => {
    if (!token || !activeList || !itemName.trim()) return
    setAdding(true)
    try {
      const res = await fetch('/api/lists/items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({
          listId: activeList.id,
          name: itemName.trim(),
          quantity: Number(itemQty) || 1,
          unit: itemUnit,
        }),
      })
      if (res.ok) {
        toast.success('Ürün eklendi')
        setItemName('')
        setItemQty('1')
        setItemUnit('adet')
        setAddItemOpen(false)
        fetchItems()
      } else {
        toast.error('Ürün eklenemedi')
      }
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setAdding(false)
    }
  }

  const handleToggle = async (itemId: string) => {
    if (!token) return
    setTogglingId(itemId)
    try {
      const res = await fetch('/api/lists/items', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ itemId }),
      })
      if (res.ok) {
        const data = await res.json()
        setItems((prev) =>
          prev.map((item) => (item.id === itemId ? { ...item, ...data.item } : item)),
        )
        // Update list counts in the store
        setLists(
          lists.map((l) => {
            if (l.id === activeList?.id) {
              const newCompleted = data.item.completed
                ? (l._count?.completed ?? 0) + 1
                : (l._count?.completed ?? 0) - 1
              return { ...l, _count: { ...l._count!, completed: newCompleted } }
            }
            return l
          }),
        )
      } else {
        toast.error('Güncellenemedi')
      }
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setTogglingId(null)
    }
  }

  const handleDelete = async (itemId: string) => {
    if (!token) return
    setDeletingId(itemId)
    try {
      const res = await fetch('/api/lists/items', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json', ...authHeaders(token) },
        body: JSON.stringify({ itemId }),
      })
      if (res.ok) {
        toast.success('Ürün silindi')
        setItems((prev) => prev.filter((item) => item.id !== itemId))
        // Update list counts in the store
        const deletedItem = items.find((i) => i.id === itemId)
        setLists(
          lists.map((l) => {
            if (l.id === activeList?.id) {
              return {
                ...l,
                _count: {
                  items: (l._count?.items ?? 1) - 1,
                  completed: (l._count?.completed ?? 0) - (deletedItem?.completed ? 1 : 0),
                },
              }
            }
            return l
          }),
        )
      } else {
        toast.error('Silinemedi')
      }
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setDeletingId(null)
    }
  }

  /* ---------- Loading ---------- */
  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-black">
        <Loader2 className="size-8 animate-spin text-[#FCA311]" />
      </div>
    )
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-lg bg-black px-4 pb-24 pt-6">
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="flex flex-col gap-5"
      >
        {/* ─── Header ─── */}
        <motion.section
          variants={itemVariants}
          className="flex items-center gap-3"
        >
          <Button
            onClick={handleBack}
            variant="ghost"
            size="icon"
            className="shrink-0 text-white/60 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="size-5" />
          </Button>
          <h1 className="min-w-0 truncate text-xl font-bold text-white">
            {activeList?.name}
          </h1>
        </motion.section>

        {/* ─── Summary Bar ─── */}
        <motion.section
          variants={itemVariants}
          className="dark-card rounded-2xl p-4"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingCart className="size-4 text-[#FCA311]" />
              <span className="text-sm text-white/70">
                <span className="font-semibold text-[#FCA311]">
                  {completedCount}
                </span>
                {' / '}{totalItems} tamamlandı
              </span>
            </div>
            <Badge
              className="bg-[#FCA311]/15 text-xs text-[#FCA311] hover:bg-[#FCA311]/20"
            >
              {totalItems > 0 ? Math.round(progress) : 0}%
            </Badge>
          </div>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full"
              style={{
                background: allCompleted
                  ? 'linear-gradient(90deg, #22C55E 0%, #4ADE80 100%)'
                  : 'linear-gradient(90deg, #FCA311 0%, #FFD60A 100%)',
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.6, delay: 0.2, ease: 'easeOut' }}
            />
          </div>
        </motion.section>

        {/* ─── Celebration Message ─── */}
        <AnimatePresence>
          {allCompleted && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -10 }}
              transition={{ type: 'spring', stiffness: 300, damping: 20 }}
              className="rounded-2xl bg-gradient-to-r from-[#FCA311]/10 via-[#FCA311]/20 to-[#FCA311]/10 p-4 text-center"
            >
              <div className="flex items-center justify-center gap-2">
                <Sparkles className="size-5 text-[#FCA311]" />
                <p className="text-base font-semibold text-[#FCA311]">
                  Tüm alışveriş tamamlandı! 🎉
                </p>
                <Sparkles className="size-5 text-[#FCA311]" />
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ─── Add Item Section ─── */}
        <motion.div variants={itemVariants} className="flex flex-col gap-2">
          {!addItemOpen ? (
            <Button
              onClick={() => {
                setAddItemOpen(true)
                setTimeout(() => inputRef.current?.focus(), 100)
              }}
              className="w-full justify-center gap-2 rounded-2xl border border-dashed border-[#FCA311]/30 bg-[#FCA311]/5 text-[#FCA311] hover:bg-[#FCA311]/10"
            >
              <Plus className="size-4" />
              Ekle
            </Button>
          ) : (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="dark-card-elevated flex flex-col gap-3 rounded-2xl p-4"
            >
              <Input
                ref={inputRef}
                value={itemName}
                onChange={(e) => setItemName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                placeholder="Ürün adı"
                className="border-[#FCA311]/20 bg-black/40 text-white placeholder:text-white/30 focus-visible:border-[#FCA311] focus-visible:ring-[#FCA311]/30"
              />
              <div className="flex gap-2">
                <Input
                  value={itemQty}
                  onChange={(e) => setItemQty(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                  placeholder="1"
                  type="number"
                  min={1}
                  className="w-20 shrink-0 border-[#FCA311]/20 bg-black/40 text-center text-white placeholder:text-white/30 focus-visible:border-[#FCA311] focus-visible:ring-[#FCA311]/30"
                />
                <Select value={itemUnit} onValueChange={setItemUnit}>
                  <SelectTrigger
                    className="w-full shrink-0 border-[#FCA311]/20 bg-black/40 text-white focus:ring-[#FCA311]/30 focus:border-[#FCA311]"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="border-white/10 bg-[#0D1B2A]">
                    {UNITS.map((u) => (
                      <SelectItem
                        key={u}
                        value={u}
                        className="text-white focus:bg-[#FCA311]/15 focus:text-[#FCA311]"
                      >
                        {u.charAt(0).toUpperCase() + u.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-2">
                <Button
                  onClick={() => {
                    setAddItemOpen(false)
                    setItemName('')
                    setItemQty('1')
                    setItemUnit('adet')
                  }}
                  variant="ghost"
                  className="flex-1 text-white/60 hover:bg-white/5 hover:text-white"
                >
                  İptal
                </Button>
                <Button
                  onClick={handleAddItem}
                  disabled={!itemName.trim() || adding}
                  className="flex-1 rounded-full bg-[#FCA311] text-black hover:bg-[#FCA311]/90"
                >
                  {adding && <Loader2 className="mr-2 size-4 animate-spin" />}
                  <Plus className="mr-1 size-4" />
                  Ekle
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>

        <Separator className="bg-white/[0.06]" />

        {/* ─── Items List ─── */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, delay: 0.15 }}
            className="dark-card flex flex-col items-center justify-center gap-3 rounded-2xl px-6 py-12"
          >
            <div className="flex size-14 items-center justify-center rounded-full bg-white/5">
              <Package className="size-7 text-white/20" />
            </div>
            <div className="flex flex-col items-center gap-1">
              <p className="text-sm font-medium text-white/50">
                Liste boş
              </p>
              <p className="text-xs text-white/30">
                İlk ürününüzü ekleyerek alışverişe başlayın
              </p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="flex flex-col gap-2"
          >
            <AnimatePresence mode="popLayout">
              {sortedItems.map((item) => (
                <motion.div
                  key={item.id}
                  variants={slideInVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  layout
                  className={`group relative rounded-2xl ${item.completed ? 'opacity-50' : ''}`}
                >
                  <div className="dark-card flex items-center gap-3 rounded-2xl px-4 py-3">
                    {/* Checkbox */}
                    <motion.div
                      whileTap={{ scale: 0.85 }}
                      className="shrink-0"
                    >
                      <Checkbox
                        checked={item.completed}
                        disabled={togglingId === item.id}
                        onCheckedChange={() => handleToggle(item.id)}
                        className="size-5 rounded-md border-white/20 data-[state=checked]:border-[#FCA311] data-[state=checked]:bg-[#FCA311] data-[state=checked]:text-black"
                      />
                    </motion.div>

                    {/* Item info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-medium ${
                          item.completed
                            ? 'text-white/40 line-through'
                            : 'text-white'
                        }`}
                      >
                        {item.name}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <Badge
                          variant="outline"
                          className="border-[#FCA311]/20 bg-[#FCA311]/10 text-xs text-[#FCA311]"
                        >
                          {item.quantity} {item.unit}
                        </Badge>
                        <span className="text-xs text-white/40">
                          {item.adder?.name}
                        </span>
                        {item.completed && item.purchaser?.name && (
                          <span className="text-xs text-green-400/70">
                            <Check className="mr-0.5 inline size-3" />
                            {item.purchaser.name}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Delete button */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{
                        opacity: deletingId === item.id ? 1 : 0.4,
                        scale: 1,
                      }}
                      whileHover={{ opacity: 1, scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      className="shrink-0"
                    >
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-8 text-red-400/60 hover:bg-red-500/10 hover:text-red-400"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDelete(item.id)
                        }}
                        disabled={deletingId === item.id}
                      >
                        {deletingId === item.id ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          <Trash2 className="size-4" />
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </motion.div>
    </main>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Export                                                        */
/* ------------------------------------------------------------------ */

export default function ListScreen() {
  const { activeList } = useAppStore()

  return activeList ? <ItemsView /> : <ListSelectionView />
}
