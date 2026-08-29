import { withAuth } from '@/lib/api/handler';
import { apiSuccess } from '@/lib/api/response';
import { StoreService } from '@/services/store.service';
import { updateOrderStatusSchema } from '@/lib/validations/store.schema';
import { AppError } from '@/lib/api/errors';

export const PUT = withAuth(
  async (req, { params, session }) => {
    const orderId = params.id;
    if (!orderId) {
      throw new AppError('معرف الطلب مطلوب', 'Order ID is required', 400, 'BAD_REQUEST');
    }

    const body = await req.json();
    const data = updateOrderStatusSchema.parse(body);

    const order = await StoreService.updateOrderStatus(
      session,
      orderId,
      data.status
    );

    return apiSuccess({ order });
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] }
);
