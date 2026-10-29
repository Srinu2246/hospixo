import { PosAllOrdersRoutePage } from '@/features/pos/point-of-sale/all-orders';
import {
  CaptainReadyList,
  CaptainReadyListIndexRedirect,
} from '@/features/pos/point-of-sale/ready-list';
import type { ReadyOrderQueue } from '@/lib/schemas/pos/point-of-sale/ready-list/readyListSchema';
import { TakeawayPage } from '@/features/pos/point-of-sale/takeaway';
import { PosTableSelection } from '@/features/pos/point-of-sale/tables';

/** App route: captain / waiter tables floor. */
export function CaptainFlowTablesRoutePage() {
  return <PosTableSelection isDineIn={false} />;
}

/** App route: `/ready-list` → default tab. */
export function CaptainFlowReadyListIndexRoutePage() {
  return <CaptainReadyListIndexRedirect />;
}

/** App route: ready list tab (captain-flow). */
export function CaptainFlowReadyListRoutePage({
  activeTab = 'active',
}: Readonly<{ activeTab?: ReadyOrderQueue }> = {}) {
  return <CaptainReadyList activeTab={activeTab} />;
}

/** App route: open orders list (captain-flow). */
export function CaptainFlowAllOrdersRoutePage() {
  return <PosAllOrdersRoutePage />;
}

/** App route: dine-in / takeaway menu catalog (captain-flow order-menu). */
export function CaptainFlowOrderMenuRoutePage() {
  return <TakeawayPage mode="takeaway" />;
}
