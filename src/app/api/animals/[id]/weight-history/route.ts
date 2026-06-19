import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { requireAuth, clinicScope } from '@/lib/auth'

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const scope = clinicScope(session)

    // Verify animal exists and belongs to clinic
    const animalExists = await prisma.animal.findFirst({
      where: {
        id,
        ...scope,
      },
    })

    if (!animalExists) {
      return NextResponse.json(
        { error: { ar: 'لم يتم العثور على الحيوان', en: 'Animal not found' } },
        { status: 404 }
      )
    }

    const records = await prisma.weightRecord.findMany({
      where: {
        animalId: id,
      },
      orderBy: {
        recordedAt: 'asc',
      },
    })

    return NextResponse.json(records)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'خطأ في جلب سجلات الوزن', en: 'Failed to fetch weight history', detail: error.message } },
      { status: 500 }
    )
  }
}

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const authCheck = await requireAuth()
  if (authCheck.error) {
    return NextResponse.json({ error: authCheck.error }, { status: authCheck.status })
  }
  const { session } = authCheck
  const { id } = await params

  try {
    const scope = clinicScope(session)

    // Verify animal exists and belongs to clinic
    const animalExists = await prisma.animal.findFirst({
      where: {
        id,
        ...scope,
      },
    })

    if (!animalExists) {
      return NextResponse.json(
        { error: { ar: 'لم يتم العثور على الحيوان', en: 'Animal not found' } },
        { status: 404 }
      )
    }

    const body = await req.json()
    if (typeof body.weight !== 'number' || body.weight <= 0) {
      return NextResponse.json(
        { error: { ar: 'وزن غير صالح', en: 'Invalid weight value' } },
        { status: 400 }
      )
    }

    const record = await prisma.weightRecord.create({
      data: {
        weight: body.weight,
        recordedAt: body.recordedAt ? new Date(body.recordedAt) : new Date(),
        animalId: id,
      },
    })

    return NextResponse.json(record)
  } catch (error: any) {
    return NextResponse.json(
      { error: { ar: 'فشل في إضافة سجل الوزن', en: 'Failed to add weight record', detail: error.message } },
      { status: 400 }
    )
  }
}
