import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";

export const GET = withAuth(async (_req, ctx) => {
  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const clinic = await service.getClinicInfo();
  return NextResponse.json({ data: { clinic } });
}, { roles: ['GUARDIAN'] });
