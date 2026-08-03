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
      deliveryFee: data.deliveryMethod === 'delivery' ? 50 : 0, // Flat rate of 50 for delivery
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

  /**
   * Creates an appointment for an animal owned by this guardian.
   */
  async createAppointment(data: { animalId: string; scheduledAt: Date; notes?: string }) {
    // Verify the animal belongs to this guardian and clinic
    const animal = await prisma.animal.findFirst({
      where: {
        id: data.animalId,
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
    });

    if (!animal) {
      throw new Error("Animal not found or does not belong to you");
    }

    // Find any available doctor in the clinic (or a specific one if implemented)
    const doctor = await prisma.user.findFirst({
      where: {
        clinicId: this.clinicId,
        role: { in: ["DOCTOR", "CLINIC_ADMIN"] },
      },
    });

    if (!doctor) {
      throw new Error("No doctor available to take appointments");
    }

    return prisma.appointment.create({
      data: {
        scheduledAt: data.scheduledAt,
        notes: data.notes || null,
        animalId: data.animalId,
        doctorId: doctor.id,
      },
    });
  }
}
