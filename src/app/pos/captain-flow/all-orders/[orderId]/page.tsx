import { PosOrderSettleRoutePage, readOrderIdParam } from '@/features/pos/point-of-sale/all-orders';

interface CaptainOrderSettleRouteProps {
  params: Promise<{ orderId: string }>;
}

export default async function CaptainOrderSettleRoute({ params }: CaptainOrderSettleRouteProps) {
  return <PosOrderSettleRoutePage orderId={await readOrderIdParam(params)} />;
}
