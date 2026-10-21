import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface BranchManagerPosOrderSettleRouteProps {
  params: Promise<{ orderId: string }>;
}

/** Order details / review (captain compact starts on review). */
export default async function BranchManagerPosOrderSettleRoute({
  params,
}: BranchManagerPosOrderSettleRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="review" />;
}
