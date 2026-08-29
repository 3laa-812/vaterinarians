// Prisma client singleton — Prisma 7 requires an explicit driver adapter
// Uses @prisma/adapter-pg with the existing pg pool

import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { env } from './env'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient
}

function createPrismaClient() {
  const adapter = new PrismaPg({
    connectionString: env.DATABASE_URL,
  })
  return new PrismaClient({ adapter, log: ['error'] })
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
