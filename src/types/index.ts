// Shared domain types — used across API routes, hooks, and components

import type {
  Animal,
  Owner,
  Appointment,
  Session,
  Payment,
  Clinic,
  User,
  AppointmentStatus,
  PaymentStatus,
  WeightRecord,
} from '@prisma/client'

// ── Animal ────────────────────────────────────────────────────────────────────

export type OwnerListItem = {
  id: string
  name: string
  phone: string
  email: string | null
  address: string | null
  notes: string | null
  animals: { id: string; name: string; species: string }[]
}

export type OwnerProfile = Owner & {
  animals: (Animal & {
    weightRecords: WeightRecord[]
    appointments: Appointment[]
  })[]
}

export type AnimalWithOwner = Animal & {
  owner: Pick<Owner, 'id' | 'name' | 'phone'>
}

export type AnimalListItem = {
  id: string
  name: string
  species: string
  breed: string | null
  gender: string | null
  owner: { id: string; name: string; phone: string }
  latestWeight: number | null
  lastVisit: string | null
  nextAppointment: string | null
}

export type AnimalProfile = Animal & {
  owner: Owner & {
    animals: { id: string; name: string; species: string }[]
  }
  latestWeight: number | null
  weightDelta: number | null
  totalWeightLost: number | null
  sessionCount: number
  nextAppointment: Appointment | null
  unpaidAmount: number
  weightRecords: WeightRecord[]
  appointments: (Appointment & {
    doctor: { id: string; name: string }
    session: Session | null
    payment: Payment | null
  })[]
}


// ── Appointment ───────────────────────────────────────────────────────────────

export type AppointmentWithDetails = Appointment & {
  animal: Pick<Animal, 'id' | 'name' | 'species'>
  doctor: Pick<User, 'id' | 'name'>
  payment: { status: PaymentStatus; remaining: number } | null
  hasSession: boolean
  owner?: Pick<Owner, 'name' | 'phone'>
}

// ── Session ───────────────────────────────────────────────────────────────────

export type SessionWithAppointment = Session & {
  appointment: Appointment & {
    doctor: Pick<User, 'name'>
  }
}

// ── Payment ───────────────────────────────────────────────────────────────────

export type PaymentDetails = Payment & {
  remaining: number // computed: totalAmount - paidAmount
}

// ── Weight ────────────────────────────────────────────────────────────────────

export type WeightChartPoint = {
  weight: number
  recordedAt: string // ISO date string
  sessionId: string | null
}

// ── Admin ─────────────────────────────────────────────────────────────────────

export type ClinicWithDoctors = Clinic & {
  users: Pick<User, 'id' | 'name' | 'email' | 'role'>[]
}

// Re-export Prisma enums for convenient use in components
export { AppointmentStatus, PaymentStatus }
