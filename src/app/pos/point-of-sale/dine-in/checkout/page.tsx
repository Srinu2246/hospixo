import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function DineInCheckoutPage() {
  return <OrderSettle initialStep="checkout" />;
}
