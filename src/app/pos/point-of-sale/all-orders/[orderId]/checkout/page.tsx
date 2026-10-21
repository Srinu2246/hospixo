import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface PosOrderCheckoutRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function PosOrderCheckoutRoute({ params }: PosOrderCheckoutRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="checkout" />;
}
