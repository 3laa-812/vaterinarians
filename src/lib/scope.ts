import type { Session } from 'next-auth'

// Appends clinicId filter to any Prisma where clause.
// Super Admin sees all clinics. Everyone else sees only their own.
export function clinicScope(session: Session) {
  if (session.user.role === 'SUPER_ADMIN') return {}
  return { clinicId: session.user.clinicId as string }
}

export function appointmentClinicFilter(session: Session) {
  const scope = clinicScope(session)
  if (!('clinicId' in scope)) return {}
  return { animal: scope }
}
