import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface DineInTableCheckoutPageProps {
  params: {
    tableId: string;
  };
}

export default function DineInTableCheckoutPage({ params }: DineInTableCheckoutPageProps) {
  return <OrderSettle initialStep="checkout" orderId={params.tableId} />;
}
