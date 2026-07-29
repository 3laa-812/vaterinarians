/**
 * Store Domain Logic
 * Contains pure, testable business logic for the Store Module.
 */

export function calculateOrderSubtotal(items: { quantity: number; unitPrice: number }[]): number {
  return items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
}

export function calculateOrderTotal(subtotal: number, deliveryFee: number): number {
  return subtotal + deliveryFee;
}

export function generateOrderNumber(year: number, sequenceNumber: number): string {
  // Example: ORD-2025-001
  const paddedSequence = sequenceNumber.toString().padStart(3, "0");
  return `ORD-${year}-${paddedSequence}`;
}

export function isLowStock(stock: number, minStock: number): boolean {
  return stock <= minStock;
}

/**
 * Checks if an order can be confirmed based on available stock.
 * Returns an array of product IDs that have insufficient stock.
 */
export function checkInsufficientStock(
  orderItems: { productId: string; quantity: number }[],
  availableProducts: { id: string; stock: number }[]
): string[] {
  const insufficientProductIds: string[] = [];

  for (const item of orderItems) {
    const product = availableProducts.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity) {
      insufficientProductIds.push(item.productId);
    }
  }

  return insufficientProductIds;
}
