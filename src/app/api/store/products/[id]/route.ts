import { withAuth } from '@/lib/api/handler';
import { apiSuccess } from '@/lib/api/response';
import { StoreService } from '@/services/store.service';
import { createProductSchema } from '@/lib/validations/store.schema';
import { v2 as cloudinary } from 'cloudinary';
import { NotFoundError } from '@/lib/api/errors';

import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

cloudinary.config({
  cloud_name: env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: env.CLOUDINARY_API_SECRET,
});

export const GET = withAuth(async (req, { params, session }) => {
  const { id } = params;
  const product = await StoreService.getProduct(session, id);

  if (!product) {
    throw new NotFoundError({ en: 'Product', ar: 'المنتج' });
  }

  return apiSuccess({ product });
});

export const PUT = withAuth(
  async (req, { params, session }) => {
    const { id } = params;
    const body = await req.json();
    const data = createProductSchema.parse(body);

    const product = await StoreService.updateProduct(session, id, data);

    return apiSuccess({ product });
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] }
);

export const DELETE = withAuth(
  async (req, { params, session }) => {
    const { id } = params;

    const product = await StoreService.getProduct(session, id);
    if (product?.imageUrl) {
      const matches = product.imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/i);
      if (matches && matches[1]) {
        const publicId = matches[1];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          logger.error('[CLOUDINARY_DELETE_ERROR]', err);
        }
      }
    }

    await StoreService.deleteProduct(session, id);

    return apiSuccess({ success: true });
  },
  { roles: ['CLINIC_ADMIN', 'SUPER_ADMIN'] }
);
