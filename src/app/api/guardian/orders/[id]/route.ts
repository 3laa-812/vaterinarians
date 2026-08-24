import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";
import { AppError } from "@/lib/api/errors";

export const GET = withAuth(
  async (req, ctx) => {
    const { id } = ctx.params as { id: string };
    const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
    const order = await service.getOrder(id);

    if (!order) {
      throw new AppError("Order not found", "الطلب غير موجود", 404, "ORDER_NOT_FOUND");
    }

    return NextResponse.json({ data: { order } });
  },
  { roles: ["GUARDIAN"] }
);
