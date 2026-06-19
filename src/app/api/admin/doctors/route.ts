import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth } from '@/lib/auth'
import { doctorCreateSchema } from '@/lib/validations/admin.schema'
import { createNovuSubscriber } from '@/lib/novu'
import bcrypt from 'bcryptjs'

export async function GET() {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLINIC_ADMIN') {
    return NextResponse.json(
      { error: { ar: 'غير مصرح لك', en: 'Unauthorized' } },
      { status: 403 }
    )
  }

  try {
    const doctors = await prisma.user.findMany({
      where: {
        role: {
          in: ['DOCTOR', 'CLINIC_ADMIN'],
        },
        clinicId: session.user.role !== 'SUPER_ADMIN' ? (session.user.clinicId || undefined) : undefined,
      },
      include: {
        clinic: {
          select: {
            name: true,
            nameAr: true,
          },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })
    return NextResponse.json(doctors)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل جلب الأطباء', en: 'Failed to fetch doctors', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function POST(req: Request) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck

  if (session.user.role !== 'SUPER_ADMIN' && session.user.role !== 'CLINIC_ADMIN') {
    return NextResponse.json(
      { error: { ar: 'غير مصرح لك', en: 'Unauthorized' } },
      { status: 403 }
    )
  }

  try {
    const body = await req.json()
    const validated = doctorCreateSchema.parse(body)

    // Ensure clinicId is set correctly
    const targetClinicId = session.user.role === 'SUPER_ADMIN'
      ? validated.clinicId
      : (session.user.clinicId || undefined)

    if (!targetClinicId) {
      return NextResponse.json(
        { error: { ar: 'يجب اختيار عيادة', en: 'Clinic ID is required' } },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validated.email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: { ar: 'البريد الإلكتروني مستخدم بالفعل', en: 'Email already in use' } },
        { status: 400 }
      )
    }

    const hashedPassword = await bcrypt.hash(validated.password, 12)

    const newUser = await prisma.user.create({
      data: {
        name: validated.name,
        email: validated.email,
        password: hashedPassword,
        role: validated.role,
        phone: validated.phone || null,
        clinicId: targetClinicId,
        preferredLang: 'ar',
      },
    })

    // Register on Novu
    try {
      await createNovuSubscriber({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        preferredLang: newUser.preferredLang,
      })

      // Update subscriber ID field
      await prisma.user.update({
        where: { id: newUser.id },
        data: { novuSubscriberId: newUser.id },
      })
    } catch (novuErr) {
      console.error('Failed to register subscriber on Novu:', novuErr)
    }

    // Don't send back password hash
    const { password, ...userResponse } = newUser
    return NextResponse.json(userResponse)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل إنشاء الطبيب/المستخدم', en: 'Failed to create user', detail: error.message } },
      { status: 500 }
    )
  }
}
