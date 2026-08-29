import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { prisma } from '@/lib/db';

import { apiSuccess } from '@/lib/api/response';
import { AppError, NotFoundError } from '@/lib/api/errors';
import { clinicScope } from '@/lib/scope';

export const GET = withAuth(async (req, { params, session }) => {
  const orderId = params.id;
  if (!orderId) {
    throw new AppError('معرف الطلب مطلوب', 'Order ID is required', 400, 'BAD_REQUEST');
  }

  const order = await prisma.order.findUnique({
    where: { id: orderId, ...clinicScope(session) },
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
    throw new NotFoundError({ ar: 'الطلب', en: 'Order' });
  }

  return apiSuccess({ order });
});
