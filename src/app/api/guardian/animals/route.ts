import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";

import { guardianCreateAnimalSchema } from "@/lib/validations/guardian.schema";

export const GET = withAuth(async (req, ctx) => {
  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const animals = await service.getAnimals();
  return NextResponse.json({ data: { animals } });
}, { roles: ['GUARDIAN'] });

export const POST = withAuth(async (req, ctx) => {
  const body = await req.json();
  const data = guardianCreateAnimalSchema.parse(body);
  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const animal = await service.createAnimal(data);
  return NextResponse.json({ data: { animal } }, { status: 201 });
}, { roles: ['GUARDIAN'] });

