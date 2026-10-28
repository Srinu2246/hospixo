import { kitchenDisplayStatsSchema } from '@/lib/schemas/kitchen-display/kitchenDisplaySchema';
import type { KitchenDisplayStats } from '@/types/kitchen-display';

export const EMPTY_KITCHEN_DISPLAY_STATS: KitchenDisplayStats = kitchenDisplayStatsSchema.parse({
  totalOrders: 0,
  pendingCount: 0,
  preparingCount: 0,
  readyCount: 0,
  avgPrepTime: '—',
});
