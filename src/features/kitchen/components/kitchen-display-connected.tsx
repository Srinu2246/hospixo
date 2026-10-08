'use client';

import {
  KitchenDisplay,
  defaultKitchenStations,
  type KitchenConnectionStatus,
} from '@/features/kitchen';
import { usePosOrdersStore } from '@/context/pos-orders-store';

type KitchenDisplayConnectedProps = Readonly<{
  stations?: typeof defaultKitchenStations;
  connectionStatus?: KitchenConnectionStatus;
  title?: string;
}>;

/** Kitchen board wired to the shared POS order store (live KOT sync). */
export function KitchenDisplayConnected({
  stations = defaultKitchenStations,
  connectionStatus,
  title,
}: KitchenDisplayConnectedProps) {
  const { kitchenOrders, updateKitchenOrderStatus } = usePosOrdersStore();

  return (
    <KitchenDisplay
      orders={kitchenOrders}
      stations={stations}
      connectionStatus={connectionStatus}
      title={title}
      onStartPreparing={(orderId) => updateKitchenOrderStatus(orderId, 'preparing')}
      onRecall={(orderId) => updateKitchenOrderStatus(orderId, 'new')}
      onMarkReady={(orderId) => updateKitchenOrderStatus(orderId, 'ready')}
      onServed={(orderId) => updateKitchenOrderStatus(orderId, 'served')}
    />
  );
}
