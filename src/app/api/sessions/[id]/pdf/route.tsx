import { NextResponse } from 'next/server'
import { renderToStream } from '@react-pdf/renderer'
import { SessionPDF } from '@/components/pdf/SessionPDF'
import { prisma } from '@/lib/db'
import { withAuth } from '@/lib/api/handler'
import { appointmentClinicFilter } from '@/lib/scope'

export const GET = withAuth(async (req, { session, params }) => {
  const url = new URL(req.url)
  const locale = url.searchParams.get('locale') || 'en'

  const appointment = await prisma.appointment.findFirst({
    where: {
      id: params.id,
      ...appointmentClinicFilter(session),
    },
    include: {
      animal: {
        include: { owner: true, clinic: true }
      },
      session: {
        include: { medications: true }
      }
    }
  })

  if (!appointment || !appointment.session) {
    return new NextResponse('Session not found', { status: 404 })
  }

  const stream = await renderToStream(
    <SessionPDF 
      sessionData={appointment.session}
      animal={appointment.animal}
      owner={appointment.animal.owner}
      clinic={appointment.animal.clinic}
      locale={locale}
    />
  )

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `inline; filename="session-${appointment.session.id}.pdf"`,
    }
  })
})
