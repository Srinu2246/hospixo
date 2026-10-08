import type { KdsOrder, KdsOrderStatus, KdsStats } from '@/features/kitchen/types/kds';

export function getKdsStats(orders: readonly KdsOrder[]): KdsStats {
  let pending = 0;
  let preparing = 0;
  let ready = 0;

  for (const order of orders) {
    if (order.status === 'new') pending += 1;
    else if (order.status === 'preparing') preparing += 1;
    else if (order.status === 'ready') ready += 1;
  }

  return {
    total: orders.length,
    pending,
    preparing,
    ready,
  };
}

export function filterOrdersByStation(orders: readonly KdsOrder[], stationId: string): KdsOrder[] {
  return orders.filter((order) => order.stationId === stationId);
}

export function filterOrdersByStatus(
  orders: readonly KdsOrder[],
  status: KdsOrderStatus,
): KdsOrder[] {
  return orders.filter((order) => order.status === status);
}

/** Advance or rewind a ticket's column status. */
export function setOrderStatus(
  orders: readonly KdsOrder[],
  orderId: string,
  status: KdsOrderStatus,
): KdsOrder[] {
  return orders.map((order) => (order.id === orderId ? { ...order, status } : order));
}

/** Drop a served / picked-up ticket from the board. */
export function removeOrder(orders: readonly KdsOrder[], orderId: string): KdsOrder[] {
  return orders.filter((order) => order.id !== orderId);
}
