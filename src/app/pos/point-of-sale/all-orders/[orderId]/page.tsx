import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface PosOrderSettleRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function PosOrderSettleRoute({ params }: PosOrderSettleRouteProps) {
  const resolvedParams = await params;
  return <OrderSettle orderId={resolvedParams.orderId} initialStep="review" />;
}
