import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";
import { z } from "zod";

const updateAccountSchema = z.object({
  name: z.string().min(1).optional(),
  apptReminder: z.boolean().optional(),
  orderUpdate: z.boolean().optional(),
  vaccineReminder: z.boolean().optional(),
});

export const GET = withAuth(async (_req, ctx) => {
  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const account = await service.getAccount();
  return NextResponse.json({ data: { account } });
}, { roles: ['GUARDIAN'] });

export const PATCH = withAuth(async (req, ctx) => {
  const body = await req.json();
  const parsed = updateAccountSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: { ar: 'بيانات غير صالحة', en: 'Invalid data', code: 'VALIDATION_ERROR' } },
      { status: 400 }
    );
  }

  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const account = await service.updateAccount(parsed.data);
  return NextResponse.json({ data: { account } });
}, { roles: ['GUARDIAN'] });
