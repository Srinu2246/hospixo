import { PosOrderSettleRoutePage, readOrderIdParam } from '@/features/pos/point-of-sale/all-orders';

interface PosOrderSettleRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function PosOrderSettleRoute({ params }: PosOrderSettleRouteProps) {
  return <PosOrderSettleRoutePage orderId={await readOrderIdParam(params)} />;
}
