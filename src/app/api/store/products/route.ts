import { withAuth } from '@/lib/api/handler';
import { apiSuccess } from '@/lib/api/response';
import { StoreService } from '@/services/store.service';
import { createProductSchema } from '@/lib/validations/store.schema';

export const GET = withAuth(async (req, { session }) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '24', 10);
  const isActive = searchParams.has('isActive') ? searchParams.get('isActive') === 'true' : undefined;

  const result = await StoreService.listProducts(session, { page, limit, isActive });
  return apiSuccess(result);
});

export const POST = withAuth(
  async (req, { session }) => {
    const body = await req.json();
    const data = createProductSchema.parse(body);
    const product = await StoreService.createProduct(session, data);
    return apiSuccess({ product });
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] }
);
