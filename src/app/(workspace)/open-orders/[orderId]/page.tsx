import type { Metadata } from 'next';

import { OrderDetailsPage } from '@/features/pos/screens/order-details/order-details-page';

type OpenOrderDetailsRouteProps = Readonly<{
  params: Promise<{ orderId: string }>;
}>;

export const metadata: Metadata = { title: 'Order Details | POS' };

export default async function OpenOrderDetailsRoutePage({ params }: OpenOrderDetailsRouteProps) {
  const { orderId } = await params;
  return <OrderDetailsPage orderId={orderId} />;
}
