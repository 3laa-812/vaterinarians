import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { StoreService } from '@/services/store.service';
import { createProductSchema } from '@/lib/validations/store.schema';

export const GET = withAuth(async (req, { session }) => {
  try {
    if (!session || !session.user || !session.user.clinicId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const products = await StoreService.listProducts(session.user.clinicId!);
    return NextResponse.json({
      data: { products }
    });
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return NextResponse.json(
      {
        error: {
          en: 'Failed to fetch products',
          ar: 'فشل في جلب المنتجات',
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

    const product = await StoreService.createProduct(session.user.clinicId!, result.data);

    return NextResponse.json({
      data: { product }
    });
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return NextResponse.json(
      {
        error: {
          en: 'Failed to create product',
          ar: 'فشل في إنشاء المنتج',
          code: 'INTERNAL_ERROR'
        }
      },
      { status: 500 }
    );
  }
});
