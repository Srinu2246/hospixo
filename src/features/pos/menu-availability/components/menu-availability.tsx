'use client';

import { useMemo, useState } from 'react';

import { MenuAvailabilityFooter } from '@/features/pos/menu-availability/components/footer';
import { MenuAvailabilityHeader } from '@/features/pos/menu-availability/components/header';
import { MenuCategories } from '@/features/pos/menu-availability/components/categories';
import { MenuChannels } from '@/features/pos/menu-availability/components/channels';
import { MenuItemsTable } from '@/features/pos/menu-availability/components/items';
import { MenuStats } from '@/features/pos/menu-availability/components/stats';
import { MenuSurfaceTabs } from '@/features/pos/menu-availability/components/tabs';
import { MenuToolbar } from '@/features/pos/menu-availability/components/toolbar';
import {
  dineinMenuChannels,
  menuChannels,
  onlineMenuChannels,
} from '@/features/pos/menu-availability/config';
import {
  countEightySixed,
  filterMenuItems,
  getMenuStats,
  isCategoryEnabled,
} from '@/features/pos/menu-availability/lib';
import type {
  MenuCategory,
  MenuChannelId,
  MenuItem,
  MenuStatusFilter,
  MenuSurfaceTab,
} from '@/features/pos/types/menu-availability';

import styles from './menu-availability.module.css';

type MenuAvailabilityProps = Readonly<{
  categories: readonly MenuCategory[];
  items: readonly MenuItem[];
}>;

export function MenuAvailability({ categories, items: initialItems }: MenuAvailabilityProps) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [baseline] = useState(() => new Map(initialItems.map((item) => [item.id, item.status])));
  const [surface, setSurface] = useState<MenuSurfaceTab>('all');
  const [channelId, setChannelId] = useState<MenuChannelId>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => categories[0]?.id ?? null,
  );
  const [statusFilter, setStatusFilter] = useState<MenuStatusFilter>('total');
  const [query, setQuery] = useState('');
  const [updateMessage, setUpdateMessage] = useState<string | null>(null);

  const activeChannelId = channelId;

  let channelOptions = menuChannels;
  if (surface === 'online') {
    channelOptions = onlineMenuChannels;
  } else if (surface === 'dinein_qr') {
    channelOptions = dineinMenuChannels;
  }

  const surfaceScopedItems = useMemo(
    () =>
      filterMenuItems({
        items,
        surface,
        channelId: activeChannelId,
        categoryId: null,
        statusFilter: 'total',
        query: '',
      }),
    [items, surface, activeChannelId],
  );

  /** When a status card is active, show matching items across categories. */
  const listCategoryId = statusFilter === 'total' ? activeCategoryId : null;

  const visibleItems = useMemo(
    () =>
      filterMenuItems({
        items,
        surface,
        channelId: activeChannelId,
        categoryId: listCategoryId,
        statusFilter,
        query,
      }),
    [items, surface, activeChannelId, listCategoryId, statusFilter, query],
  );

  const stats = useMemo(() => getMenuStats(surfaceScopedItems), [surfaceScopedItems]);

  const itemCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const category of categories) {
      counts[category.id] = filterMenuItems({
        items,
        surface,
        channelId: activeChannelId,
        categoryId: category.id,
        statusFilter,
        query: '',
      }).length;
    }
    return counts;
  }, [categories, items, surface, activeChannelId, statusFilter]);

  const enabledByCategory = useMemo(() => {
    const map: Record<string, boolean> = {};
    for (const category of categories) {
      map[category.id] = isCategoryEnabled(surfaceScopedItems, category.id);
    }
    return map;
  }, [categories, surfaceScopedItems]);

  const changedCount = useMemo(() => {
    let n = 0;
    for (const item of items) {
      if (baseline.get(item.id) !== item.status) n += 1;
    }
    return n;
  }, [items, baseline]);

  const eightySixedCount = countEightySixed(surfaceScopedItems);

  function handleSurfaceChange(next: MenuSurfaceTab) {
    setSurface(next);
    setChannelId('all');
  }

  function handleStatusFilterChange(next: MenuStatusFilter) {
    setStatusFilter(next);
    if (next !== 'total') {
      setActiveCategoryId(null);
    } else if (!activeCategoryId && categories[0]) {
      setActiveCategoryId(categories[0].id);
    }
  }

  function handleSelectCategory(categoryId: string) {
    setActiveCategoryId(categoryId);
    setStatusFilter('total');
  }

  function handleToggleItem(itemId: string, available: boolean) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.id !== itemId) return item;
        if (available) {
          return { ...item, status: item.visibility === 'Hidden' ? 'hidden' : 'available' };
        }
        return { ...item, status: '86d' };
      }),
    );
  }

  function handleToggleCategory(categoryId: string, enabled: boolean) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.categoryId !== categoryId) return item;
        if (!enabled) return { ...item, status: '86d' };
        return {
          ...item,
          status: item.visibility === 'Hidden' ? 'hidden' : 'available',
        };
      }),
    );
    setActiveCategoryId(categoryId);
    setStatusFilter('total');
  }

  function handleUpdate() {
    setUpdateMessage(
      `Queued ${changedCount} change${changedCount === 1 ? '' : 's'} for sync when the POS API is available.`,
    );
  }

  return (
    <div className={styles.page}>
      <MenuAvailabilityHeader />
      <MenuSurfaceTabs value={surface} onChange={handleSurfaceChange} />

      <MenuChannels channels={channelOptions} value={channelId} onChange={setChannelId} />

      <MenuStats
        stats={stats}
        activeFilter={statusFilter}
        onFilterChange={handleStatusFilterChange}
      />
      <MenuToolbar query={query} onQueryChange={setQuery} />

      <div className={styles.body}>
        <MenuCategories
          categories={categories}
          activeCategoryId={activeCategoryId}
          itemCounts={itemCounts}
          enabledByCategory={enabledByCategory}
          onSelect={handleSelectCategory}
          onToggle={handleToggleCategory}
        />
        <MenuItemsTable items={visibleItems} onToggleItem={handleToggleItem} />
      </div>

      {updateMessage ? <output className={styles.updateMessage}>{updateMessage}</output> : null}

      <MenuAvailabilityFooter
        changedCount={changedCount}
        eightySixedCount={eightySixedCount}
        onUpdate={handleUpdate}
      />
    </div>
  );
}
