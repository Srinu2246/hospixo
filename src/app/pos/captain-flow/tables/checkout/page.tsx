import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

export default function CaptainFlowTablesCheckoutPage() {
  return <OrderSettle initialStep="checkout" />;
}
