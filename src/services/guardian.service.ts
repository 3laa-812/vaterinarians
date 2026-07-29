import { prisma } from "@/lib/db";
import { GuardianCreateOrderInput } from "@/lib/validations/guardian.schema";
import { StoreService } from "@/services/store.service";

export class GuardianService {
  constructor(private ownerId: string, private clinicId: string) {}

  /**
   * Retrieves all animals owned by this guardian, including their upcoming appointments.
   */
  async getAnimals() {
    return prisma.animal.findMany({
      where: {
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
      include: {
        appointments: {
          where: {
            scheduledAt: { gte: new Date() },
            status: { notIn: ["POSTPONED", "ABSENT", "COMPLETED"] },
          },
          orderBy: { scheduledAt: "asc" },
          take: 3,
        },
      },
    });
  }

  /**
   * Retrieves a specific animal owned by this guardian, including its full medical history.
   */
  async getAnimal(id: string) {
    return prisma.animal.findFirst({
      where: {
        id,
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
      include: {
        appointments: {
          orderBy: { scheduledAt: "desc" },
          include: {
            session: true,
          }
        },
      },
    });
  }

  /**
   * Retrieves products available in the clinic.
   */
  async getProducts() {
    return prisma.product.findMany({
      where: {
        clinicId: this.clinicId,
        isActive: true,
        stock: { gt: 0 },
      },
      orderBy: { name: "asc" },
    });
  }

  /**
   * Places an order on behalf of the guardian using the StoreService.
   */
  async placeOrder(data: GuardianCreateOrderInput) {
    // Re-use the atomic transaction logic from StoreService
    return StoreService.createOrder(this.clinicId, undefined, {
      ...data,
      ownerId: this.ownerId,
      deliveryFee: 0, // Fallback for guardian placed orders
    });
  }

  /**
   * Retrieves the guardian's past orders.
   */
  async getOrders() {
    return prisma.order.findMany({
      where: {
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }
}
