import { prisma } from '@/lib/db'
import { AppError } from '@/lib/api/errors'
import { createNovuSubscriber } from '@/lib/novu'
import bcrypt from 'bcryptjs'
import type { Session } from 'next-auth'
import type { ClinicCreateInput, DoctorCreateInput } from '@/lib/validations/admin.schema'

export const adminService = {
  async listClinics() {
    return prisma.clinic.findMany({
      orderBy: { createdAt: 'desc' },
    })
  },

  async createClinic(input: ClinicCreateInput) {
    return prisma.clinic.create({
      data: {
        name: input.name,
        nameAr: input.nameAr || null,
        address: input.address || null,
        phone: input.phone || null,
      },
    })
  },

  async listDoctors(session: Session) {
    return prisma.user.findMany({
      where: {
        role: { in: ['DOCTOR', 'CLINIC_ADMIN'] },
        clinicId: session.user.role !== 'SUPER_ADMIN' ? session.user.clinicId || undefined : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        phone: true,
        preferredLang: true,
        novuSubscriberId: true,
        clinicId: true,
        createdAt: true,
        updatedAt: true,
        clinic: { select: { name: true, nameAr: true } },
      },
      orderBy: { name: 'asc' },
    })
  },
  
  async listDoctorsBasic(session: Session) {
    return prisma.user.findMany({
      where: {
        role: 'DOCTOR',
        clinicId: session.user.role !== 'SUPER_ADMIN' ? session.user.clinicId : undefined,
      },
      select: {
        id: true,
        name: true,
        email: true,
      },
      orderBy: {
        name: 'asc',
      },
    })
  },

  async createDoctor(session: Session, input: DoctorCreateInput) {
    const targetClinicId = session.user.role === 'SUPER_ADMIN' ? input.clinicId : session.user.clinicId
    if (!targetClinicId) {
      throw new AppError('يجب اختيار عيادة', 'Clinic ID is required', 400, 'NO_CLINIC')
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: input.email },
    })
    if (existingUser) {
      throw new AppError('البريد الإلكتروني مستخدم بالفعل', 'Email already in use', 400, 'EMAIL_EXISTS')
    }

    const hashedPassword = await bcrypt.hash(input.password, 12)

    const newUser = await prisma.user.create({
      data: {
        name: input.name,
        email: input.email,
        password: hashedPassword,
        role: input.role,
        phone: input.phone || null,
        clinicId: targetClinicId,
        preferredLang: 'ar',
      },
    })

    try {
      await createNovuSubscriber({
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        preferredLang: newUser.preferredLang,
      })

      await prisma.user.update({
        where: { id: newUser.id },
        data: { novuSubscriberId: newUser.id },
      })
    } catch (novuErr) {
      console.error('Failed to register subscriber on Novu:', novuErr)
    }

    const { password, ...userResponse } = newUser
    return userResponse
  },
}
