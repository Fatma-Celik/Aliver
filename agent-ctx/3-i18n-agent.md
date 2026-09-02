---
Task ID: 3
Agent: i18n Developer
Task: Create the i18n translation system

Work Log:
- Created `/home/z/my-project/src/lib/i18n.ts` with complete translation system
- Defined `TranslationMap` type as `Record<string, string>`
- Created full translation maps for Turkish (`tr`), English (`en`), and Arabic (`ar`)
- Arabic translations use proper Arabic text (not transliterated Turkish)
- All 120+ translation keys across 7 sections: common, nav, auth, home, family, list, profile
- Implemented `createTranslationProxy()` using ES6 Proxy for dot-notation access (e.g., `t.nav.home`)
- Exported `useTranslation()` hook that reads `language` from Zustand `useAppStore`
- Hook returns `{ t, language, dir }` where `dir` is `'rtl'` for Arabic, `'ltr'` for Turkish/English
- ESLint passes cleanly with no errors

Stage Summary:
- Complete i18n system with 3 languages and 120+ keys
- Proxy-based translation accessor for intuitive dot-notation usage
- RTL support via `dir` return value
- Zero lint errors
