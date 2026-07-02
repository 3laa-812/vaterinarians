// next-intl server config — reads locale messages from messages/{locale}.json

import { getRequestConfig } from 'next-intl/server'
import { locales } from './i18n-navigation'
import { cookies } from 'next/headers'

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale

  if (!locale || !locales.includes(locale as (typeof locales)[number])) {
    const cookieStore = await cookies()
    const nextLocale = cookieStore.get('NEXT_LOCALE')?.value
    if (nextLocale && locales.includes(nextLocale as any)) {
      locale = nextLocale
    } else {
      locale = 'ar'
    }
  }

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  }
})
