import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface PosOrderSettleRouteProps {
  params: {
    orderId: string;
  };
}

export default function PosOrderSettleRoute({ params }: PosOrderSettleRouteProps) {
  return <OrderSettle orderId={params.orderId} />;
}
