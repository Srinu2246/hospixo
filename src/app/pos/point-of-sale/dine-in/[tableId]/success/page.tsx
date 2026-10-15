import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface DineInTableSuccessPageProps {
  params: Promise<{ tableId: string }>;
}

export default async function DineInTableSuccessPage({ params }: DineInTableSuccessPageProps) {
  const resolvedParams = await params;
  return <OrderSettle initialStep="success" orderId={resolvedParams.tableId} />;
}
