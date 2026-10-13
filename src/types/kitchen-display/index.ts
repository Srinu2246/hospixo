import { z } from 'zod';

export type KitchenPriority = 'HIGH' | 'NORMAL';
export type KitchenOrderStatus = 'new' | 'preparing' | 'ready' | 'served';
export type DishCategory = 'Starters' | 'Mains' | 'Drinks' | 'Desserts';

export interface KitchenDishItem {
  id: string;
  name: string;
  quantity: number;
  category: DishCategory;
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
}

export interface KitchenDisplayStats {
  totalOrders: number;
  pendingCount: number;
  preparingCount: number;
  readyCount: number;
  avgPrepTime: string;
}

export type KitchenStation = 'Main Kitchen' | 'Tandoor' | 'Bar';

export type {
  KitchenBoardItemLine,
  KitchenBoardTicket,
  PreparationStationSummary,
  KitchenBoardCounts,
  KitchenBoardResponse,
  ApiResponseKitchenBoard,
  KitchenStatusUpdateRequest,
} from '@/lib/schemas/kitchen-display/kitchenDisplaySchema';
