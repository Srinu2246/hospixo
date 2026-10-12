import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface TablesTableCheckoutPageProps {
  params: {
    tableId: string;
  };
}

export default function TablesTableCheckoutPage({ params }: TablesTableCheckoutPageProps) {
  return <OrderSettle initialStep="checkout" orderId={params.tableId} />;
}
