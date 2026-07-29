import { NextResponse } from "next/server";
import { withAuth } from "@/lib/api/handler";
import { GuardianService } from "@/services/guardian.service";
import { prisma } from "@/lib/db";

export const GET = withAuth(async (req, ctx) => {
  const { id } = ctx.params;
  
  if (!id) {
    return NextResponse.json({ error: { en: "Animal ID is required" } }, { status: 400 });
  }

  const service = new GuardianService(ctx.session.user.id, ctx.session.user.clinicId as string);
  const animal = await service.getAnimal(id);

  if (!animal) {
    return NextResponse.json({ error: { en: "Animal not found" } }, { status: 404 });
  }

  const vaccinations = await prisma.petVaccination.findMany({
    where: { petId: id },
    include: {
      vaccine: true,
    },
    orderBy: { dateAdministered: 'desc' },
  })

  return NextResponse.json({ data: { vaccinations } });
}, { roles: ['GUARDIAN'] });
