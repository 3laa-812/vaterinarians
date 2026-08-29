import { prisma } from "@/lib/db";
import { paginate } from "@/lib/pagination";
import { AppError } from "@/lib/api/errors";
import { GuardianCreateOrderInput, GuardianCreateAnimalInput } from "@/lib/validations/guardian.schema";
import { StoreService } from "@/services/store.service";

const DOCTOR_SELECT = { id: true, name: true } as const;

export class GuardianService {
  constructor(private ownerId: string, private clinicId: string) {}

  /**
   * Creates a new animal for this guardian in this clinic.
   */
  async createAnimal(data: GuardianCreateAnimalInput) {
    return prisma.animal.create({
      data: {
        name: data.name,
        species: data.species,
        breed: data.breed || null,
        gender: data.gender || null,
        birthDate: data.birthDate ? new Date(data.birthDate) : null,
        color: data.color || null,
        notes: data.notes || null,
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
    });
  }

  /**
   * Retrieves all animals owned by this guardian, including their upcoming appointments
   * and the doctor assigned to each one.
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
          include: {
            doctor: { select: DOCTOR_SELECT },
          },
        },
        // Latest weight only — powers the Recovery Ring against `targetWeight`.
        // Full history stays on the animal-detail endpoint; the list view only
        // needs the single most recent point.
        weightRecords: {
          orderBy: { recordedAt: "desc" },
          take: 1,
        },
      },
    });
  }

  /**
   * Retrieves a specific animal owned by this guardian, including its full medical history
   * and the doctor tied to each appointment/session.
   */
  async getAnimal(id: string) {
    return prisma.animal.findFirst({
      where: {
        id,
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
      include: {
        weightRecords: {
          orderBy: { recordedAt: "desc" }
        },
        appointments: {
          orderBy: { scheduledAt: "desc" },
          include: {
            session: {
              include: {
                messages: {
                  orderBy: { createdAt: "asc" }
                }
              }
            },
            payment: true,
            doctor: { select: DOCTOR_SELECT },
          },
        },
      },
    });
  }

  /**
   * Lists doctors (and clinic admins who also take patients) available in this guardian's
   * clinic, so the booking flow can offer a real choice instead of a hidden auto-assign.
   */
  async getAvailableDoctors() {
    return prisma.user.findMany({
      where: {
        clinicId: this.clinicId,
        role: { in: ["DOCTOR", "CLINIC_ADMIN"] },
      },
      select: DOCTOR_SELECT,
      orderBy: { name: "asc" },
    });
  }

  /**
   * Retrieves products available in the clinic.
   */
  async getProducts({ page = 1, limit = 24 }: { page?: number; limit?: number } = {}) {
    return paginate(
      prisma.product,
      {
        where: {
          clinicId: this.clinicId,
          isActive: true,
          stock: { gt: 0 },
        },
        orderBy: { name: "asc" },
      } as any,
      { page, limit }
    );
  }

  /**
   * Places an order on behalf of the guardian using the StoreService.
   */
  async placeOrder(data: GuardianCreateOrderInput) {
    // Re-use the atomic transaction logic from StoreService
    const mockSession = { user: { clinicId: this.clinicId } } as any;
    return StoreService.createOrder(mockSession, undefined, {
      ...data,
      ownerId: this.ownerId,
      deliveryFee: data.deliveryMethod === 'delivery' ? 50 : 0, // Flat rate of 50 for delivery
    });
  }

  /**
   * Retrieves the guardian's past orders.
   */
  async getOrders({ page = 1, limit = 24 }: { page?: number; limit?: number } = {}) {
    return paginate(
      prisma.order,
      {
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
      } as any,
      { page, limit }
    );
  }

  /**
   * Retrieves a single order by ID for this guardian.
   */
  async getOrder(id: string) {
    return prisma.order.findFirst({
      where: {
        id,
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
    });
  }

  /**
   * Creates an appointment for an animal owned by this guardian.
   *
   * Business rules:
   * - The animal must belong to this guardian, in this clinic.
   * - The slot must be in the future.
   * - If the guardian picked a specific doctor, that doctor must belong to the clinic
   *   and must not already have a SCHEDULED appointment at that exact time.
   * - If no doctor was picked, the clinic's doctors are checked in order of who has the
   *   fewest appointments that day, and the first one free at that time slot is assigned
   *   (simple fair load-balancing instead of always slamming the same doctor).
   * - The resulting appointment reuses the same clinic-scoped model the staff dashboard
   *   reads from, so it shows up immediately for doctors/admins — no separate data path.
   */
  async createAppointment(data: { animalId: string; scheduledAt: Date; doctorId?: string; notes?: string }) {
    if (Number.isNaN(data.scheduledAt.getTime())) {
      throw new AppError("موعد غير صالح", "Invalid appointment date/time", 400, "INVALID_DATE");
    }
    if (data.scheduledAt.getTime() < Date.now()) {
      throw new AppError(
        "لا يمكن حجز موعد في الماضي",
        "Cannot book an appointment in the past",
        400,
        "PAST_DATE"
      );
    }

    // Verify the animal belongs to this guardian and clinic
    const animal = await prisma.animal.findFirst({
      where: {
        id: data.animalId,
        ownerId: this.ownerId,
        clinicId: this.clinicId,
      },
    });

    if (!animal) {
      throw new AppError(
        "الحيوان غير موجود أو لا ينتمي إليك",
        "Animal not found or does not belong to you",
        404,
        "INVALID_ANIMAL"
      );
    }

    const doctorId = await this.resolveDoctorForSlot(data.scheduledAt, data.doctorId);

    return prisma.appointment.create({
      data: {
        scheduledAt: data.scheduledAt,
        notes: data.notes || null,
        animalId: data.animalId,
        doctorId,
      },
      include: {
        doctor: { select: DOCTOR_SELECT },
        animal: { select: { id: true, name: true, species: true } },
      },
    });
  }

  /**
   * Resolves which doctor should be assigned to a guardian-initiated booking.
   * Throws a clear, user-facing conflict error instead of silently double-booking a doctor.
   */
  private async resolveDoctorForSlot(scheduledAt: Date, requestedDoctorId?: string) {
    if (requestedDoctorId) {
      const doctor = await prisma.user.findFirst({
        where: { id: requestedDoctorId, clinicId: this.clinicId, role: { in: ["DOCTOR", "CLINIC_ADMIN"] } },
      });
      if (!doctor) {
        throw new AppError("الطبيب غير موجود في هذه العيادة", "Doctor not found in this clinic", 400, "INVALID_DOCTOR");
      }

      const conflict = await prisma.appointment.findFirst({
        where: { doctorId: doctor.id, scheduledAt, status: "SCHEDULED" },
      });
      if (conflict) {
        throw new AppError(
          "هذا الطبيب لديه موعد آخر في نفس الوقت، برجاء اختيار وقت أو طبيب آخر",
          "This doctor already has an appointment at that time — please pick another time or doctor",
          409,
          "APPOINTMENT_CONFLICT"
        );
      }
      return doctor.id;
    }

    // No specific doctor requested: auto-assign, preferring whoever has fewer
    // appointments that day, then confirm they're actually free at this exact slot.
    const dayStart = new Date(scheduledAt);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(scheduledAt);
    dayEnd.setHours(23, 59, 59, 999);

    const doctorsRaw = await prisma.user.findMany({
      where: { clinicId: this.clinicId, role: { in: ["DOCTOR", "CLINIC_ADMIN"] } },
      select: {
        id: true,
        _count: {
          select: {
            appointments: {
              where: { scheduledAt: { gte: dayStart, lte: dayEnd }, status: "SCHEDULED" },
            },
          },
        },
      },
    });

    // Sort by that day's actual (filtered) appointment load, lightest first.
    const doctors = [...doctorsRaw].sort((a, b) => a._count.appointments - b._count.appointments);

    if (doctors.length === 0) {
      throw new AppError(
        "لا يوجد طبيب متاح لاستقبال المواعيد في هذه العيادة",
        "No doctor available to take appointments in this clinic",
        409,
        "NO_DOCTOR_AVAILABLE"
      );
    }

    for (const doctor of doctors) {
      const conflict = await prisma.appointment.findFirst({
        where: { doctorId: doctor.id, scheduledAt, status: "SCHEDULED" },
      });
      if (!conflict) return doctor.id;
    }

    throw new AppError(
      "كل الأطباء محجوزون في هذا الوقت، برجاء اختيار وقت آخر",
      "All doctors are booked at that time — please pick another time",
      409,
      "APPOINTMENT_CONFLICT"
    );
  }

  async getClinicInfo() {
    const clinic = await prisma.clinic.findUnique({
      where: { id: this.clinicId },
      select: {
        name: true,
        nameAr: true,
        address: true,
        phone: true,
      },
    });

    if (!clinic) {
      throw new AppError("العيادة غير موجودة", "Clinic not found", 404, "CLINIC_NOT_FOUND");
    }

    return clinic;
  }

  async getAccount() {
    const owner = await prisma.owner.findFirst({
      where: { id: this.ownerId, clinicId: this.clinicId },
      select: { name: true, phone: true },
    });

    if (!owner) {
      throw new AppError("المرافق غير موجود", "Guardian not found", 404, "GUARDIAN_NOT_FOUND");
    }

    return {
      name: owner.name,
      phone: owner.phone,
      apptReminder: true,
      orderUpdate: true,
      vaccineReminder: true,
    };
  }

  async updateAccount(data: {
    name?: string;
    apptReminder?: boolean;
    orderUpdate?: boolean;
    vaccineReminder?: boolean;
  }) {
    if (data.name) {
      await prisma.owner.update({
        where: { id: this.ownerId },
        data: { name: data.name },
      });
    }

    return this.getAccount();
  }
}
