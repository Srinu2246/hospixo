import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface CaptainOrderSuccessRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function CaptainOrderSuccessRoute({ params }: CaptainOrderSuccessRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="success" />;
}
