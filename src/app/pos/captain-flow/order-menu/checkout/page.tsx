import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function CaptainOrderMenuCheckoutPage() {
  return <OrderSettle initialStep="checkout" />;
}
