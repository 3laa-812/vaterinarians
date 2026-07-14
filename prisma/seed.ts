// Prisma seed script — Prisma 7 requires @prisma/adapter-pg
import 'dotenv/config'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import bcrypt from 'bcryptjs'

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
})

const prisma = new PrismaClient({ adapter })

async function main() {
  // Super Admin
  await prisma.user.upsert({
    where: { email: 'admin@vetclinic.com' },
    update: {},
    create: {
      name: 'Super Admin',
      email: 'admin@vetclinic.com',
      password: await bcrypt.hash('Admin@1234', 12),
      role: 'SUPER_ADMIN',
      preferredLang: 'ar',
    },
  })

  // Demo Clinic
  const clinic = await prisma.clinic.upsert({
    where: { id: 'demo-clinic-1' },
    update: {},
    create: {
      id: 'demo-clinic-1',
      name: 'Vet Care Clinic',
      nameAr: 'عيادة فيت كير البيطرية',
      address: 'Cairo, Egypt',
      phone: '0100000000',
      defaultSessionFee: 300,
    },
  })

  // Demo Doctor 1
  await prisma.user.upsert({
    where: { email: 'doctor@vetclinic.com' },
    update: {},
    create: {
      name: 'د. سارة',
      email: 'doctor@vetclinic.com',
      password: await bcrypt.hash('Doctor@1234', 12),
      role: 'DOCTOR',
      clinicId: clinic.id,
      preferredLang: 'ar',
    },
  })

  // Demo Doctor 2
  await prisma.user.upsert({
    where: { email: 'doctor2@vetclinic.com' },
    update: {},
    create: {
      name: 'د. خالد',
      email: 'doctor2@vetclinic.com',
      password: await bcrypt.hash('Doctor@1234', 12),
      role: 'DOCTOR',
      clinicId: clinic.id,
      preferredLang: 'ar',
    },
  })

  // Demo Clinic Admin (Manager)
  await prisma.user.upsert({
    where: { email: 'manager@vetclinic.com' },
    update: {},
    create: {
      name: 'مدير العيادة',
      email: 'manager@vetclinic.com',
      password: await bcrypt.hash('Manager@1234', 12),
      role: 'CLINIC_ADMIN',
      clinicId: clinic.id,
      preferredLang: 'ar',
    },
  })

  console.log('✅ Seed complete (see README for demo account credentials)')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
