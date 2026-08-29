import { prisma } from "@/lib/db";
import { paginate } from "@/lib/pagination";
import { OrderStatus, OrderPaymentStatus, IncomeCategory } from "@prisma/client";
import { calculateOrderSubtotal, calculateOrderTotal, generateOrderNumber, checkInsufficientStock } from "@/domain/store";
import { z } from "zod";
import { createOrderSchema, createProductSchema } from "@/lib/validations/store.schema";
import type { Session } from "next-auth";
import { clinicScope } from "@/lib/scope";
import { AppError, NotFoundError } from "@/lib/api/errors";

export const StoreService = {
  // PRODUCTS
  async listProducts(session: Session, { page = 1, limit = 24, isActive }: { page?: number; limit?: number; isActive?: boolean } = {}) {
    const where: any = { ...clinicScope(session) };
    if (isActive !== undefined) {
      where.isActive = isActive;
    }
    
    return paginate(
      prisma.product,
      {
        where,
        orderBy: { createdAt: "desc" },
      } as any,
      { page, limit }
    );
  },

  async getProduct(session: Session, productId: string) {
    return prisma.product.findUnique({
      where: { id: productId, ...clinicScope(session) },
    });
  },

  async createProduct(session: Session, data: z.infer<typeof createProductSchema>) {
    // Note: SUPER_ADMIN might not have a clinicId. If they need to create, this requires logic to pass clinicId.
    if (!session.user.clinicId) {
       throw new AppError("عيادة غير صالحة", "Invalid clinic context", 400, "INVALID_CLINIC");
    }
    return prisma.product.create({
      data: {
        ...data,
        clinicId: session.user.clinicId,
      },
    });
  },

  async updateProduct(session: Session, productId: string, data: z.infer<typeof createProductSchema>) {
    // We update using the clinic scope to ensure they have permission.
    const product = await prisma.product.findUnique({
      where: { id: productId, ...clinicScope(session) }
    });
    
    if (!product) {
      throw new NotFoundError({ ar: "المنتج", en: "Product" });
    }

    return prisma.product.update({
      where: { id: productId },
      data,
    });
  },

  async deleteProduct(session: Session, productId: string) {
    const product = await prisma.product.findUnique({
      where: { id: productId, ...clinicScope(session) }
    });
    
    if (!product) {
      throw new NotFoundError({ ar: "المنتج", en: "Product" });
    }

    return prisma.product.delete({
      where: { id: productId },
    });
  },

  // ORDERS
  async listOrders(session: Session, { page = 1, limit = 24 }: { page?: number; limit?: number } = {}) {
    return paginate(
      prisma.order,
      {
        where: { ...clinicScope(session) },
        include: {
          owner: true,
          items: {
            include: { product: true },
          },
        },
        orderBy: { createdAt: "desc" },
      } as any,
      { page, limit }
    );
  },

  async createOrder(session: Session, userId: string | undefined, data: z.infer<typeof createOrderSchema>) {
    if (!session.user.clinicId) {
      throw new AppError("عيادة غير صالحة", "Invalid clinic context", 400, "INVALID_CLINIC");
    }
    const clinicId = session.user.clinicId;
    const scope = clinicScope(session);

    return prisma.$transaction(async (tx) => {
      // 1. Fetch products to check stock and prices
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, ...scope, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw new AppError(
          "منتج واحد أو أكثر غير موجود أو غير نشط.", 
          "One or more products not found or inactive.", 
          400, 
          "PRODUCTS_INVALID"
        );
      }

      // 2. Check stock
      const insufficient = checkInsufficientStock(data.items, products);
      if (insufficient.length > 0) {
        throw new AppError(
          `مخزون غير كافٍ للمنتجات: ${insufficient.join(", ")}`,
          `Insufficient stock for products: ${insufficient.join(", ")}`,
          400,
          "INSUFFICIENT_STOCK"
        );
      }

      // 3. Calculate totals
      const itemsWithPrices = data.items.map((item) => {
        const product = products.find((p) => p.id === item.productId)!;
        return {
          ...item,
          unitPrice: product.price,
        };
      });

      const subtotal = calculateOrderSubtotal(itemsWithPrices);
      const total = calculateOrderTotal(subtotal, data.deliveryFee);

      // 4. Generate Order Number
      const date = new Date();
      const year = date.getFullYear();
      // Count orders this year for the clinic
      const count = await tx.order.count({
        where: {
          clinicId,
          createdAt: {
            gte: new Date(year, 0, 1),
            lt: new Date(year + 1, 0, 1),
          },
        },
      });
      const orderNumber = generateOrderNumber(year, count + 1);

      // 5. Create Order
      const order = await tx.order.create({
        data: {
          orderNumber,
          clinicId,
          ownerId: data.ownerId,
          deliveryMethod: data.deliveryMethod,
          deliveryFee: data.deliveryFee,
          subtotal,
          total,
          notes: data.notes,
          items: {
            create: itemsWithPrices.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              total: item.quantity * item.unitPrice,
            })),
          },
        },
      });

      // 6. Decrement Stock atomically to prevent race conditions
      for (const item of data.items) {
        const result = await tx.product.updateMany({
          where: {
            id: item.productId,
            stock: { gte: item.quantity },
          },
          data: {
            stock: {
              decrement: item.quantity,
            },
          },
        });

        if (result.count === 0) {
          throw new AppError(
            `مخزون غير كافٍ للمنتج ${item.productId}`, 
            `Insufficient stock for product ${item.productId}`, 
            400, 
            "INSUFFICIENT_STOCK"
          );
        }
      }

      // 7. Auto-generate Invoice for this order
      const invoiceNumber = `INV-${year}-${count + 1}`;
      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber,
          clinicId,
          ownerId: data.ownerId,
          createdById: userId,
          subtotal,
          total,
          status: "UNPAID",
          orders: {
            connect: { id: order.id }
          }
        }
      });

      return { ...order, invoiceId: invoice.id };
    });
  },

  async updateOrderStatus(session: Session, orderId: string, status: OrderStatus) {
    const scope = clinicScope(session);

    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, ...scope },
      });

      if (!order) throw new NotFoundError({ ar: "الطلب", en: "Order" });

      const updateData: Partial<{ status: OrderStatus; confirmedAt: Date; readyAt: Date; deliveredAt: Date }> = { status };

      if (status === OrderStatus.CONFIRMED && !order.confirmedAt) updateData.confirmedAt = new Date();
      if (status === OrderStatus.READY && !order.readyAt) updateData.readyAt = new Date();
      if (status === OrderStatus.DELIVERED && !order.deliveredAt) updateData.deliveredAt = new Date();

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: updateData,
      });

      return updatedOrder;
    });
  },

  async updateOrderPaymentStatus(session: Session, orderId: string, paymentStatus: OrderPaymentStatus, userId: string) {
    const scope = clinicScope(session);
    
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, ...scope },
      });

      if (!order) throw new NotFoundError({ ar: "الطلب", en: "Order" });

      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { paymentStatus },
      });

      // If status changed to PAID or CASH (meaning fully paid)
      if (
        order.paymentStatus === OrderPaymentStatus.UNPAID &&
        (paymentStatus === OrderPaymentStatus.PAID || paymentStatus === OrderPaymentStatus.CASH)
      ) {
        // Record as Income in the Finance Module
        await tx.income.create({
          data: {
            amount: order.total,
            category: IncomeCategory.STORE_ORDER,
            description: `Payment for Store Order #${order.orderNumber}`,
            date: new Date(),
            clinicId: order.clinicId,
            recordedById: userId,
          },
        });
      }

      return updatedOrder;
    });
  },

  async getLowStockAlerts(session: Session) {
    return prisma.product.findMany({
      where: {
        ...clinicScope(session),
        isActive: true,
      },
    }).then(products => products.filter(p => p.stock <= p.minStock));
  }
};
