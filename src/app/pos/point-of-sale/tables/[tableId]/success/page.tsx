import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface TablesTableSuccessPageProps {
  params: Promise<{ tableId: string }>;
}

export default async function TablesTableSuccessPage({ params }: TablesTableSuccessPageProps) {
  const resolvedParams = await params;
  return <OrderSettle initialStep="success" orderId={resolvedParams.tableId} />;
}
