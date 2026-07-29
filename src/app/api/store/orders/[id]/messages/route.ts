import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { prisma } from '@/lib/db';
import { orderMessageSchema } from '@/lib/validations/store.schema';

export const POST = withAuth(async (req, { params, session }) => {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const result = orderMessageSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            en: 'Invalid message data',
            ar: 'بيانات الرسالة غير صالحة',
            code: 'VALIDATION_ERROR',
            details: result.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    // Verify order belongs to clinic
    const order = await prisma.order.findUnique({
      where: { id: orderId, clinicId: session.user.clinicId! }
    });

    if (!order) {
      return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    const message = await prisma.orderMessage.create({
      data: {
        content: result.data.content,
        fromOwner: result.data.fromOwner,
        orderId: order.id
      }
    });

    return NextResponse.json({
      data: { message }
    });
  } catch (error: any) {
    console.error('[ORDERS_MESSAGES_POST]', error);
    return NextResponse.json(
      {
        error: {
          en: error.message || 'Failed to add message',
          ar: 'فشل في إضافة الرسالة',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});
