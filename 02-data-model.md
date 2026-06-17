# Data Model — Prisma Schema

## Entity Relationships

```
Clinic
  ├── has many Users (Super Admin / Clinic Admin / Doctor)
  └── has many Animals

Owner (Guardian)
  └── has many Animals

Animal (Patient)
  ├── belongs to Clinic
  ├── belongs to Owner
  ├── has many Appointments
  └── has many WeightRecords

Appointment
  ├── belongs to Animal
  ├── belongs to Doctor (User)
  ├── has one Session (exam notes)
  └── has one Payment

Session
  └── belongs to Appointment (1:1)

Payment
  └── belongs to Appointment (1:1)
```

---

## Prisma Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// ─────────────────────────────────────────
// ENUMS
// ─────────────────────────────────────────

enum Role {
  SUPER_ADMIN
  CLINIC_ADMIN
  DOCTOR
}

enum AppointmentStatus {
  SCHEDULED   // مجدول
  COMPLETED   // اكتمل
  ABSENT      // غاب
  POSTPONED   // مؤجل
}

enum PaymentStatus {
  UNPAID      // لم يُدفع
  PARTIAL     // دفع جزء
  PAID        // مدفوع
}

enum AnimalGender {
  MALE
  FEMALE
}

// ─────────────────────────────────────────
// CLINIC
// ─────────────────────────────────────────

model Clinic {
  id        String   @id @default(cuid())
  name      String
  nameAr    String?  // Arabic name if different
  address   String?
  phone     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  users   User[]
  animals Animal[]
}

// ─────────────────────────────────────────
// USER (Doctors / Admins)
// ─────────────────────────────────────────

model User {
  id                String   @id @default(cuid())
  name              String
  email             String   @unique
  password          String   // bcrypt hashed
  role              Role     @default(DOCTOR)
  phone             String?
  preferredLang     String   @default("ar") // "ar" | "en"
  novuSubscriberId  String?  @unique        // for push notifications

  clinic   Clinic? @relation(fields: [clinicId], references: [id])
  clinicId String?

  appointments Appointment[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────
// OWNER (Guardian / مرافق)
// ─────────────────────────────────────────

model Owner {
  id        String   @id @default(cuid())
  name      String
  phone     String
  email     String?
  address   String?
  notes     String?

  animals Animal[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────
// ANIMAL (Patient / المريض)
// ─────────────────────────────────────────

model Animal {
  id             String       @id @default(cuid())
  name           String
  species        String       // e.g. "dog", "cat", "bird"
  breed          String?
  gender         AnimalGender?
  birthDate      DateTime?
  color          String?
  medicalHistory String?      // free text — existing conditions, allergies, notes
  notes          String?      // general vet notes

  owner    Owner  @relation(fields: [ownerId], references: [id])
  ownerId  String

  clinic   Clinic @relation(fields: [clinicId], references: [id])
  clinicId String

  appointments  Appointment[]
  weightRecords WeightRecord[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────
// APPOINTMENT
// ─────────────────────────────────────────

model Appointment {
  id          String            @id @default(cuid())
  scheduledAt DateTime
  status      AppointmentStatus @default(SCHEDULED)
  notes       String?           // pre-session notes by doctor

  animal   Animal @relation(fields: [animalId], references: [id])
  animalId String

  doctor   User   @relation(fields: [doctorId], references: [id])
  doctorId String

  session Session?
  payment Payment?

  // Notification tracking — prevent duplicate sends
  reminderSent24h Boolean @default(false)
  reminderSent1h  Boolean @default(false)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────
// SESSION (Exam / الكشف)
// ─────────────────────────────────────────

model Session {
  id            String   @id @default(cuid())
  weight        Float?   // weight at this session in kg
  clinicalNotes String?  // exam observations
  treatmentPlan String?  // exercises, diet, therapy plan
  nextVisitDate DateTime?

  appointment   Appointment @relation(fields: [appointmentId], references: [id])
  appointmentId String      @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────
// PAYMENT
// ─────────────────────────────────────────

model Payment {
  id          String        @id @default(cuid())
  totalAmount Float         // full session fee
  paidAmount  Float         @default(0)
  status      PaymentStatus @default(UNPAID)
  notes       String?       // e.g. "rest paid next visit"

  appointment   Appointment @relation(fields: [appointmentId], references: [id])
  appointmentId String      @unique

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

// ─────────────────────────────────────────
// WEIGHT RECORD (History Chart)
// ─────────────────────────────────────────

model WeightRecord {
  id         String   @id @default(cuid())
  weight     Float    // kg
  recordedAt DateTime @default(now())

  animal   Animal @relation(fields: [animalId], references: [id])
  animalId String
}
```

---

## Derived / Computed Values

These are **not stored** — computed at query time or on the frontend:

| Value | How |
|---|---|
| `weightDelta` | `currentWeight - previousWeight` |
| `amountRemaining` | `payment.totalAmount - payment.paidAmount` |
| `animalAge` | calculated from `birthDate` |
| `sessionCount` | `count(appointments where status = COMPLETED)` |
| `weightLost` | `firstWeight - latestWeight` from WeightRecord |

---

## Key Design Decisions

- **Owner is separate from Animal** — one owner can have multiple animals
- **Payment is 1:1 with Appointment** — fixed fee per session, not per package
- **Session is 1:1 with Appointment** — session notes are always tied to a visit
- **WeightRecord is separate** — allows weight tracking outside of sessions (e.g. weigh-in only visits)
- **`reminderSent24h` + `reminderSent1h`** — prevents cron from double-sending notifications
- **`preferredLang` on User** — language preference persists per doctor across devices
