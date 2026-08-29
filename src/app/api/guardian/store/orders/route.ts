import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";
import { guardianOrderSchema } from "@/lib/validations/guardian.schema";

export const GET = withAuth(async (req, ctx) => {
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '24', 10);
  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const orders = await service.getOrders({ page, limit });
  return NextResponse.json({ data: orders });
}, { roles: ['GUARDIAN'] });

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json();
  const data = guardianOrderSchema.parse(body);

  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const order = await service.placeOrder(data);

  return NextResponse.json({ data: { order } });
}, { roles: ['GUARDIAN'] });
