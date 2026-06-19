// Prisma 7 config — connection URL moved from schema.prisma to here
// See: https://pris.ly/d/config-datasource
//
// Neon note: DATABASE_URL uses the pooler (for app), DIRECT_URL bypasses it (for migrate)

import 'dotenv/config'
import { defineConfig, env } from 'prisma/config'

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    // Strip channel_binding=require — Prisma's Rust engine doesn't support it;
    // the pooler URL works fine without it.
    url: (env('DATABASE_URL') || '').replace('&channel_binding=require', '').replace('channel_binding=require&', '').replace('channel_binding=require', ''),
  },
})

