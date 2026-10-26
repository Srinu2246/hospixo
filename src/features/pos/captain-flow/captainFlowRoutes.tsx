import { PosAllOrdersRoutePage } from '@/features/pos/point-of-sale/all-orders';
import { ReadyListPage } from '@/features/pos/point-of-sale/ready-list';
import { TakeawayPage } from '@/features/pos/point-of-sale/takeaway';
import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

/** App route: captain / waiter tables floor. */
export function CaptainFlowTablesRoutePage() {
  return <PosTableSelection isDineIn={false} />;
}

/** App route: ready-to-serve list (captain-flow). */
export function CaptainFlowReadyListRoutePage() {
  return <ReadyListPage />;
}

/** App route: open orders list (captain-flow). */
export function CaptainFlowAllOrdersRoutePage() {
  return <PosAllOrdersRoutePage />;
}

/** App route: dine-in / takeaway menu catalog (captain-flow order-menu). */
export function CaptainFlowOrderMenuRoutePage() {
  return <TakeawayPage mode="takeaway" />;
}
