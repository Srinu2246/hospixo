import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface BranchManagerPosOrderSuccessRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function BranchManagerPosOrderSuccessRoute({
  params,
}: BranchManagerPosOrderSuccessRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="success" />;
}
