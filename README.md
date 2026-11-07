# VetCare — Veterinary Clinic Management Platform

**Arabic-first, multi-clinic veterinary SaaS** that runs the full clinic day — from patient intake and exam sessions to appointments, finance, vaccinations, and an in-clinic store — plus a guardian (pet-owner) portal with QR login.

Built as a production-minded **PWA** for clinics in Arabic-speaking markets (EGP, RTL-first), with a bilingual AR/EN experience and a dual UI: a dark clinical dashboard for staff, and a lighter guardian-facing portal for pet owners.

---

## Why this project

VetCare is not a CRUD demo. It is an end-to-end product surface that combines:

- **Clinical workflows** vets actually use (fast sessions, medical history, vaccines, invoices)
- **Business operations** (revenue, expenses, salaries, store inventory)
- **Owner engagement** (guardian portal, QR access, appointments, orders, messaging)
- **Real product constraints** (multi-tenancy, role-based access, i18n/RTL, PWA, print/PDF)

If you are reviewing this repo for a role, treat it as a portfolio of full-stack product engineering: domain modeling, auth, multi-tenant data isolation, bilingual UX, and operational features (cron reminders, media uploads, reporting).

---

## Product overview

| Audience | What they get |
|---|---|
| **Doctors & clinic admins** | Dark dashboard for animals, owners, appointments, clinical sessions, invoices, finance, vaccines, store, and admin |
| **Super admins** | Multi-clinic management and doctor accounts |
| **Guardians (pet owners)** | Portal to view pets, book visits, shop the clinic store, track orders, and receive notifications |

---

## Features

### Clinical care
- **Animals registry** — species, breed, weight history, medical notes, soft archive
- **Clinical sessions** — chief complaint, diagnosis, treatment plan, medications, next visit, PDF export
- **Fast intake** — register + start session flows designed for busy clinic hours
- **Vaccinations** — clinic vaccine catalog, pet records, printable certificates
- **Appointments** — schedule with statuses (`SCHEDULED`, `COMPLETED`, `ABSENT`, `POSTPONED`), fees, and payment tracking
- **Reminders** — cron-based appointment reminders (24h / 1h)

### Clinic operations
- **Owners / guardians CRM** — linked pets, portal access via QR
- **Invoices & payments** — unpaid / partial / paid lifecycle with print support
- **Finance** — revenue & expenses, categories, recurring expenses, salaries, advances, budgets & goals
- **Reports** — financial overview for clinic leadership
- **In-clinic store** — products (medicine / food / accessories), stock & min-stock alerts, order lifecycle + chat

### Guardian portal
- **QR / token login** for pet owners
- Pets, vaccinations, appointments, clinic & doctors info
- Store browsing, cart, and order tracking
- Notifications and account management

### Platform quality
- **Multi-clinic tenancy** with `clinicScope` on clinic-owned data
- **Role-based access**: `SUPER_ADMIN`, `CLINIC_ADMIN`, `DOCTOR`, `GUARDIAN`
- **Arabic-first i18n** (`ar` default + `en`) with proper RTL/LTR
- **Installable PWA** with offline-aware UX
- **Cloudinary** media uploads
- **Security headers** (CSP and related hardening in Next config)

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | **Next.js 16** (App Router) · **React 19** · **TypeScript** |
| UI | **Tailwind CSS v4** · design tokens · **Mantine** · **Lucide** · **Motion** |
| Data | **PostgreSQL** · **Prisma 7** |
| Auth | **NextAuth v5** (credentials + guardian QR) · **bcrypt** · **jose** |
| Client state | **TanStack Query** · **Zustand** |
| Validation | **Zod** |
| i18n | **next-intl** |
| Media / notify | **Cloudinary** · **Novu** |
| Docs / print | **Recharts** · **react-to-print** · **@react-pdf/renderer** |
| PWA / QR | **next-pwa** · **qrcode.react** · **@zxing/browser** |

---

## Architecture highlights

```
src/app/[locale]/
  (auth)/          # staff login
  (dashboard)/     # clinic staff app
  (guardian)/      # pet-owner portal
```

- **Locale-aware routing** with middleware combining NextAuth + next-intl
- **API conventions**: success `{ data: … }`, errors `{ error: { ar, en, code } }`
- **Auth-first handlers** via `withAuth` and role checks
- **Service layer** under `src/services/*` with Zod schemas and domain types
- **Flat React Query hooks** (no nested query-inside-returned-fn pattern)
- **Always-dark staff UI** via semantic tokens (no `dark:` class sprawl); separate guardian token set
- **Clinic scoping** on Prisma queries for non–super-admin users

---
