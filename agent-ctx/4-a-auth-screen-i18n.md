# Task 4-a: Update auth-screen.tsx with new logo and i18n translations

## Changes Made

1. **Added imports**: `Image` from `next/image` and `useTranslation` from `@/lib/i18n`
2. **Added hook**: `const { t } = useTranslation()` inside the component
3. **Replaced ALIVER title**: Removed `<motion.h1>` text and replaced with `<motion.div>` containing `<Image>` pointing to `/aliver-logo-light.png` with spring animation
4. **Replaced slogan**: Hardcoded Turkish slogan → `{t('auth.slogan')}`
5. **Replaced all hardcoded Turkish strings** with i18n translation keys:
   - Error messages (noName, noEmail, noPassword, generic)
   - Loading states (loggingIn, registering)
   - Buttons (login, register)
   - Toggle text (noAccount, hasAccount)
   - Labels and placeholders (name, email, password)
   - Password toggle (hidePassword, showPassword)
   - Separator (common.or)
   - Google login (googleLogin, googleHint)
6. **Removed `text-glow-gold`** class from the old h1

## Status: ✅ Complete
- ESLint passes with no errors
- All 22 translation replacements applied
- All existing animations, styling, and logic preserved
