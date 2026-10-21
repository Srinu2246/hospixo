import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface CaptainOrderSettleRouteProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function CaptainOrderSettleRoute({ params }: CaptainOrderSettleRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="review" />;
}
