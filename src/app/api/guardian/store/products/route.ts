import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";

export async function GET() {
  try {
    const session = await auth();

    const whereClause: any = {
      isActive: true,
      stock: { gt: 0 },
    };

    if (session?.user?.clinicId) {
      whereClause.clinicId = session.user.clinicId;
    }

    const products = await prisma.product.findMany({
      where: whereClause,
      orderBy: { name: "asc" },
    });

    return NextResponse.json({ data: { products } });
  } catch (error) {
    console.error('[API Error]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', en: 'Failed to fetch products', ar: 'فشل في جلب المنتجات' } },
      { status: 500 }
    );
  }
}
