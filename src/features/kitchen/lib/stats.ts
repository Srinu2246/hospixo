import {
  getKdsStats,
  removeOrder as removeKdsOrder,
  setOrderStatus as setKdsOrderStatus,
} from '@/features/kitchen/lib/kds/stats';
import type { KitchenOrder, KitchenOrderStatus, KitchenStats } from '@/features/kitchen/types';

export function getKitchenStats(orders: readonly KitchenOrder[]): KitchenStats {
  return getKdsStats(orders);
}

export { filterOrdersByStation, filterOrdersByStatus } from '@/features/kitchen/lib/kds/stats';

/** Advance or rewind a ticket's column status. */
export function setOrderStatus(
  orders: readonly KitchenOrder[],
  orderId: string,
  status: KitchenOrderStatus,
): KitchenOrder[] {
  return setKdsOrderStatus(orders, orderId, status);
}

/** Drop a served / picked-up ticket from the board. */
export function removeOrder(orders: readonly KitchenOrder[], orderId: string): KitchenOrder[] {
  return removeKdsOrder(orders, orderId);
}
