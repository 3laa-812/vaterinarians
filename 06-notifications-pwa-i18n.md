# Notifications, PWA & i18n

---

## Notifications — Novu Setup

### Why Novu
- Free tier: 30,000 events/month — enough for dozens of clinics
- Single API handles Web Push + WhatsApp + Email from one place
- Dashboard to monitor delivery, failures, retry
- Doctor is a `subscriber` in Novu — notifications target them by `subscriberId`

### Novu Subscriber Lifecycle

```
Doctor created in DB
  │
  ▼
POST to Novu: create subscriber
  {
    subscriberId: user.id,
    firstName: user.name,
    phone: user.phone,       // for WhatsApp fallback
    email: user.email,
    locale: user.preferredLang
  }
  │
  ▼
Store novuSubscriberId on User record
```

### Notification Channels (Priority Order)

```
1. Web Push (primary)
   → Works on Android Chrome + Desktop always
   → Works on iOS Safari 16.4+ only if PWA is installed from Home Screen

2. WhatsApp (fallback)
   → Triggered if Web Push delivery fails or doctor is on iOS
   → Uses Meta Cloud API (free up to 1000 conversations/month)
   → Simple text: "تذكير: لديك كشف لـ [اسم الحيوان] الساعة [الوقت]"
```

### Novu Workflow Definition

```
Workflow ID: "appointment-reminder"

Trigger payload:
  {
    patientName: string      // animal name
    ownerName: string
    appointmentTime: string  // formatted per doctor's locale
    hoursUntil: 24 | 1
    clinicName: string
  }

Steps:
  1. Web Push step
     Title (AR): "تذكير موعد 🐾"
     Body (AR):  "لديك كشف لـ {{patientName}} خلال {{hoursUntil}} ساعة"
     Title (EN): "Appointment Reminder 🐾"
     Body (EN):  "You have a session for {{patientName}} in {{hoursUntil}} hour(s)"

  2. WhatsApp step (if push fails)
     Message (AR): "تذكير: موعد كشف {{patientName}} (مع {{ownerName}}) الساعة {{appointmentTime}}"
     Message (EN): "Reminder: Session for {{patientName}} (owner: {{ownerName}}) at {{appointmentTime}}"
```

### Cron Scheduler

```typescript
// vercel.json
{
  "crons": [
    {
      "path": "/api/cron/send-reminders",
      "schedule": "0 * * * *"   // every hour on the hour
    }
  ]
}
```

```typescript
// src/app/api/cron/send-reminders/route.ts

export async function GET(req: Request) {
  // Security: only Vercel can call this
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: { en: 'Unauthorized', ar: 'غير مصرح' } }, { status: 401 })
  }

  const now = new Date()
  let sent24h = 0
  let sent1h = 0

  // ── 24h reminders ──
  const window24hStart = now
  const window24hEnd = new Date(now.getTime() + 25 * 60 * 60 * 1000) // +25h buffer

  const appts24h = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: window24hStart, lte: window24hEnd },
      reminderSent24h: false,
      status: 'SCHEDULED',
    },
    include: {
      animal: true,
      doctor: true,
      animal: { include: { owner: true } },
    }
  })

  for (const appt of appts24h) {
    await novu.trigger('appointment-reminder', {
      to: { subscriberId: appt.doctor.novuSubscriberId! },
      payload: {
        patientName: appt.animal.name,
        ownerName: appt.animal.owner.name,
        appointmentTime: formatTime(appt.scheduledAt, appt.doctor.preferredLang),
        hoursUntil: 24,
        clinicName: '',
      }
    })
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderSent24h: true }
    })
    sent24h++
  }

  // ── 1h reminders ──
  const window1hStart = now
  const window1hEnd = new Date(now.getTime() + 65 * 60 * 1000) // +65min buffer

  const appts1h = await prisma.appointment.findMany({
    where: {
      scheduledAt: { gte: window1hStart, lte: window1hEnd },
      reminderSent1h: false,
      status: 'SCHEDULED',
    },
    include: {
      animal: { include: { owner: true } },
      doctor: true,
    }
  })

  for (const appt of appts1h) {
    await novu.trigger('appointment-reminder', {
      to: { subscriberId: appt.doctor.novuSubscriberId! },
      payload: {
        patientName: appt.animal.name,
        ownerName: appt.animal.owner.name,
        appointmentTime: formatTime(appt.scheduledAt, appt.doctor.preferredLang),
        hoursUntil: 1,
      }
    })
    await prisma.appointment.update({
      where: { id: appt.id },
      data: { reminderSent1h: true }
    })
    sent1h++
  }

  return Response.json({ data: { sent24h, sent1h, timestamp: now.toISOString() } })
}
```

---

## PWA Configuration

### next.config.ts

```typescript
import withPWA from 'next-pwa'

const nextConfig = {
  // next-intl handles locale routing
  experimental: { serverActions: true }
}

export default withPWA({
  dest: 'public',
  register: true,
  skipWaiting: false,          // NEVER auto-update silently — show banner instead
  disable: process.env.NODE_ENV === 'development',

  runtimeCaching: [
    // Today's appointments — try network first, fall back to cache
    {
      urlPattern: /^\/api\/appointments\?date=/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'appointments-today',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 10, maxAgeSeconds: 60 * 60 * 8 }, // 8 hours
      }
    },
    // Animal list — network first
    {
      urlPattern: /^\/api\/animals/,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'animals-cache',
        networkTimeoutSeconds: 5,
        expiration: { maxEntries: 100, maxAgeSeconds: 60 * 60 * 24 },
      }
    },
    // Static assets — cache first, they never change between deploys
    {
      urlPattern: /\.(js|css|woff2|png|svg|ico)$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-assets',
        expiration: { maxEntries: 200, maxAgeSeconds: 60 * 60 * 24 * 30 },
      }
    },
  ],

  // Background sync for offline session saves
  buildExcludes: [/middleware-manifest\.json$/],
})(nextConfig)
```

### public/manifest.json

```json
{
  "name": "نظام العيادة البيطرية",
  "short_name": "العيادة",
  "description": "نظام متابعة المرضى والمواعيد البيطرية",
  "start_url": "/ar/home",
  "scope": "/",
  "display": "standalone",
  "orientation": "portrait-primary",
  "background_color": "#0C0E14",
  "theme_color": "#14B8A6",
  "lang": "ar",
  "dir": "rtl",
  "icons": [
    {
      "src": "/icons/icon-192.png",
      "sizes": "192x192",
      "type": "image/png",
      "purpose": "any maskable"
    },
    {
      "src": "/icons/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [],
  "categories": ["medical", "productivity"]
}
```

### PWA Update Banner Component

```typescript
// src/hooks/usePWAUpdate.ts
import { useEffect, useState } from 'react'

export function usePWAUpdate() {
  const [updateAvailable, setUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(reg => {
        setRegistration(reg)
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          newWorker?.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              setUpdateAvailable(true)
            }
          })
        })
      })
    }
  }, [])

  const applyUpdate = () => {
    registration?.waiting?.postMessage({ type: 'SKIP_WAITING' })
    window.location.reload()
  }

  return { updateAvailable, applyUpdate }
}
```

```typescript
// src/components/layout/UpdateBanner.tsx
// Shows when a new PWA version is available
// Doctor sees it and taps once to update — no surprises
```

### Offline Detection

```typescript
// src/hooks/useOffline.ts
import { useEffect, useState } from 'react'

export function useOffline() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const goOffline = () => setIsOffline(true)
    const goOnline = () => setIsOffline(false)

    window.addEventListener('offline', goOffline)
    window.addEventListener('online', goOnline)

    return () => {
      window.removeEventListener('offline', goOffline)
      window.removeEventListener('online', goOnline)
    }
  }, [])

  return isOffline
}
```

### Session Form — Offline Save Strategy

```
Doctor fills session form
  │
  ▼
Tap "حفظ وإنهاء الكشف"
  │
  ├── Online → POST /api/appointments/[id]/session → success → navigate
  │
  └── Offline
        │
        ▼
        Save to localStorage:
        key: "pending_session_[appointmentId]"
        value: { weight, clinicalNotes, treatmentPlan, nextVisitDate, paymentData, savedAt }
        │
        ▼
        Show: "محفوظ محلياً ✓ — سيُرسل عند عودة الاتصال"
        │
        ▼
        When online event fires →
        Read all "pending_session_*" keys →
        POST each to API →
        Show: "تمت المزامنة ✓" →
        Clear localStorage keys
```

---

## i18n — Multilingual Setup

### Library: next-intl

Best choice for Next.js App Router — handles:
- Locale routing (`/ar/...` and `/en/...`)
- RTL/LTR direction switching
- Server and client component translations
- Locale-aware date/number formatting

### Locale Routing

```
/ar/home          → Arabic RTL
/en/home          → English LTR

Middleware redirects:
  / → reads user.preferredLang from session → /ar/... or /en/...
  /home → /ar/home (default)
```

### i18n Config

```typescript
// src/lib/i18n.ts
import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async ({ locale }) => ({
  messages: (await import(`../../messages/${locale}.json`)).default
}))
```

### Messages Structure

```json
// messages/ar.json
{
  "nav": {
    "home": "اليوم",
    "animals": "المرضى",
    "appointments": "المواعيد",
    "owners": "المرافقون",
    "admin": "الإدارة",
    "profile": "حسابي"
  },
  "home": {
    "greeting": "مرحباً {name}",
    "nextAppointment": "التالي — بعد {minutes} دقيقة",
    "noAppointments": "لا مواعيد اليوم",
    "allDone": "أنهيت كل مواعيد اليوم ✓"
  },
  "animal": {
    "currentWeight": "الوزن الحالي",
    "startingWeight": "وزن البداية",
    "weightLost": "خسر",
    "sessions": "جلسة",
    "newSession": "كشف جديد",
    "medicalHistory": "التاريخ الطبي",
    "pastSessions": "الجلسات السابقة"
  },
  "session": {
    "weight": "الوزن",
    "lastWeight": "آخر وزن",
    "clinicalNotes": "ملاحظات الكشف",
    "treatmentPlan": "الخطة العلاجية",
    "nextVisit": "الموعد القادم",
    "save": "حفظ وإنهاء الكشف",
    "autoSaving": "جاري الحفظ...",
    "savedLocally": "محفوظ محلياً ✓",
    "synced": "تمت المزامنة ✓"
  },
  "payment": {
    "fee": "رسوم الكشف",
    "paid": "المدفوع",
    "remaining": "المتبقي",
    "status": {
      "PAID": "مدفوع ✓",
      "PARTIAL": "دفع جزء",
      "UNPAID": "لم يُدفع"
    }
  },
  "appointment": {
    "status": {
      "SCHEDULED": "مجدول",
      "COMPLETED": "اكتمل",
      "ABSENT": "غاب",
      "POSTPONED": "مؤجل"
    }
  },
  "errors": {
    "saveFailed": "تعذر الحفظ، حاول مرة أخرى",
    "loadFailed": "تعذر تحميل البيانات",
    "unauthorized": "غير مصرح لك بهذا الإجراء",
    "notFound": "العنصر المطلوب غير موجود",
    "offline": "أنت غير متصل بالإنترنت"
  },
  "offline": {
    "banner": "أنت غير متصل — البيانات محفوظة محلياً",
    "sessionSaved": "محفوظ محلياً ✓ — سيُرسل عند عودة الاتصال",
    "syncing": "جاري المزامنة...",
    "synced": "تمت المزامنة ✓"
  },
  "update": {
    "available": "يوجد تحديث جديد",
    "action": "تحديث الآن"
  }
}
```

```json
// messages/en.json — same structure, English values
{
  "nav": {
    "home": "Today",
    "animals": "Animals",
    "appointments": "Appointments",
    "owners": "Owners",
    "admin": "Admin",
    "profile": "Profile"
  },
  "home": {
    "greeting": "Hello, {name}",
    "nextAppointment": "Next — in {minutes} minutes",
    "noAppointments": "No appointments today",
    "allDone": "All done for today ✓"
  }
}
```

### Direction Handling

```typescript
// src/app/[locale]/layout.tsx
import { notFound } from 'next/navigation'
import { NextIntlClientProvider } from 'next-intl'

const locales = ['ar', 'en']

export default async function LocaleLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode
  params: { locale: string }
}) {
  if (!locales.includes(locale)) notFound()

  const messages = (await import(`../../../messages/${locale}.json`)).default

  return (
    <html
      lang={locale}
      dir={locale === 'ar' ? 'rtl' : 'ltr'}   // ← RTL/LTR on html tag
    >
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  )
}
```

### Language Toggle Component

```typescript
// src/components/shared/LangToggle.tsx
'use client'
import { useLocale } from 'next-intl'
import { useRouter, usePathname } from 'next-intl/client'

export function LangToggle() {
  const locale = useLocale()
  const router = useRouter()
  const pathname = usePathname()

  const toggle = async () => {
    const newLocale = locale === 'ar' ? 'en' : 'ar'

    // Save preference to DB in background
    fetch('/api/auth/language', {
      method: 'PATCH',
      body: JSON.stringify({ lang: newLocale }),
      headers: { 'Content-Type': 'application/json' }
    })

    // Switch locale immediately — no page reload
    router.replace(pathname, { locale: newLocale })
  }

  return (
    <button
      onClick={toggle}
      className="lang-toggle"
      aria-label="Switch language"
    >
      {locale === 'ar' ? 'EN' : 'ع'}
    </button>
  )
}
```

### Tailwind RTL Config

```typescript
// tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        // Arabic — used when dir=rtl
        arabic: ['Cairo', 'sans-serif'],
        // English — used when dir=ltr
        sans: ['Inter', 'sans-serif'],
      }
    }
  },
  plugins: [
    require('tailwindcss-rtl'),  // Enables ms-*/me-*/ps-*/pe-* logical properties
  ],
} satisfies Config
```

**CSS Logical Properties** (RTL-safe):
```
Instead of:        Use:
ml-4           →   ms-4   (margin-inline-start)
mr-4           →   me-4   (margin-inline-end)
pl-4           →   ps-4   (padding-inline-start)
text-left      →   text-start
text-right     →   text-end
left-0         →   start-0
right-0        →   end-0
```

This ensures every component automatically flips correctly between AR (RTL) and EN (LTR) with zero extra code.
