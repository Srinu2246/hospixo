import type {
  MenuAvailabilityStats,
  MenuChannelId,
  MenuItem,
  MenuStatusFilter,
  MenuSurfaceTab,
} from '@/features/pos/types/menu-availability';

export function getMenuStats(items: readonly MenuItem[]): MenuAvailabilityStats {
  let available = 0;
  let eightySixed = 0;
  let hidden = 0;

  for (const item of items) {
    if (item.status === 'available') available += 1;
    else if (item.status === '86d') eightySixed += 1;
    else if (item.status === 'hidden') hidden += 1;
  }

  return {
    total: items.length,
    available,
    eightySixed,
    hidden,
  };
}

export function filterMenuItems(params: {
  items: readonly MenuItem[];
  surface: MenuSurfaceTab;
  channelId: MenuChannelId;
  categoryId: string | null;
  statusFilter: MenuStatusFilter;
  query: string;
}): MenuItem[] {
  const q = params.query.trim().toLowerCase();

  return params.items.filter((item) => {
    if (params.surface !== 'all' && !item.surfaces.includes(params.surface)) {
      return false;
    }
    if (params.channelId !== 'all' && !item.channels.includes(params.channelId)) {
      return false;
    }
    if (params.categoryId && item.categoryId !== params.categoryId) {
      return false;
    }
    if (params.statusFilter !== 'total' && item.status !== params.statusFilter) {
      return false;
    }
    if (
      q &&
      !item.name.toLowerCase().includes(q) &&
      !item.tags.some((t) => t.toLowerCase().includes(q))
    ) {
      return false;
    }
    return true;
  });
}

/** Category is "on" only when at least one item in that category is still available. */
export function isCategoryEnabled(items: readonly MenuItem[], categoryId: string): boolean {
  const inCategory = items.filter((item) => item.categoryId === categoryId);
  if (inCategory.length === 0) return true;
  return inCategory.some((item) => item.status === 'available');
}

export function countEightySixed(items: readonly MenuItem[]): number {
  return items.filter((item) => item.status === '86d').length;
}
