import { z } from 'zod';
import { logger } from '@/lib/logger';

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  // NextAuth accepts either NEXTAUTH_SECRET or AUTH_SECRET
  AUTH_SECRET: z.string().min(1, 'AUTH_SECRET is required').or(z.string().min(1, 'NEXTAUTH_SECRET is required')),
  NEXTAUTH_URL: z.string().url('NEXTAUTH_URL must be a valid URL').optional(), // Sometimes optional in Vercel, but good to have
  
  // Cloudinary
  NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME is required'),
  NEXT_PUBLIC_CLOUDINARY_API_KEY: z.string().min(1, 'NEXT_PUBLIC_CLOUDINARY_API_KEY is required'),
  CLOUDINARY_API_SECRET: z.string().min(1, 'CLOUDINARY_API_SECRET is required'),
  
  // Optional/Other
  NOVU_API_KEY: z.string().optional(),
  CRON_SECRET: z.string().optional(),
});

// Since NextAuth might use NEXTAUTH_SECRET instead of AUTH_SECRET, let's map it if needed
const processEnv = {
  ...process.env,
  AUTH_SECRET: process.env.AUTH_SECRET || process.env.NEXTAUTH_SECRET,
};

const _env = envSchema.safeParse(processEnv);

if (!_env.success) {
  logger.error('❌ Invalid environment variables:', _env.error.format());
  throw new Error('Invalid environment variables');
}

export const env = _env.data;
