import type { KitchenOrderStatus } from '@/features/kitchen/types';
import type { OpenOrderKitchenStatus } from '@/features/pos/config/open-orders';

export function mapKitchenStatusToOpenOrder(status: KitchenOrderStatus): OpenOrderKitchenStatus {
  switch (status) {
    case 'new':
      return 'kotSent';
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    default:
      return 'kotSent';
  }
}

export function mapOpenOrderToKitchenStatus(status: OpenOrderKitchenStatus): KitchenOrderStatus {
  switch (status) {
    case 'kotSent':
      return 'new';
    case 'preparing':
      return 'preparing';
    case 'ready':
      return 'ready';
    case 'billing':
      return 'ready';
    default:
      return 'new';
  }
}
