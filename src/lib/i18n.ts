// next-intl server config — reads locale messages from messages/{locale}.json

import { getRequestConfig } from 'next-intl/server'
import { locales } from './i18n-navigation'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    locale = 'ar'
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
