import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface TablesTableCheckoutPageProps {
  params: Promise<{ tableId: string }>;
}

export default async function TablesTableCheckoutPage({ params }: TablesTableCheckoutPageProps) {
  const resolvedParams = await params;
  return <OrderSettle initialStep="checkout" orderId={resolvedParams.tableId} />;
}
