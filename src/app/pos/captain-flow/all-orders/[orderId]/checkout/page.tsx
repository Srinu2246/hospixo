import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface CaptainOrderCheckoutRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function CaptainOrderCheckoutRoute({
  params,
}: CaptainOrderCheckoutRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="checkout" />;
}
