# Task 4-b: Update home-screen.tsx with theme-aware logos and i18n translations

## Status: ✅ Completed

## Changes Made

### File: `src/components/aliver/home-screen.tsx`

1. **Added imports**:
   - `import { useTranslation } from '@/lib/i18n'`
   - `theme` destructured from `useAppStore()`

2. **Added hooks**:
   - `const { t } = useTranslation()`
   - `theme` added to destructured store values

3. **Replaced branding header**: Removed old logo with gold ring (`ring-[3px] ring-primary/60 ring-offset-2 ring-offset-background`) and ALIVER `<h1>` title. Replaced with theme-aware logo using `aliver-icon-dark.png` / `aliver-icon-light.png` based on `theme` state. Slogan now uses `t('auth.slogan')`.

4. **Replaced ALL hardcoded Turkish strings** with translation keys:
   - `"Merhaba,"` → `{t('home.hello')},`
   - `"Ailenizi Kurun"` → `{t('home.createFamily')}`
   - `"Alışveriş listelerinizi ailenizle paylaşın"` → `{t('home.createFamilyDesc')}`
   - `"Aile Oluştur"` → `{t('home.createFamilyBtn')}`
   - `"üye"` → `{t('home.members')}`
   - `"Liste"` (stat card) → `{t('home.lists')}`
   - `"Bekleyen Ürün"` → `{t('home.pendingItems')}`
   - `"Son Listeler"` → `{t('home.recentLists')}`
   - `"liste"` (count label) → `{t('home.list')}`
   - `"Henüz liste oluşturulmadı"` → `{t('home.noLists')}`
   - `"Ailenizle paylaşmak için bir liste oluşturun"` → `{t('home.noListsDesc')}`
   - `"tamamlandı"` → `{t('home.completed')}`

5. **Kept unchanged**:
   - User name fallback `user?.name ?? 'Kullanıcı'` (names aren't translated)
   - All animations, glass-card classes, and logic preserved
   - Turkish date formatting helpers retained (date formatting is separate from i18n)

## Verification
- ESLint passes with no errors or warnings
- Dev server compiles successfully (no type errors)