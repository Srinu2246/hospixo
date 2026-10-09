import type { Metadata } from 'next';

import { OrderDetailsPage } from '@/features/pos/screens/order-details/order-details-page';

type CaptainOrderDetailsRouteProps = Readonly<{
  params: Promise<{ orderId: string }>;
}>;

export const metadata: Metadata = { title: 'Order Details | Captain' };

export default async function CaptainOrderDetailsRoutePage({
  params,
}: CaptainOrderDetailsRouteProps) {
  const { orderId } = await params;
  return <OrderDetailsPage orderId={orderId} />;
}
