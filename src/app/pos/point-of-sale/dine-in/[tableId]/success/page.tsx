import { OrderSettle } from '@/features/pos/point-of-sale/all-orders';

interface DineInTableSuccessPageProps {
  params: {
    tableId: string;
  };
}

export default function DineInTableSuccessPage({ params }: DineInTableSuccessPageProps) {
  return <OrderSettle initialStep="success" orderId={params.tableId} />;
}
