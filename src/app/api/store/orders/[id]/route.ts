import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { prisma } from '@/lib/db';

export const GET = withAuth(async (req, { params, session }) => {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: orderId, clinicId: session.user.clinicId! },
      include: {
        owner: true,
        items: {
          include: { product: true }
        },
        messages: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    return NextResponse.json({
      data: { order }
    });
  } catch (error: any) {
    console.error('[ORDERS_GET_ID]', error);
    return NextResponse.json(
      {
        error: {
          en: error.message || 'Failed to fetch order',
          ar: 'فشل في جلب الطلب',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});
