import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface CaptainOrderSettleRouteProps {
  params: {
    orderId: string;
  };
}

export default function CaptainOrderSettleRoute({ params }: CaptainOrderSettleRouteProps) {
  return <OrderSettle orderId={params.orderId} />;
}
