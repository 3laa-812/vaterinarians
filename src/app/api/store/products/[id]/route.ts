import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { StoreService } from '@/services/store.service';
import { createProductSchema } from '@/lib/validations/store.schema';
import { v2 as cloudinary } from 'cloudinary';

cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const GET = withAuth(async (req, { params, session }) => {
  try {
    if (!session || !session.user || !session.user.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const product = await StoreService.getProduct(session.user.clinicId, id);

    if (!product) {
      return NextResponse.json(
        { error: { en: 'Product not found', ar: 'المنتج غير موجود', code: 'NOT_FOUND' } },
        { status: 404 }
      );
    }

    return NextResponse.json({
      data: { product }
    });
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return NextResponse.json(
      {
        error: {
          en: 'Failed to fetch product',
          ar: 'فشل في جلب المنتج',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});

export const PUT = withAuth(async (req, { params, session }) => {
  try {
    if (!session || !session.user || !session.user.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const body = await req.json();
    const result = createProductSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json(
        {
          error: {
            en: 'Invalid product data',
            ar: 'بيانات المنتج غير صالحة',
            code: 'VALIDATION_ERROR',
            details: result.error.flatten()
          }
        },
        { status: 400 }
      );
    }

    const product = await StoreService.updateProduct(session.user.clinicId, id, result.data);

    return NextResponse.json({
      data: { product }
    });
  } catch (error) {
    console.error('[PRODUCT_PUT]', error);
    return NextResponse.json(
      {
        error: {
          en: 'Failed to update product',
          ar: 'فشل في تحديث المنتج',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});

export const DELETE = withAuth(async (req, { params, session }) => {
  try {
    if (!session || !session.user || !session.user.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    
    // Fetch product to get the imageUrl
    const product = await StoreService.getProduct(session.user.clinicId, id);
    if (product?.imageUrl) {
      // Extract public_id from URL: e.g. https://res.cloudinary.com/.../upload/v1234567/public_id.jpg
      const matches = product.imageUrl.match(/\/v\d+\/(.+)\.[a-z]+$/i);
      if (matches && matches[1]) {
        const publicId = matches[1];
        try {
          await cloudinary.uploader.destroy(publicId);
        } catch (err) {
          console.error('[CLOUDINARY_DELETE_ERROR]', err);
          // Non-blocking error, we still want to delete the product
        }
      }
    }

    await StoreService.deleteProduct(session.user.clinicId, id);

    return NextResponse.json({
      data: { success: true }
    });
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return NextResponse.json(
      {
        error: {
          en: 'Failed to delete product',
          ar: 'فشل في حذف المنتج',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});
