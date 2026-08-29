import { NextResponse, NextRequest } from "next/server";
import { prisma } from "@/lib/db";
import { auth } from "@/lib/auth";
import { paginate } from "@/lib/pagination";
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const session = await auth();
    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '24', 10);

    const whereClause: any = {
      isActive: true,
      stock: { gt: 0 },
    };

    if (session?.user?.clinicId) {
      whereClause.clinicId = session.user.clinicId;
    }

    const result = await paginate(
      prisma.product,
      {
        where: whereClause,
        orderBy: { name: "asc" },
      } as any,
      { page, limit }
    );

    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('[API Error]', error);
    return NextResponse.json(
      { error: { code: 'INTERNAL_SERVER_ERROR', en: 'Failed to fetch products', ar: 'فشل في جلب المنتجات' } },
      { status: 500 }
    );
  }
}
