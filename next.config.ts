import type { NextConfig } from 'next'
import createNextIntlPlugin from 'next-intl/plugin'

const withNextIntl = createNextIntlPlugin('./src/lib/i18n.ts')

const nextConfig: NextConfig = {
  // next-pwa is applied via withPWA wrapper in the CommonJS build step
  // PWA config is kept in next.config.cjs for production builds
  skipProxyUrlNormalize: true,
}

export default withNextIntl(nextConfig)

