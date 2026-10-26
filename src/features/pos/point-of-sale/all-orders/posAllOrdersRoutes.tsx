import { AllOrdersPage } from '@/features/pos/point-of-sale/all-orders/AllOrdersPage';
import {
  OrderSettle,
  type OrderSettleProps,
} from '@/features/pos/point-of-sale/all-orders/OrderSettle';

export type OrderSettleRouteStep = NonNullable<OrderSettleProps['initialStep']>;

/** App route: open orders list (POS + captain-flow). */
export function PosAllOrdersRoutePage() {
  return <AllOrdersPage />;
}

export interface PosOrderSettleRoutePageProps {
  orderId: string;
  initialStep?: OrderSettleRouteStep;
}

/** App route: order review / checkout / success (`OrderSettle`). */
export function PosOrderSettleRoutePage({
  orderId,
  initialStep = 'review',
}: Readonly<PosOrderSettleRoutePageProps>) {
  return <OrderSettle orderId={orderId} initialStep={initialStep} />;
}

export async function readOrderIdParam(params: Promise<{ orderId: string }>): Promise<string> {
  const { orderId } = await params;
  return orderId;
}
