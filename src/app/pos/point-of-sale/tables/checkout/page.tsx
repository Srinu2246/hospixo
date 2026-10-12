import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function TablesCheckoutPage() {
  return <OrderSettle initialStep="checkout" />;
}
