import { auth } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function PATCH(req: Request) {
  const session = await auth()
  if (!session) {
    return Response.json(
      { error: { ar: 'يجب تسجيل الدخول', en: 'Not authenticated' } },
      { status: 401 }
    )
  }

  const body = await req.json()
  const lang = body.lang

  if (lang !== 'ar' && lang !== 'en') {
    return Response.json(
      { error: { ar: 'لغة غير صالحة', en: 'Invalid language' } },
      { status: 400 }
    )
  }

  await prisma.user.update({
    where: { id: session.user.id },
    data: { preferredLang: lang },
  })

  return Response.json({ data: { lang } })
}
