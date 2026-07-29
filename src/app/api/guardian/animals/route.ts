import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";

export const GET = withAuth(async (req, ctx) => {
  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const animals = await service.getAnimals();
  return NextResponse.json({ data: { animals } });
}, { roles: ['GUARDIAN'] });
