import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface BranchManagerCaptainOrderSettleRouteProps {
  params: Promise<{
    orderId: string;
  }>;
}

export default async function BranchManagerCaptainOrderSettleRoute({
  params,
}: BranchManagerCaptainOrderSettleRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="review" />;
}
