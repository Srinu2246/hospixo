import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface PosOrderSuccessRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function PosOrderSuccessRoute({ params }: PosOrderSuccessRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="success" />;
}
