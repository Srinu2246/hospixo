import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function TakeawayCheckoutPage() {
  return <OrderSettle initialStep="checkout" />;
}
