import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface DineInTableCheckoutPageProps {
  params: Promise<{ tableId: string }>;
}

export default async function DineInTableCheckoutPage({ params }: DineInTableCheckoutPageProps) {
  const resolvedParams = await params;
  return <OrderSettle initialStep="checkout" orderId={resolvedParams.tableId} />;
}
