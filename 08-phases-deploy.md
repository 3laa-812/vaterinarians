# Development Phases, Deployment & Agent Instructions

---

## Development Phases

### Phase 1 — Foundation
**Goal:** Project runs locally, auth works, DB connected.

- [ ] `npx create-next-app@latest` with TypeScript + Tailwind + App Router
- [ ] Install and configure: Prisma, NextAuth v5, next-intl, next-pwa, shadcn/ui
- [ ] `prisma/schema.prisma` — full schema from `02-data-model.md`
- [ ] `prisma migrate dev --name init`
- [ ] `prisma db seed` — super admin + demo clinic + demo doctor
- [ ] NextAuth login page (`/ar/login` and `/en/login`)
- [ ] Middleware — route protection + locale redirect
- [ ] Main dashboard layout (Sidebar + TopBar + MobileNav shell)
- [ ] LangToggle component wired to next-intl
- [ ] `messages/ar.json` + `messages/en.json` — all strings
- [ ] PWA manifest + next-pwa config
- [ ] Tailwind RTL plugin + Cairo + Inter fonts

**Done when:** Doctor can log in, see empty dashboard, switch language, install PWA on phone.

---

### Phase 2 — Core Features
**Goal:** Full CRUD for animals, owners, appointments. Doctor can do their daily job.

- [ ] Animals API routes (`/api/animals`, `/api/animals/[id]`)
- [ ] Owners API routes
- [ ] Appointments API routes
- [ ] Animal list page with search + filter
- [ ] Add Animal + Owner flow (2-step form)
- [ ] Animal Profile page (stats, weight chart placeholder, session timeline)
- [ ] Appointments Calendar page (week view)
- [ ] Today's Schedule — Home page
- [ ] Appointment booking form
- [ ] All components: AnimalCard, OwnerBlock, AppointmentCard, StatusBadge, SpeciesTag

**Done when:** Doctor can add a new animal + owner, book an appointment, and see today's schedule.

---

### Phase 3 — Sessions & Payments
**Goal:** The core clinical workflow — record exam, track weight, record payment.

- [ ] Session API (`POST /api/appointments/[id]/session`)
- [ ] Payment API (`POST/PUT /api/appointments/[id]/payment`)
- [ ] Session form page — weight input, notes, treatment plan, next visit, payment
- [ ] WeightDeltaBadge — auto-calculate from previous session
- [ ] WeightChart — Recharts line chart on Animal Profile
- [ ] Payment section in session form
- [ ] PaymentBadge on appointment cards
- [ ] Remaining balance visible on Animal Profile
- [ ] Session Timeline on Animal Profile
- [ ] Auto-save session form to localStorage every 10 seconds
- [ ] Offline queue + background sync for session saves

**Done when:** Doctor can open an appointment, record the exam, track weight history, and log payment.

---

### Phase 4 — Notifications
**Goal:** Doctors receive reminders before appointments automatically.

- [ ] Novu account setup + create `appointment-reminder` workflow
- [ ] `src/lib/novu.ts` — client + trigger helper
- [ ] Create Novu subscriber when doctor is created
- [ ] Cron route `/api/cron/send-reminders`
- [ ] `vercel.json` cron schedule
- [ ] Web Push permission request on first login (non-intrusive)
- [ ] Test: book appointment 1h from now → confirm notification arrives
- [ ] WhatsApp fallback configured in Novu workflow

**Done when:** Vet receives a push notification 24h and 1h before every appointment.

---

### Phase 5 — Polish & Deploy
**Goal:** Production-ready, stable, good-looking.

- [ ] OfflineBanner component
- [ ] UpdateBanner component (PWA new version)
- [ ] Skeleton screens for all loading states
- [ ] All error states in Arabic + English
- [ ] Admin panel — Clinics + Doctors management
- [ ] Super Admin: create clinic + assign clinic admin
- [ ] Responsive design audit — test on iPhone + Android
- [ ] RTL audit — every component looks correct in Arabic
- [ ] Performance: lazy-load WeightChart, virtualize long animal lists
- [ ] Deploy to Vercel (app) + Railway (PostgreSQL)
- [ ] Set all environment variables in Vercel dashboard
- [ ] Test PWA install on iOS + Android
- [ ] Smoke test all flows end-to-end

---

## Deployment

### Vercel (App)
```bash
# Connect GitHub repo to Vercel
# Set environment variables in Vercel dashboard
# Deploy on every push to main

vercel --prod
```

### Railway (PostgreSQL)
```bash
# Create new PostgreSQL service on Railway
# Copy connection string to Vercel DATABASE_URL
# Run migrations on deploy:

# In package.json:
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma migrate deploy && next build"
}
```

### Deploy Checklist
```
Before first deploy:
  [ ] All env vars set in Vercel
  [ ] DATABASE_URL points to Railway production DB
  [ ] prisma migrate deploy runs on build
  [ ] CRON_SECRET set (same value in vercel.json crons config)
  [ ] NEXTAUTH_URL set to production domain
  [ ] Novu webhook URL updated to production domain

After deploy:
  [ ] Run seed on production DB (one time):
      npx prisma db seed -- --preview-feature
  [ ] Test login with seed credentials
  [ ] Test PWA install on mobile
  [ ] Book a test appointment 1h ahead → verify notification
  [ ] Test language toggle AR ↔ EN
  [ ] Test offline mode: disable WiFi → view today's schedule
```

---

## Agent Instructions

> These are instructions for the AI coding agent implementing this system.
> Read ALL `.md` files in this folder before writing any code.

### File Reading Order
1. `01-overview.md` — understand the product and scope
2. `02-data-model.md` — understand the schema before touching any code
3. `03-project-structure.md` — understand folder layout and tech stack
4. `04-api-routes.md` — understand all API shapes before implementing
5. `05-ux-flows.md` — understand screens before building components
6. `06-notifications-pwa-i18n.md` — understand notifications, offline, and i18n
7. `07-auth-roles-env.md` — understand auth and role scoping
8. `08-phases-deploy.md` (this file) — understand build order and deploy

### Critical Rules

**Language:**
- NEVER hardcode any UI string. Every string goes through `useTranslations()` from next-intl.
- Every component must work in both RTL (Arabic) and LTR (English).
- Use Tailwind logical properties: `ms-*`, `me-*`, `ps-*`, `pe-*`, `start-*`, `end-*` — never `left-*` or `right-*`.

**Auth & Scoping:**
- EVERY API route must call `requireAuth()` first.
- EVERY Prisma query that returns clinic-scoped data must use `clinicScope(session)`.
- A doctor must NEVER see data from another clinic.

**Data Model:**
- The animal is always the patient. Never call it "patient" in code — use `animal` / `Animal`.
- The owner is always the companion. Use `owner` / `Owner`.
- Payment is always per appointment — one session = one payment record.

**Error Handling:**
- Every API error response must have `{ ar: "...", en: "..." }` shape.
- Frontend NEVER shows raw error messages — always use the localized message from the response.
- Network errors show: AR "تعذر الاتصال، حاول مرة أخرى" / EN "Connection failed, please try again"

**PWA:**
- `skipWaiting: false` in next-pwa config — NEVER change this.
- Session form must autosave to localStorage every 10 seconds.
- Offline saves must queue and sync on reconnection.

**Payments:**
- `PUT /api/appointments/[id]/payment` receives the amount paid NOW and ADDS it to existing paidAmount.
- Status is always recalculated: `paidAmount >= totalAmount → PAID`, `0 < paidAmount < totalAmount → PARTIAL`, `paidAmount === 0 → UNPAID`.

**Notifications:**
- Cron route is only callable with correct `CRON_SECRET` header.
- Always update `reminderSent24h` / `reminderSent1h` immediately after sending — never send twice.

### Build Order Within Each Phase
Always in this order:
1. Prisma schema / migration
2. Zod validation schemas
3. API route handlers
4. Custom hooks (data fetching)
5. Components
6. Pages

This ensures types flow top-down and nothing imports from a file that doesn't exist yet.

### Testing Each Screen
Before marking any screen done:
- [ ] Works in Arabic (RTL) — layout doesn't break
- [ ] Works in English (LTR) — layout doesn't break
- [ ] Works on mobile (375px width)
- [ ] Works on desktop (1440px width)
- [ ] Shows correct skeleton during loading
- [ ] Shows correct error message if API fails
- [ ] Doctor role cannot see admin-only data
