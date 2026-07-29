import { prisma } from "@/lib/db";

export const invoiceService = {
  getInvoiceDetails: async (invoiceId: string, clinicId: string) => {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
        clinicId,
      },
      include: {
        clinic: true,
        owner: true,
        animal: true,
        createdBy: true,
        payments: {
          include: {
            appointment: {
              include: {
                doctor: true,
                session: true,
              },
            },
          },
        },
        orders: {
          include: {
            items: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    return invoice;
  },

  getInvoices: async (clinicId: string, page = 1, limit = 20) => {
    const skip = (page - 1) * limit;
    
    const [invoices, total] = await Promise.all([
      prisma.invoice.findMany({
        where: { clinicId },
        include: {
          owner: true,
          createdBy: true,
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.invoice.count({
        where: { clinicId }
      })
    ]);

    return {
      invoices,
      total,
      pages: Math.ceil(total / limit)
    };
  },
};

export type InvoiceDetails = NonNullable<
  Awaited<ReturnType<typeof invoiceService.getInvoiceDetails>>
>;
