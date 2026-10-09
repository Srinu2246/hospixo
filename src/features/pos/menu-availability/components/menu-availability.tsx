'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';

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
  MenuItemStatus,
  MenuStatusFilter,
  MenuSurfaceTab,
} from '@/features/pos/types/menu-availability';

export type ChangedMenuItem = {
  id: string;
  overrideId?: string;
  status: MenuItemStatus;
  available: boolean;
};

export type MenuAvailabilityProps = Readonly<{
  categories: readonly MenuCategory[];
  items: readonly MenuItem[];
  onSave?: (changed: ChangedMenuItem[]) => Promise<void> | void;
  isSaving?: boolean;
}>;

export function MenuAvailability({
  categories,
  items: initialItems,
  onSave,
  isSaving = false,
}: MenuAvailabilityProps) {
  const [items, setItems] = useState(() => [...initialItems]);
  const [baseline, setBaseline] = useState(
    () => new Map(initialItems.map((item) => [item.id, item.status])),
  );
  const [prevInitialItems, setPrevInitialItems] = useState(initialItems);
  if (prevInitialItems !== initialItems) {
    setPrevInitialItems(initialItems);
    setItems([...initialItems]);
    setBaseline(new Map(initialItems.map((item) => [item.id, item.status])));
  }

  const [surface, setSurface] = useState<MenuSurfaceTab>('all');
  const [channelId, setChannelId] = useState<MenuChannelId>('all');
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    () => categories[0]?.id ?? null,
  );
  const [prevCategories, setPrevCategories] = useState(categories);
  if (prevCategories !== categories) {
    setPrevCategories(categories);
    if (!activeCategoryId || !categories.some((c) => c.id === activeCategoryId)) {
      setActiveCategoryId(categories[0]?.id ?? null);
    }
  }
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
        return {
          ...item,
          status: available ? 'available' : '86d',
          visibility: available ? 'All' : item.visibility,
        };
      }),
    );
  }

  function handleToggleCategory(categoryId: string, enabled: boolean) {
    setItems((prev) =>
      prev.map((item) => {
        if (item.categoryId !== categoryId) return item;
        return {
          ...item,
          status: enabled ? 'available' : '86d',
          visibility: enabled ? 'All' : item.visibility,
        };
      }),
    );
    setActiveCategoryId(categoryId);
    setStatusFilter('total');
  }

  async function handleUpdate() {
    const currentChangedCount = changedCount;
    const changed: ChangedMenuItem[] = items
      .filter((item) => baseline.get(item.id) !== item.status)
      .map((item) => ({
        id: item.id,
        overrideId: item.overrideId,
        status: item.status,
        available: item.status === 'available',
      }));

    if (onSave && changed.length > 0) {
      try {
        await onSave(changed);
        setBaseline(new Map(items.map((item) => [item.id, item.status])));
        setStatusFilter('total');
        setUpdateMessage(
          `Updated ${currentChangedCount} item${currentChangedCount === 1 ? '' : 's'} availability successfully.`,
        );
      } catch (err) {
        setUpdateMessage(err instanceof Error ? err.message : 'Failed to update availability.');
      }
    } else {
      setUpdateMessage('All item availability is up to date.');
    }
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        minHeight: '100%',
        py: { xs: 3, md: 5 },
        px: { xs: 2, md: 4 },
      }}
    >
      <MenuAvailabilityHeader />
      <MenuSurfaceTabs value={surface} onChange={handleSurfaceChange} />

      <MenuChannels channels={channelOptions} value={channelId} onChange={setChannelId} />

      <MenuStats
        stats={stats}
        activeFilter={statusFilter}
        onFilterChange={handleStatusFilterChange}
      />
      <MenuToolbar query={query} onQueryChange={setQuery} />

      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          alignItems: 'flex-start',
          gap: 2,
        }}
      >
        <MenuCategories
          categories={categories}
          activeCategoryId={activeCategoryId}
          itemCounts={itemCounts}
          enabledByCategory={enabledByCategory}
          onSelect={handleSelectCategory}
          onToggle={handleToggleCategory}
        />
        <MenuItemsTable items={visibleItems} onToggleItem={handleToggleItem} />
      </Box>

      {updateMessage ? (
        <Box
          component="output"
          role="status"
          sx={{
            m: 0,
            p: '0.65rem 0.85rem',
            borderRadius: 1.5,
            bgcolor: 'action.hover',
            border: '1px solid',
            borderColor: 'divider',
            color: 'text.primary',
            fontSize: '0.875rem',
          }}
        >
          {updateMessage}
        </Box>
      ) : null}

      <MenuAvailabilityFooter
        changedCount={changedCount}
        eightySixedCount={eightySixedCount}
        onUpdate={handleUpdate}
        isSaving={isSaving}
      />
    </Box>
  );
}
