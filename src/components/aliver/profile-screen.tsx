'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  User,
  Bell,
  Globe,
  LogOut,
  Shield,
  ListChecks,
  Users,
  ChevronRight,
  Loader2,
  Sun,
  Moon,
  Camera,
  Pencil,
  Check,
  X,
  Mail,
  Trash2,
  ShoppingBag,
  PackageCheck,
  UserPlus,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { toast } from 'sonner'
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { useAppStore, type User as UserType } from '@/store/auth-store'

/* ------------------------------------------------------------------ */
/*  Animation helpers                                                  */
/* ------------------------------------------------------------------ */

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 300, damping: 26 } },
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Stats {
  members: number
  lists: number
  completed: number
}

function titleCase(str: string): string {
  return str
    .split(/\s+/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

export default function ProfileScreen() {
  const {
    user,
    family,
    logout,
    theme,
    toggleTheme,
    notifications,
    setNotifications,
    updateUser,
    token,
  } = useAppStore()

  const [stats, setStats] = useState<Stats>({ members: 0, lists: 0, completed: 0 })
  const [loadingStats, setLoadingStats] = useState(true)

  // Edit profile dialog
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [editName, setEditName] = useState('')
  const [editEmail, setEditEmail] = useState('')
  const [saving, setSaving] = useState(false)

  // Avatar upload
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Remove avatar dialog
  const [removeAvatarOpen, setRemoveAvatarOpen] = useState(false)

  // Logout dialog
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false)

  const fetchStats = useCallback(async () => {
    try {
      const t = useAppStore.getState().token
      const headers: Record<string, string> = {}
      if (t) headers['Authorization'] = `Bearer ${t}`

      const [listsRes] = await Promise.all([fetch('/api/lists', { headers })])

      if (listsRes.ok) {
        const data = await listsRes.json()
        const lists: Array<{ _count?: { items: number; completed: number } }> = data.lists ?? data ?? []
        const totalItems = lists.reduce((sum: number, l) => sum + (l._count?.items ?? 0), 0)
        const completedItems = lists.reduce((sum: number, l) => sum + (l._count?.completed ?? 0), 0)

        const familyId = useAppStore.getState().family?.id
        let memberCount = 1
        if (familyId) {
          try {
            const famRes = await fetch('/api/family/my-family', { headers })
            if (famRes.ok) {
              const famData = await famRes.json()
              memberCount = famData.members?.length ?? famData.family?.members?.length ?? 1
            }
          } catch {
            memberCount = family?.members?.length ?? 1
          }
        }

        setStats({
          members: memberCount,
          lists: Array.isArray(lists) ? lists.length : 0,
          completed: completedItems,
        })
      }
    } catch {
      const familyMembers = family?.members?.length ?? 1
      setStats({ members: familyMembers, lists: 0, completed: 0 })
    } finally {
      setLoadingStats(false)
    }
  }, [family])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  if (!user) return null

  /* ---------------------------------------------------------------- */
  /*  Profile Edit Handlers                                            */
  /* ---------------------------------------------------------------- */

  const openEditDialog = () => {
    setEditName(user.name)
    setEditEmail(user.email)
    setEditDialogOpen(true)
  }

  const handleSaveProfile = async () => {
    if (!token) return
    setSaving(true)
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ name: editName, email: editEmail }),
      })
      if (res.ok) {
        const data = await res.json()
        updateUser(data.user)
        toast.success('Profil güncellendi!')
        setEditDialogOpen(false)
      } else {
        const err = await res.json()
        toast.error(err.error || 'Güncelleme başarısız')
      }
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setSaving(false)
    }
  }

  /* ---------------------------------------------------------------- */
  /*  Avatar Upload Handlers                                           */
  /* ---------------------------------------------------------------- */

  const handleAvatarClick = () => {
    fileInputRef.current?.click()
  }

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !token) return

    setUploadingAvatar(true)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const res = await fetch('/api/auth/avatar', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      if (res.ok) {
        const data = await res.json()
        updateUser({ avatar: data.avatarUrl })
        toast.success('Profil fotoğrafı güncellendi!')
      } else {
        const err = await res.json()
        toast.error(err.error || 'Yükleme başarısız')
      }
    } catch {
      toast.error('Bağlantı hatası')
    } finally {
      setUploadingAvatar(false)
      e.target.value = ''
    }
  }

  const handleRemoveAvatar = async () => {
    if (!token) return
    try {
      const res = await fetch('/api/auth/avatar', {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) {
        const data = await res.json()
        updateUser({ avatar: null })
        toast.success('Profil fotoğrafı kaldırıldı')
      }
    } catch {
      toast.error('Hata oluştu')
    }
    setRemoveAvatarOpen(false)
  }

  const firstLetter = user.name.charAt(0).toUpperCase()

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="max-w-lg mx-auto px-4 pt-8 pb-24 space-y-6"
    >
      {/* ─── Profile Header ─── */}
      <motion.div variants={item} className="flex flex-col items-center gap-4">
        <div className="relative group">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.97 }}
            onClick={handleAvatarClick}
            className="relative cursor-pointer"
          >
            {user.avatar ? (
              <Avatar className="w-24 h-24 ring-2 ring-primary/40 ring-offset-2 ring-offset-background">
                <AvatarImage src={user.avatar} alt={user.name} className="object-cover" />
                <AvatarFallback className="text-3xl font-bold bg-gradient-to-br from-primary to-amber-600 text-black">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
            ) : (
              <div
                className="w-24 h-24 rounded-full flex items-center justify-center text-3xl font-bold text-black select-none ring-2 ring-primary/40 ring-offset-2 ring-offset-background"
                style={{
                  background: 'linear-gradient(135deg, #FCA311 0%, #e08e00 100%)',
                }}
              >
                {firstLetter}
              </div>
            )}
            {/* Upload overlay */}
            <div className="absolute inset-0 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              {uploadingAvatar ? (
                <Loader2 className="w-6 h-6 text-white animate-spin" />
              ) : (
                <Camera className="w-6 h-6 text-white" />
              )}
            </div>
          </motion.div>
          {/* Shield badge */}
          <div className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-secondary flex items-center justify-center ring-2 ring-background">
            <Shield className="w-3.5 h-3.5 text-primary" />
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={handleAvatarUpload}
          className="hidden"
        />

        <div className="text-center">
          <div className="flex items-center justify-center gap-2">
            <h2 className="text-xl font-semibold text-foreground">{user.name}</h2>
            <button
              onClick={openEditDialog}
              className="p-1 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
          </div>
          <p className="text-sm text-muted-foreground mt-0.5 flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            {user.email}
          </p>
        </div>

        {/* Remove avatar button */}
        {user.avatar && (
          <button
            onClick={() => setRemoveAvatarOpen(true)}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors flex items-center gap-1"
          >
            <Trash2 className="w-3 h-3" />
            Fotoğrafı kaldır
          </button>
        )}
      </motion.div>

      {/* ─── Stats ─── */}
      <motion.div variants={item} className="grid grid-cols-3 gap-3">
        {loadingStats ? (
          <div className="col-span-3 flex justify-center py-6">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <StatCard icon={<Users className="w-4 h-4" />} label="Aile Üyeleri" value={stats.members} />
            <StatCard icon={<ShoppingBag className="w-4 h-4" />} label="Listeler" value={stats.lists} />
            <StatCard icon={<PackageCheck className="w-4 h-4" />} label="Tamamlanan" value={stats.completed} />
          </>
        )}
      </motion.div>

      {/* ─── Theme & Appearance ─── */}
      <motion.div variants={item}>
        <SectionTitle icon={<Sun className="w-4 h-4" />} title="Görünüm" />
        <div className="glass-card rounded-2xl divide-y divide-border mt-2">
          {/* Theme toggle */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={theme}
                    initial={{ rotate: -90, opacity: 0 }}
                    animate={{ rotate: 0, opacity: 1 }}
                    exit={{ rotate: 90, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {theme === 'dark' ? (
                      <Moon className="w-4 h-4 text-primary" />
                    ) : (
                      <Sun className="w-4 h-4 text-primary" />
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Tema</span>
                <span className="text-xs text-muted-foreground">
                  {theme === 'dark' ? 'Karanlık Platini' : 'Açık Platini'}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground">
                {theme === 'dark' ? 'Koyu' : 'Açık'}
              </span>
              <Switch
                checked={theme === 'light'}
                onCheckedChange={(checked) => {
                  if (checked) useAppStore.getState().setTheme('light')
                  else useAppStore.getState().setTheme('dark')
                }}
                className="data-[state=checked]:bg-primary"
              />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Notifications ─── */}
      <motion.div variants={item}>
        <SectionTitle icon={<Bell className="w-4 h-4" />} title="Bildirimler" />
        <div className="glass-card rounded-2xl divide-y divide-border mt-2">
          <NotificationToggle
            icon={<ListChecks className="w-4 h-4" />}
            title="Liste Güncellemeleri"
            description="Liste oluşturulduğunda ve düzenlendiğinde"
            checked={notifications.listUpdates}
            onChange={(v) => setNotifications({ listUpdates: v })}
          />
          <NotificationToggle
            icon={<ShoppingBag className="w-4 h-4" />}
            title="Yeni Ürün Eklendi"
            description="Listeye yeni ürün eklendiğinde"
            checked={notifications.newItems}
            onChange={(v) => setNotifications({ newItems: v })}
          />
          <NotificationToggle
            icon={<PackageCheck className="w-4 h-4" />}
            title="Alım Bildirimleri"
            description="Bir ürün alındı olarak işaretlendiğinde"
            checked={notifications.purchaseAlerts}
            onChange={(v) => setNotifications({ purchaseAlerts: v })}
          />
          <NotificationToggle
            icon={<UserPlus className="w-4 h-4" />}
            title="Aile Aktiviteleri"
            description="Yeni üye katıldığında veya ayrıldığında"
            checked={notifications.familyActivity}
            onChange={(v) => setNotifications({ familyActivity: v })}
          />
        </div>
      </motion.div>

      {/* ─── Account & General ─── */}
      <motion.div variants={item}>
        <SectionTitle icon={<User className="w-4 h-4" />} title="Hesap" />
        <div className="glass-card rounded-2xl divide-y divide-border mt-2">
          {/* Language */}
          <div className="flex items-center justify-between px-4 py-3.5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
                <Globe className="w-4 h-4 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-medium text-foreground">Dil Seçimi</span>
                <span className="text-xs text-muted-foreground">Uygulama dili</span>
              </div>
            </div>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <span className="text-sm">Türkçe</span>
              <ChevronRight className="w-4 h-4" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* ─── Logout ─── */}
      <motion.div variants={item}>
        <button
          onClick={() => setLogoutDialogOpen(true)}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl border border-primary/40 text-primary text-sm font-semibold hover:bg-primary/10 active:scale-[0.98] transition-all"
        >
          <LogOut className="w-4 h-4" />
          Çıkış Yap
        </button>
      </motion.div>

      {/* ─── Version ─── */}
      <motion.div variants={item} className="text-center pb-4">
        <p className="text-xs text-muted-foreground/40">ALIVER v1.0.0</p>
      </motion.div>

      {/* ─── Edit Profile Dialog ─── */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="rounded-2xl border-border bg-background sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-foreground">Profili Düzenle</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              İsim ve e-posta adresinizi güncelleyin
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-4 py-2">
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-name" className="text-sm text-foreground">
                İsim
              </Label>
              <Input
                id="edit-name"
                value={editName}
                onChange={(e) => setEditName(titleCase(e.target.value))}
                placeholder="Adınız Soyadınız"
                className="glass-input border-border bg-background text-foreground"
                autoFocus
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="edit-email" className="text-sm text-foreground">
                E-posta Adresi
              </Label>
              <Input
                id="edit-email"
                type="email"
                value={editEmail}
                onChange={(e) => setEditEmail(e.target.value.toLowerCase())}
                placeholder="ornek@email.com"
                className="glass-input border-border bg-background text-foreground"
              />
            </div>
          </div>
          <DialogFooter className="flex-row gap-2">
            <DialogClose asChild>
              <Button
                variant="ghost"
                className="flex-1 text-muted-foreground hover:bg-primary/5 hover:text-foreground"
              >
                <X className="w-4 h-4 mr-1" />
                İptal
              </Button>
            </DialogClose>
            <Button
              onClick={handleSaveProfile}
              disabled={saving || !editName.trim() || !editEmail.trim()}
              className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-1" />
              )}
              Kaydet
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ─── Remove Avatar Dialog ─── */}
      <AlertDialog open={removeAvatarOpen} onOpenChange={setRemoveAvatarOpen}>
        <AlertDialogContent className="rounded-2xl border-border bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Fotoğrafı Kaldır</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Profil fotoğrafınızı kaldırmak istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel
              className="flex-1 text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRemoveAvatar}
              className="flex-1 rounded-full bg-destructive text-white hover:bg-destructive/90"
            >
              Kaldır
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ─── Logout Dialog ─── */}
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="rounded-2xl border-border bg-background">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-foreground">Çıkış Yap</AlertDialogTitle>
            <AlertDialogDescription className="text-muted-foreground">
              Hesabınızdan çıkış yapmak istediğinizden emin misiniz?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-row gap-2">
            <AlertDialogCancel
              className="flex-1 text-muted-foreground hover:bg-primary/5 hover:text-foreground"
            >
              İptal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setLogoutDialogOpen(false)
                logout()
              }}
              className="flex-1 rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <LogOut className="w-4 h-4 mr-1" />
              Çıkış Yap
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/*  Section Title                                                      */
/* ------------------------------------------------------------------ */

function SectionTitle({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 px-1">
      <div className="text-primary">{icon}</div>
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        {title}
      </h3>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Notification Toggle Row                                            */
/* ------------------------------------------------------------------ */

function NotificationToggle({
  icon,
  title,
  description,
  checked,
  onChange,
}: {
  icon: React.ReactNode
  title: string
  description: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between px-4 py-3.5">
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 shrink-0 rounded-xl bg-primary/10 flex items-center justify-center">
          <div className="text-primary">{icon}</div>
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-sm font-medium text-foreground">{title}</span>
          <span className="text-xs text-muted-foreground leading-tight">{description}</span>
        </div>
      </div>
      <Switch
        checked={checked}
        onCheckedChange={onChange}
        className="data-[state=checked]:bg-primary shrink-0"
      />
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Stat Card sub-component                                            */
/* ------------------------------------------------------------------ */

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode
  label: string
  value: number
}) {
  return (
    <div className="glass-card hover-border-glow rounded-2xl p-4 flex flex-col items-center gap-2 text-center">
      <div className="text-primary">{icon}</div>
      <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      <span className="text-[11px] text-muted-foreground leading-tight">{label}</span>
    </div>
  )
}
