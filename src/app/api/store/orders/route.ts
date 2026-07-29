import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { StoreService } from '@/services/store.service';
import { createOrderSchema } from '@/lib/validations/store.schema';

export const GET = withAuth(async (req, { session }) => {
  try {
    const orders = await StoreService.listOrders(session.user.clinicId!);
    return NextResponse.json({
      data: { orders }
    });
  } catch (error) {
    console.error('[ORDERS_GET]', error);
    return NextResponse.json(
      {
        error: {
          en: 'Failed to fetch orders',
          ar: 'فشل في جلب الطلبات',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});

export const POST = withAuth(async (req, { session }) => {
  try {
    const body = await req.json();
    const result = createOrderSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            en: 'Invalid order data',
            ar: 'بيانات الطلب غير صالحة',
            code: 'VALIDATION_ERROR',
            details: result.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const order = await StoreService.createOrder(session.user.clinicId!, session.user.id, result.data);

    return NextResponse.json({
      data: { order }
    });
  } catch (error: any) {
    console.error('[ORDERS_POST]', error);
    return NextResponse.json(
      {
        error: {
          en: error.message || 'Failed to create order',
          ar: 'فشل في إنشاء الطلب',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});
