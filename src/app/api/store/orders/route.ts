import { withAuth } from '@/lib/api/handler';
import { apiSuccess } from '@/lib/api/response';
import { StoreService } from '@/services/store.service';
import { createOrderSchema } from '@/lib/validations/store.schema';

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '24', 10);

  const result = await StoreService.listOrders(session, { page, limit });
  return apiSuccess(result);
});

export const POST = withAuth(async (req, { session }) => {
  const body = await req.json();
  const data = createOrderSchema.parse(body);

  const order = await StoreService.createOrder(session, session.user.id, data);

  return apiSuccess({ order });
});
