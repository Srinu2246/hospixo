import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function TakeawayPaymentSuccessPage() {
  return <OrderSettle initialStep="success" />;
}
