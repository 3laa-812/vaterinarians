# Vet Clinic System — Product Overview

## What We're Building

A **multi-clinic veterinary management PWA** used by veterinarians (and clinic admins) to manage animal patients, their owners, appointments, sessions, and payments. The system runs as a web app installable on mobile via PWA — no separate native app.

## Core Users

| Role | What They Do |
|---|---|
| **Super Admin** | Manages all clinics, creates clinic admins |
| **Clinic Admin** | Manages one clinic — adds doctors, manages animals |
| **Doctor (Vet)** | Daily use — records sessions, views schedule, tracks animals |

## The Patient Model

> ⚠️ The **animal** is always the patient. The **owner** is the companion (مرافق / Guardian).

Every record links: `Animal → Owner → Clinic → Doctor`

## Key Principles

1. **Zero cognitive load for the doctor** — non-technical user, daily driver
2. **Speed** — opening a session and saving notes must be fast and frictionless
3. **Reliability** — works offline, never loses data mid-session
4. **Multilingual** — Arabic / English toggle available at any time, RTL/LTR switches accordingly
5. **No complexity leaking to the doctor** — errors in Arabic, no technical messages

## Languages

- Arabic (RTL) — primary
- English (LTR) — secondary
- Toggle button always visible in the top bar — preference saved per user in their profile
- All UI strings go through an `i18n` dictionary — no hardcoded text anywhere

---

## Feature Scope

### ✅ In Scope

- Multi-clinic management
- Doctor / Clinic Admin / Super Admin roles
- Animal profiles (species, breed, age, gender, medical history)
- Owner (guardian) profiles linked to animals
- Appointment scheduling with status tracking
- Session notes (exam notes, treatment plan)
- Weight tracking with history chart
- Payment per session — fixed fee, paid/unpaid/partial tracking
- Notification reminders (24h + 1h before appointment) via Novu
- PWA — installable, offline-capable, push notifications
- Multilingual AR/EN with RTL/LTR layout switching

### ❌ Out of Scope (for now)

- Patient (owner) portal — doctors only
- Online payments / payment gateway
- Inventory / pharmacy management
- Lab results
- Mobile native app (iOS/Android)
