import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface BranchManagerCaptainOrderCheckoutRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function BranchManagerCaptainOrderCheckoutRoute({
  params,
}: BranchManagerCaptainOrderCheckoutRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="checkout" />;
}
