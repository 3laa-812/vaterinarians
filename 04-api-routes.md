# API Routes Specification

## Conventions

- All routes prefixed with `/api/`
- Auth checked via NextAuth session on every protected route
- Responses always `{ data, error }` shape
- Errors always in both languages: `{ ar: "...", en: "..." }`
- Clinic scoping enforced at query level — doctor never sees other clinic's data
- Pagination: `?page=1&limit=20` on all list endpoints

---

## Auth

### `POST /api/auth/[...nextauth]`
Handled by NextAuth. Login with email + password → returns JWT session.

**Session payload:**
```ts
{
  user: {
    id: string
    name: string
    email: string
    role: "SUPER_ADMIN" | "CLINIC_ADMIN" | "DOCTOR"
    clinicId: string | null
    preferredLang: "ar" | "en"
  }
}
```

### `PATCH /api/auth/language`
Updates `user.preferredLang` in DB.
```ts
// Body
{ lang: "ar" | "en" }
```

---

## Animals

### `GET /api/animals`
Returns animals scoped to the doctor's clinic.

**Query params:**
- `?search=` — name or owner name
- `?species=` — filter by species
- `?doctorId=` — filter by assigned doctor (admin only)
- `?page=` `?limit=`

**Response:**
```ts
{
  data: {
    animals: Array<{
      id: string
      name: string
      species: string
      breed: string | null
      gender: string | null
      owner: { id: string; name: string; phone: string }
      latestWeight: number | null
      lastVisit: string | null
      nextAppointment: string | null
    }>
    total: number
    page: number
  }
}
```

### `POST /api/animals`
Creates animal + owner in one request (common flow: new patient = new animal + new owner).

```ts
// Body
{
  // Animal
  name: string
  species: string
  breed?: string
  gender?: "MALE" | "FEMALE"
  birthDate?: string        // ISO date
  color?: string
  medicalHistory?: string

  // Owner — either existing ownerId OR new owner data
  ownerId?: string          // if owner already exists
  owner?: {                 // if creating new owner
    name: string
    phone: string
    email?: string
    address?: string
  }
}
```

### `GET /api/animals/[id]`
Full animal profile.

**Response:**
```ts
{
  data: {
    animal: Animal & {
      owner: Owner
      latestWeight: number | null
      weightDelta: number | null        // vs previous session
      totalWeightLost: number | null    // first - latest
      sessionCount: number
      nextAppointment: Appointment | null
      unpaidAmount: number              // sum of remaining payments
    }
  }
}
```

### `PUT /api/animals/[id]`
Update animal info.

### `DELETE /api/animals/[id]`
Soft delete (set `deletedAt`). Admin only.

### `GET /api/animals/[id]/weight-history`
Returns weight records for chart.

```ts
{
  data: Array<{
    weight: number
    recordedAt: string    // ISO date
    sessionId: string | null
  }>
}
```

---

## Owners

### `GET /api/owners`
```
?search= name or phone
?page= ?limit=
```

### `POST /api/owners`
```ts
{
  name: string
  phone: string
  email?: string
  address?: string
  notes?: string
}
```

### `GET /api/owners/[id]`
Returns owner + all their animals.

### `PUT /api/owners/[id]`
Update owner info.

---

## Appointments

### `GET /api/appointments`
```
?date=2024-06-18           → all appointments on that day
?doctorId=                 → filter by doctor (admin only)
?animalId=                 → all appointments for one animal
?status=SCHEDULED
?upcoming=true             → future appointments only
?page= ?limit=
```

**Response:**
```ts
{
  data: {
    appointments: Array<{
      id: string
      scheduledAt: string
      status: AppointmentStatus
      animal: { id: string; name: string; species: string }
      owner: { name: string; phone: string }
      doctor: { id: string; name: string }
      payment: { status: PaymentStatus; remaining: number } | null
      hasSession: boolean
    }>
  }
}
```

### `POST /api/appointments`
```ts
{
  animalId: string
  doctorId: string
  scheduledAt: string     // ISO datetime
  notes?: string
  fee: number             // creates Payment record with this totalAmount
}
```

### `GET /api/appointments/[id]`
Full appointment with session + payment.

### `PUT /api/appointments/[id]`
Update status, reschedule, change notes.

```ts
{
  status?: AppointmentStatus
  scheduledAt?: string
  notes?: string
}
```

### `DELETE /api/appointments/[id]`
Cancel appointment. Soft delete.

---

## Sessions (Exam Notes)

### `GET /api/animals/[id]/sessions`
All sessions for an animal (timeline).

```ts
{
  data: Array<{
    id: string
    weight: number | null
    clinicalNotes: string | null
    treatmentPlan: string | null
    nextVisitDate: string | null
    createdAt: string
    appointment: {
      id: string
      scheduledAt: string
      doctor: { name: string }
    }
  }>
}
```

### `POST /api/appointments/[id]/session`
Creates session for an appointment. Also creates WeightRecord if weight is provided. Marks appointment as COMPLETED.

```ts
// Body
{
  weight?: number
  clinicalNotes?: string
  treatmentPlan?: string
  nextVisitDate?: string    // ISO date — auto-creates next Appointment
}
```

**Side effects:**
1. Creates `Session` record
2. If `weight` provided → creates `WeightRecord`
3. Sets `appointment.status = COMPLETED`
4. If `nextVisitDate` provided → creates new `Appointment` (status: SCHEDULED)

### `PUT /api/appointments/[id]/session`
Edit existing session notes.

---

## Payments

### `GET /api/appointments/[id]/payment`
```ts
{
  data: {
    id: string
    totalAmount: number
    paidAmount: number
    remaining: number       // computed: total - paid
    status: PaymentStatus
    notes: string | null
    createdAt: string
  }
}
```

### `POST /api/appointments/[id]/payment`
Create payment record (called when booking appointment).
```ts
{ totalAmount: number }
```

### `PUT /api/appointments/[id]/payment`
Record a payment (partial or full).
```ts
{
  paidAmount: number     // the amount paid NOW (added to existing paidAmount)
  notes?: string
}
```
**Logic:** `newPaidAmount = current.paidAmount + body.paidAmount` → recalculate `status`.

---

## Admin — Clinics

### `GET /api/clinics`
Super Admin only — all clinics.

### `POST /api/clinics`
```ts
{ name: string; nameAr?: string; address?: string; phone?: string }
```

### `GET /api/clinics/[id]`
Clinic details + doctor list.

### `PUT /api/clinics/[id]`

### `DELETE /api/clinics/[id]`
Super Admin only.

---

## Admin — Doctors

### `GET /api/doctors`
```
?clinicId=    → filter by clinic
```

### `POST /api/doctors`
Creates a User with role DOCTOR.
```ts
{
  name: string
  email: string
  password: string
  phone?: string
  clinicId: string
}
```

### `PUT /api/doctors/[id]`
Update name, phone, clinicId, role.

### `DELETE /api/doctors/[id]`
Deactivate account. Clinic Admin can only deactivate doctors in their own clinic.

---

## Cron — Notifications

### `GET /api/cron/send-reminders`
Called by Vercel Cron every hour. Protected by `CRON_SECRET` header.

**Logic:**
1. Find all `SCHEDULED` appointments where `scheduledAt` is between now and now+25h and `reminderSent24h = false` → send 24h reminder via Novu → mark `reminderSent24h = true`
2. Find all `SCHEDULED` appointments where `scheduledAt` is between now and now+65min and `reminderSent1h = false` → send 1h reminder → mark `reminderSent1h = true`

```ts
// Response
{
  data: {
    sent24h: number
    sent1h: number
    timestamp: string
  }
}
```

---

## Error Response Shape

All errors return:
```ts
{
  error: {
    ar: string    // "تعذر الحفظ، حاول مرة أخرى"
    en: string    // "Failed to save, please try again"
    code: string  // "SAVE_FAILED" — for programmatic handling
  }
}
```

**HTTP status codes used:**
- `200` OK
- `201` Created
- `400` Validation error
- `401` Not authenticated
- `403` Not authorized (wrong role / wrong clinic)
- `404` Not found
- `500` Server error
