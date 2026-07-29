import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { StoreService } from '@/services/store.service';
import { updateOrderStatusSchema } from '@/lib/validations/store.schema';

export const PUT = withAuth(async (req, { params, session }) => {
  try {
    const orderId = params.id;
    if (!orderId) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    const body = await req.json();
    const result = updateOrderStatusSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            en: 'Invalid status data',
            ar: 'بيانات الحالة غير صالحة',
            code: 'VALIDATION_ERROR',
            details: result.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const order = await StoreService.updateOrderStatus(
      session.user.clinicId!, 
      orderId, 
      result.data.status, 
      session.user.id
    );

    return NextResponse.json({
      data: { order }
    });
  } catch (error: any) {
    console.error('[ORDERS_STATUS_PUT]', error);
    return NextResponse.json(
      {
        error: {
          en: error.message || 'Failed to update order status',
          ar: 'فشل في تحديث حالة الطلب',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});
