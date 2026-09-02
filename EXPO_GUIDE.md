# ALIVER - Expo Mobil Uygulama Rehberi

Bu rehber, ALIVER'ı **Expo** ile mobil uygulamaya dönüştürmeniz ve **APK** olarak indirmeniz için adım adım talimatlar içerir.

---

## 📋 Ön Hazırlık

```bash
# Gerekli araçlar
node --version   # v18+ olmalı
npm --version
```

---

## Yöntem 1: Expo ile Sıfırdan Mobil Uygulama (Önerilen)

### Adım 1: Expo Projesi Oluşturun

```bash
npx create-expo-app@latest aliver-mobile --template blank-typescript
cd aliver-mobile
```

### Adım 2: Bağımlılıkları Kurun

```bash
# Navigasyon
npx expo install @react-navigation/native @react-navigation/bottom-tabs @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context

# UI & State
npm install zustand framer-motion
npm install react-native-svg  # QR kod için
npm install qrcode.react  # QR kod oluşturma

# Supabase (Google Auth + Veritabanı)
npm install @supabase/supabase-js
npm install expo-auth-session expo-crypto

# Icons
npm install react-native-svg-transformer react-native-paper
```

### Adım 3: Dosya Yapısını Oluşturun

```
aliver-mobile/
├── app/                    # Expo Router (app/ dizini)
│   ├── _layout.tsx         # Root layout (tema, fontlar)
│   ├── index.tsx           # Auth screen
│   ├── (tabs)/
│   │   ├── _layout.tsx     # Bottom tabs layout
│   │   ├── home.tsx
│   │   ├── family.tsx
│   │   ├── list.tsx
│   │   └── profile.tsx
│   └── list/[id].tsx       # Liste detay
├── components/
│   ├── auth-screen.tsx
│   ├── home-screen.tsx
│   ├── family-screen.tsx
│   ├── list-screen.tsx
│   ├── profile-screen.tsx
│   ├── bottom-nav.tsx
│   └── fab-widget.tsx
├── store/
│   └── auth-store.ts       # Zustand (aynısı)
├── lib/
│   ├── supabase.ts         # Supabase client
│   └── utils.ts
├── assets/
│   └── fonts/
└── app.json
```

### Adım 4: Supabase Client'ı Ayarlayın

```typescript
// lib/supabase.ts
import 'react-native-url-polyfill/auto'
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Adım 5: Google Auth (Supabase)

**Supabase Dashboard'da:**
1. **Authentication > Providers > Google**'u açın
2. Google Cloud Console'dan **Client ID** alıp yapıştırın
3. **Redirect URL** olarak: `https://YOUR_PROJECT.supabase.co/auth/v1/callback`

**app.json'a ekle:**
```json
{
  "expo": {
    "scheme": "aliver",
    "extra": {
      "expoClient": {
        "scheme": "aliver"
      }
    }
  }
}
```

**Google Login kodu:**
```typescript
// lib/auth.ts
import * as WebBrowser from 'expo-web-browser'
import * as Google from 'expo-auth-session/providers/google'
import { makeRedirectUri } from 'expo-auth-session'
import { supabase } from './supabase'

WebBrowser.maybeCompleteAuthSession()

const [request, response, promptAsync] = Google.useAuthRequest({
  clientId: process.env.EXPO_PUBLIC_GOOGLE_CLIENT_ID,
  // iOS
  expoClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  // Android
  androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
})

// Kullanıcının tıkladığı fonksiyon
async function signInWithGoogle() {
  const result = await promptAsync()
  if (result.type === 'success') {
    const { data, error } = await supabase.auth.signInWithIdToken({
      token: result.params.id_token,
      provider: 'google',
    })
    return data.session
  }
}
```

### Adım 6: Expo Router Layout

```typescript
// app/_layout.tsx
import { Stack } from 'expo-router'
import { StatusBar } from 'expo-status-bar'

export default function RootLayout() {
  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }} />
    </>
  )
}
```

```typescript
// app/(tabs)/_layout.tsx
import { Tabs } from 'expo-router'
import { Home, Users, ShoppingCart, User, ShoppingBag } from 'lucide-react-native'

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: 'rgba(0,0,0,0.9)',
          borderTopWidth: 0,
          elevation: 0,
        },
        tabBarActiveTintColor: '#FCA311',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.35)',
      }}
    >
      <Tabs.Screen name="home" options={{
        title: 'Ana Sayfa', tabBarIcon: ({ color }) => <Home color={color} size={22} />
      }} />
      <Tabs.Screen name="family" options={{
        title: 'Aile', tabBarIcon: ({ color }) => <Users color={color} size={22} />
      }} />
      <Tabs.Screen name="list" options={{
        title: 'Liste', tabBarIcon: ({ color }) => <ShoppingCart color={color} size={22} />
      }} />
      <Tabs.Screen name="profile" options={{
        title: 'Profil', tabBarIcon: ({ color }) => <User color={color} size={22} />
      }} />
    </Tabs>
  )
}
```

---

## 🚀 APK Olarak İndirme

### Yöntem A: EAS Build (En Kolay - Cloud Build)

```bash
# 1. Expo hesabına giriş yap
npx expo login

# 2. EAS CLI'i kurun
npm install -g eas-cli

# 3. app.json'u yapılandırın
```

**app.json'a ekle:**
```json
{
  "expo": {
    "name": "ALIVER",
    "slug": "aliver",
    "version": "1.0.0",
    "android": {
      "package": "com.aliver.app",
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#000000"
      },
      "splash": {
        "backgroundColor": "#000000"
      }
    },
    "extra": {
      "eas": {
        "projectId": "YOUR_EAS_PROJECT_ID"
      }
    }
  }
}
```

```bash
# 4. APK oluştur (preview build ~10 dk)
eas build --platform android --profile preview

# 5. İndirme linki alırsınız, telefondan açıp yükleyin
```

### Yöntem B: Lokal APK Build (Bilgisayarınızda)

```bash
# 1. Android Studio kurun
# 2. ANDROID_HOME ortam değişkenini ayarlayın
# 3. JDK 17 kurun

# 4. Expo prebuild çalıştırın
npx expo prebuild --platform android

# 5. Android Studio ile açın
npx expo run:android

# 6. Android Studio > Build > Build Bundle(s) / APK(s) > Build APK(s)

# APK konumu: android/app/build/outputs/apk/debug/app-debug.apk
```

### Yöntem C: Expo Go ile Test (Geliştirme İçin)

```bash
# 1. Telefondan Expo Go uygulamasını indirin (Play Store / App Store)

# 2. Projeyi başlatın
cd aliver-mobile
npx expo start

# 3. QR kodu okutun, uygulama telefonunuza yüklenir
```

---

## 📦 Next.js → Expo Taşıma Cheatsheet

| Next.js | Expo (React Native) |
|---------|---------------------|
| `next/link` | `expo-router` Link |
| `next/font` | `expo-font` veya `@expo-google-fonts/outfit` |
| `framer-motion` | `react-native-reanimated` + `moti` |
| `lucide-react` | `lucide-react-native` |
| `qrcode.react` | `react-native-qrcode-svg` |
| `sonner` (toast) | `react-native-toast-message` |
| `shadcn/ui` | `react-native-paper` veya `tamagui` |
| `fetch('/api/...')` | `supabase.from('table')...` (doğrudan Supabase) |
| CSS `backdrop-filter` | Desteklenmiyor (alternatif: opak bg) |
| CSS `glass-card` | `View` + opak arka plan renkleri |
| `zustand` | Aynı (`zustand`) |

---

## 🔑 .env Dosyası (Expo)

```env
# Supabase
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Google Auth
EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID=xxxxx.apps.googleusercontent.com
EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID=xxxxx.apps.googleusercontent.com
```

> ⚠️ Expo'da `NEXT_PUBLIC_` yerine `EXPO_PUBLIC_` öneki kullanılır.

---

## 💡 Önemli Notlar

1. **Glass Efektleri**: React Native'de `backdrop-filter` yoktur. Bunun yerine yarı saydam renkler (`rgba`) kullanın.
2. **Animasyonlar**: `framer-motion` yerine `react-native-reanimated` kullanın. API benzer ama daha performanslı.
3. **Veritabanı**: Next.js API route'ları yerine doğrudan Supabase client kullanın (`supabase.from('User').select()`).
4. **QR Kod**: `react-native-qrcode-svg` kullanın.
5. **Font**: `@expo-google-fonts/outfit` paketini kullanın.
6. **Navigasyon**: `expo-router` (file-based routing) Next.js App Router'a çok benzer.

---

## 🎯 Hızlı Başlangıç (5 Dakika)

```bash
# 1. Projeyi oluştur
npx create-expo-app@latest aliver-mobile --template blank-typescript
cd aliver-mobile

# 2. Supabase + navigasyon kur
npm install @supabase/supabase-js zustand expo-router
npx expo install react-native-screens react-native-safe-area-context

# 3. Supabase SQL'i çalıştır (Dashboard > SQL Editor)
# 4. .env dosyasını oluştur
# 5. Component'ları kopyala (store, components, lib)
# 6. API çağrılarını Supabase client'a dönüştür
# 7. Test et
npx expo start

# 8. APK al
npx expo install expo-dev-client
eas build --platform android --profile preview
```
