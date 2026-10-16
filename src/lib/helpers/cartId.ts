export function createCartLineId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}
