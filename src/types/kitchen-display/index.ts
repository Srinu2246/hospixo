export type KitchenPriority = 'HIGH' | 'NORMAL';
export type KitchenOrderStatus = 'new' | 'preparing' | 'ready' | 'served';
export type DishCategory = 'Starters' | 'Mains' | 'Drinks' | 'Desserts';
/** Backend `KitchenBadge`. Drives the PATCH action for one item. */
export type KitchenLineStatus = 'kot_sent' | 'preparing' | 'ready' | 'served' | 'cancelled';

export interface KitchenDishItem {
  id: string;
  name: string;
  quantity: number;
  category: DishCategory;
  /** Null when the line is not in the kitchen badge flow. */
  itemStatus: KitchenLineStatus | null;
  icon?: string;
  notes?: string;
}

export interface KitchenOrderItem {
  id: string;
  orderNumber: string;
  tableNumber?: string;
  isTakeaway?: boolean;
  priority: KitchenPriority;
  status: KitchenOrderStatus;
  items: KitchenDishItem[];
  station: string;
  timeLabel: string;
  elapsedSeconds: number;
  createdAt: string;
  /** Optimistic lock for PATCH kitchen-status. */
  version: number;
}

export interface KitchenDisplayStats {
  totalOrders: number;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  avgPrepTime: string;
}

export type KitchenStation = string;
