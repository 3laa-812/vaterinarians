// Novu client — sends appointment reminder notifications to doctors
// Uses @novu/api (the current SDK, replacing deprecated @novu/node)

import { Novu } from '@novu/api'

export const novu = new Novu({ secretKey: process.env.NOVU_SECRET_KEY! })

// ── triggerAppointmentReminder ────────────────────────────────────────────────
// Sends a push notification (with WhatsApp fallback) to a doctor subscriber.

export async function triggerAppointmentReminder(payload: {
  subscriberId: string
  patientName: string
  ownerName: string
  appointmentTime: string
  hoursUntil: 24 | 1
  clinicName?: string
}) {
  return novu.trigger({
    workflowId: 'appointment-reminder',
    to: { subscriberId: payload.subscriberId },
    payload: {
      patientName: payload.patientName,
      ownerName: payload.ownerName,
      appointmentTime: payload.appointmentTime,
      hoursUntil: payload.hoursUntil,
      clinicName: payload.clinicName ?? '',
    },
  })
}

// ── createNovuSubscriber ───────────────────────────────────────────────────────
// Called when a new doctor is created. Creates their Novu subscriber profile.

export async function createNovuSubscriber(user: {
  id: string
  name: string
  email: string
  phone?: string | null
  preferredLang: string
}) {
  return novu.subscribers.create({
    subscriberId: user.id,
    firstName: user.name,
    email: user.email,
    phone: user.phone ?? undefined,
    locale: user.preferredLang,
  })
}
