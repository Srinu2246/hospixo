import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface BranchManagerCaptainOrderSuccessRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function BranchManagerCaptainOrderSuccessRoute({
  params,
}: BranchManagerCaptainOrderSuccessRouteProps) {
  const { orderId } = await params;
  return <OrderSettle orderId={orderId} initialStep="success" />;
}
