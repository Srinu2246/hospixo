import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface TablesTableSuccessPageProps {
  params: {
    tableId: string;
  };
}

export default function TablesTableSuccessPage({ params }: TablesTableSuccessPageProps) {
  return <OrderSettle initialStep="success" orderId={params.tableId} />;
}
