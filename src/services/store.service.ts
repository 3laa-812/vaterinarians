import { prisma } from "@/lib/db";
import { OrderStatus, OrderPaymentStatus, IncomeCategory } from "@prisma/client";
import { calculateOrderSubtotal, calculateOrderTotal, generateOrderNumber, checkInsufficientStock } from "@/domain/store";
import { z } from "zod";
import { createOrderSchema } from "@/lib/validations/store.schema";

export const StoreService = {
  // PRODUCTS
  async listProducts(clinicId: string) {
    return prisma.product.findMany({
      where: { clinicId },
      orderBy: { createdAt: "desc" },
    });
  },

  async getProduct(clinicId: string, productId: string) {
    return prisma.product.findUnique({
      where: { id: productId, clinicId },
    });
  },

  async createProduct(clinicId: string, data: any) {
    return prisma.product.create({
      data: {
        ...data,
        clinicId,
      },
    });
  },

  async updateProduct(clinicId: string, productId: string, data: any) {
    return prisma.product.update({
      where: { id: productId, clinicId },
      data,
    });
  },

  async deleteProduct(clinicId: string, productId: string) {
    return prisma.product.delete({
      where: { id: productId, clinicId },
    });
  },

  // ORDERS
  async listOrders(clinicId: string) {
    return prisma.order.findMany({
      where: { clinicId },
      include: {
        owner: true,
        items: {
          include: { product: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  },

  async createOrder(clinicId: string, userId: string | undefined, data: z.infer<typeof createOrderSchema>) {
    return prisma.$transaction(async (tx) => {
      // 1. Fetch products to check stock and prices
      const productIds = data.items.map((i) => i.productId);
      const products = await tx.product.findMany({
        where: { id: { in: productIds }, clinicId, isActive: true },
      });

      if (products.length !== productIds.length) {
        throw new Error("One or more products not found or inactive.");
      }

      // 2. Check stock
      const insufficient = checkInsufficientStock(data.items, products);
      if (insufficient.length > 0) {
        throw new Error(`Insufficient stock for products: ${insufficient.join(", ")}`);
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
          throw new Error(`Insufficient stock for product ${item.productId}`);
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

  async updateOrderStatus(clinicId: string, orderId: string, status: OrderStatus, userId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, clinicId },
      });

      if (!order) throw new Error("Order not found");

      const updateData: any = { status };

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

  async updateOrderPaymentStatus(clinicId: string, orderId: string, paymentStatus: OrderPaymentStatus, userId: string) {
    return prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: orderId, clinicId },
      });

      if (!order) throw new Error("Order not found");

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
            clinicId,
            recordedById: userId,
          },
        });
      }

      return updatedOrder;
    });
  },

  async getLowStockAlerts(clinicId: string) {
    return prisma.product.findMany({
      where: {
        clinicId,
        isActive: true,
        // Prisma doesn't support comparing two columns directly in where easily without raw query,
        // so we fetch all and filter in memory, or use raw. For simplicity, we can fetch all or those < a high number.
        // Let's use Prisma's raw query for efficiency.
      },
    }).then(products => products.filter(p => p.stock <= p.minStock));
  }
};
