import { NextResponse } from 'next/server';
import { withAuth } from '@/lib/api/handler';
import { prisma } from '@/lib/db';
import { orderMessageSchema } from '@/lib/validations/store.schema';

import { apiSuccess } from '@/lib/api/response';
import { AppError, NotFoundError } from '@/lib/api/errors';
import { clinicScope } from '@/lib/scope';

export const POST = withAuth(async (req, { params, session }) => {
  const orderId = params.id;
  if (!orderId) {
    throw new AppError('معرف الطلب مطلوب', 'Order ID is required', 400, 'BAD_REQUEST');
  }

  const body = await req.json();
  const result = orderMessageSchema.parse(body);

  // Verify order belongs to clinic
  const order = await prisma.order.findUnique({
    where: { id: orderId, ...clinicScope(session) }
  });

  if (!order) {
    throw new NotFoundError({ ar: 'الطلب', en: 'Order' });
  }

  const message = await prisma.orderMessage.create({
    data: {
      content: result.content,
      fromOwner: result.fromOwner,
      orderId: order.id
    }
  });

  return apiSuccess({ message });
});
