import { z } from "zod";

export const requestOtpSchema = z.object({
  phone: z.string().min(8, "Phone number is invalid"),
  clinicId: z.string().cuid("Invalid clinic ID"),
});

export const verifyOtpSchema = z.object({
  phone: z.string().min(8, "Phone number is invalid"),
  clinicId: z.string().cuid("Invalid clinic ID"),
  code: z.string().length(6, "OTP must be 6 digits"),
});

export const guardianOrderItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const guardianOrderSchema = z.object({
  items: z.array(guardianOrderItemSchema).min(1, "Order must contain at least one item"),
  notes: z.string().optional(),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("pickup"),
  // Delivery fee is calculated on the server, not passed from client to avoid tampering
});

export type GuardianCreateOrderInput = z.infer<typeof guardianOrderSchema>;

export const guardianCreateAnimalSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  species: z.string().min(1, "Species is required"),
  breed: z.string().optional().or(z.literal("")),
  gender: z.enum(["MALE", "FEMALE"]).optional().nullable(),
  birthDate: z.string().optional().nullable().or(z.literal("")),
  color: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
});

export type GuardianCreateAnimalInput = z.infer<typeof guardianCreateAnimalSchema>;
