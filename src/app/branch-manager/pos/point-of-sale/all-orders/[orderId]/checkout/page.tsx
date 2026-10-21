import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface BranchManagerPosOrderCheckoutRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function BranchManagerPosOrderCheckoutRoute({
  params,
}: BranchManagerPosOrderCheckoutRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="checkout" />;
}
