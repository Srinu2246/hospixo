import type { Metadata } from 'next';

import { OrderDetailsPage } from '@/features/pos/screens/order-details/order-details-page';

type BranchOrderDetailsRouteProps = Readonly<{
  params: Promise<{ orderId: string }>;
}>;

export const metadata: Metadata = { title: 'Order Details | Branch' };

export default async function BranchOrderDetailsRoutePage({
  params,
}: BranchOrderDetailsRouteProps) {
  const { orderId } = await params;
  return <OrderDetailsPage orderId={orderId} />;
}
