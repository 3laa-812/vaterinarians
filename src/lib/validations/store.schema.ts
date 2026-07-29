import { z } from "zod";
import { ProductCategory, OrderStatus, OrderPaymentStatus } from "@prisma/client";

// PRODUCT SCHEMAS
export const createProductSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  nameAr: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(ProductCategory),
  price: z.number().positive("Price must be greater than 0"),
  imageUrl: z.string().url().optional(),
  imageKey: z.string().optional(),
  stock: z.number().int().nonnegative("Stock cannot be negative").default(0),
  minStock: z.number().int().nonnegative().default(5),
  unit: z.string().default("piece"),
  isActive: z.boolean().default(true),
  requiresPrescription: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema.partial();

// ORDER SCHEMAS
export const orderItemSchema = z.object({
  productId: z.string().cuid("Invalid product ID"),
  quantity: z.number().int().positive("Quantity must be at least 1"),
});

export const createOrderSchema = z.object({
  ownerId: z.string().cuid("Invalid owner ID"),
  items: z.array(orderItemSchema).min(1, "Order must contain at least one item"),
  notes: z.string().optional(),
  deliveryMethod: z.enum(["pickup", "delivery"]).default("pickup"),
  deliveryFee: z.number().nonnegative().default(0),
});

export const updateOrderStatusSchema = z.object({
  status: z.nativeEnum(OrderStatus),
});

export const updateOrderPaymentStatusSchema = z.object({
  paymentStatus: z.nativeEnum(OrderPaymentStatus),
});

export const orderMessageSchema = z.object({
  content: z.string().min(1, "Message cannot be empty"),
  fromOwner: z.boolean().default(false),
});
