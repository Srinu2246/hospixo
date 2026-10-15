'use client';

import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';

import {
  AVAILABILITY_CHANNELS,
  MOCK_AVAILABILITY_CATEGORIES,
  MOCK_AVAILABILITY_ITEMS,
} from '@/lib/mocks/menu/useMenuAvailability.mocks';
import { MOCK_MENU_CATEGORIES, MOCK_MENU_ITEMS } from '@/lib/mocks/menu/useMenuCreation.mocks';
import type {
  AvailabilityCategory,
  AvailabilityChannel,
  AvailabilityChannelGroup,
  AvailabilityItem,
  ItemAvailabilityMark,
  MenuAvailabilityPageConfig,
} from '@/lib/schemas/menu/menuAvailabilitySchema';
import {
  createCategoryInputSchema,
  menuCategorySchema,
  type CreateCategoryInput,
  type MenuCatalogItem,
  type MenuCategory,
  type MenuCreationViewMode,
  type MenuPageConfig,
} from '@/lib/schemas/menu/menuCreationSchema';

/* -------------------------------------------------------------------------- */
/* Menu Creation                                                              */
/* -------------------------------------------------------------------------- */

interface MenuCreationContextValue {
  pageConfig: MenuPageConfig;
  viewMode: MenuCreationViewMode;
  categories: MenuCategory[];
  items: MenuCatalogItem[];
  filteredItems: MenuCatalogItem[];
  categoryCounts: Record<string, number>;
  totalItemCount: number;
  activeCategoryId: string | null;
  searchQuery: string;
  sessionFilter: string;
  selectedItem: MenuCatalogItem | null;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSessionFilter: (sessionId: string) => void;
  openCreateCategory: () => void;
  openCreateItem: () => void;
  openEditItem: (item: MenuCatalogItem) => void;
  openViewItem: (item: MenuCatalogItem) => void;
  backToList: () => void;
  addCategory: (input: CreateCategoryInput) => void;
  toggleCategoryStatus: (categoryId: string) => void;
}

const MenuCreationContext = createContext<MenuCreationContextValue | null>(null);

export function MenuCreationProvider({
  pageConfig,
  children,
}: Readonly<{
  pageConfig: MenuPageConfig;
  children: ReactNode;
}>) {
  const [viewMode, setViewMode] = useState<MenuCreationViewMode>('list');
  const [categories, setCategories] = useState<MenuCategory[]>(MOCK_MENU_CATEGORIES);
  const [items] = useState<MenuCatalogItem[]>(MOCK_MENU_ITEMS);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('session-wise');
  const [selectedItem, setSelectedItem] = useState<MenuCatalogItem | null>(null);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.code?.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
      );
    });
  }, [activeCategoryId, items, searchQuery]);

  const value = useMemo<MenuCreationContextValue>(
    () => ({
      pageConfig,
      viewMode,
      categories,
      items,
      filteredItems,
      categoryCounts,
      totalItemCount: items.length,
      activeCategoryId,
      searchQuery,
      sessionFilter,
      selectedItem,
      setActiveCategoryId,
      setSearchQuery,
      setSessionFilter,
      openCreateCategory: () => setViewMode('create-category'),
      openCreateItem: () => {
        setSelectedItem(null);
        setViewMode('create-item');
      },
      openEditItem: (item) => {
        setSelectedItem(item);
        setViewMode('edit-item');
      },
      openViewItem: (item) => {
        setSelectedItem(item);
        setViewMode('view-item');
      },
      backToList: () => {
        setSelectedItem(null);
        setViewMode('list');
      },
      addCategory: (input) => {
        const parsed = createCategoryInputSchema.parse(input);
        const next = menuCategorySchema.parse({
          id: `cat_${Date.now()}`,
          name: parsed.name,
          description: parsed.description || undefined,
          status: 'Active',
          displayOrder: categories.length + 1,
        });
        setCategories((prev) => [...prev, next]);
        setActiveCategoryId(next.id);
        setViewMode('list');
      },
      toggleCategoryStatus: (categoryId) => {
        setCategories((prev) =>
          prev.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  status: category.status === 'Active' ? 'Inactive' : 'Active',
                }
              : category,
          ),
        );
      },
    }),
    [
      activeCategoryId,
      categories,
      categoryCounts,
      filteredItems,
      items,
      pageConfig,
      searchQuery,
      sessionFilter,
      selectedItem,
      viewMode,
    ],
  );

  return <MenuCreationContext.Provider value={value}>{children}</MenuCreationContext.Provider>;
}

export function useMenuCreation(): MenuCreationContextValue {
  const context = useContext(MenuCreationContext);
  if (!context) {
    throw new Error('useMenuCreation must be used within MenuCreationProvider');
  }
  return context;
}

/* -------------------------------------------------------------------------- */
/* Menu Availability                                                          */
/* -------------------------------------------------------------------------- */

interface MenuAvailabilityContextValue {
  pageConfig: MenuAvailabilityPageConfig;
  categories: AvailabilityCategory[];
  items: AvailabilityItem[];
  filteredItems: AvailabilityItem[];
  channels: AvailabilityChannel[];
  categoryCounts: Record<string, number>;
  totalItemCount: number;
  stats: {
    total: number;
    available: number;
    eightySixCount: number;
    hidden: number;
  };
  changedCount: number;
  activeCategoryId: string | null;
  searchQuery: string;
  channelGroup: AvailabilityChannelGroup;
  activeChannelId: string;
  addonStatus: string;
  storeStatus: string;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setChannelGroup: (group: AvailabilityChannelGroup) => void;
  setActiveChannelId: (channelId: string) => void;
  setAddonStatus: (status: string) => void;
  setStoreStatus: (status: string) => void;
  toggleItemMark: (itemId: string) => void;
  updateAvailability: () => void;
}

const MenuAvailabilityContext = createContext<MenuAvailabilityContextValue | null>(null);

function channelsForGroup(group: AvailabilityChannelGroup): AvailabilityChannel[] {
  if (group === 'all') return AVAILABILITY_CHANNELS;
  return AVAILABILITY_CHANNELS.filter((channel) => channel.group === group || channel.id === 'all');
}

export function MenuAvailabilityProvider({
  pageConfig,
  children,
}: Readonly<{
  pageConfig: MenuAvailabilityPageConfig;
  children: ReactNode;
}>) {
  const [categories] = useState<AvailabilityCategory[]>(MOCK_AVAILABILITY_CATEGORIES);
  const [baselineItems, setBaselineItems] = useState<AvailabilityItem[]>(MOCK_AVAILABILITY_ITEMS);
  const [items, setItems] = useState<AvailabilityItem[]>(MOCK_AVAILABILITY_ITEMS);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>('cat_veg_biryani');
  const [searchQuery, setSearchQuery] = useState('');
  const [channelGroup, setChannelGroup] = useState<AvailabilityChannelGroup>('online');
  const [activeChannelId, setActiveChannelId] = useState('mayukha-website');
  const [addonStatus, setAddonStatus] = useState('addon-on');
  const [storeStatus, setStoreStatus] = useState('store-on');

  const channels = useMemo(() => channelsForGroup(channelGroup), [channelGroup]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const item of items) {
      counts[item.categoryId] = (counts[item.categoryId] ?? 0) + 1;
    }
    return counts;
  }, [items]);

  const filteredItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return items.filter((item) => {
      if (activeCategoryId && item.categoryId !== activeCategoryId) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
      );
    });
  }, [activeCategoryId, items, searchQuery]);

  const stats = useMemo(() => {
    let available = 0;
    let eightySixCount = 0;
    let hidden = 0;
    for (const item of items) {
      if (item.mark === 'available') available += 1;
      if (item.mark === '86d') eightySixCount += 1;
      if (item.isHidden || item.visibility === 'hidden') hidden += 1;
    }
    return {
      total: items.length,
      available,
      eightySixCount,
      hidden,
    };
  }, [items]);

  const changedCount = useMemo(() => {
    const baselineById = new Map(baselineItems.map((item) => [item.id, item]));
    return items.reduce((count, item) => {
      const baseline = baselineById.get(item.id);
      if (!baseline) return count + 1;
      return baseline.mark !== item.mark ? count + 1 : count;
    }, 0);
  }, [baselineItems, items]);

  const value = useMemo<MenuAvailabilityContextValue>(
    () => ({
      pageConfig,
      categories,
      items,
      filteredItems,
      channels,
      categoryCounts,
      totalItemCount: items.length,
      stats,
      changedCount,
      activeCategoryId,
      searchQuery,
      channelGroup,
      activeChannelId,
      addonStatus,
      storeStatus,
      setActiveCategoryId,
      setSearchQuery,
      setChannelGroup: (group) => {
        setChannelGroup(group);
        const nextChannels = channelsForGroup(group);
        const stillValid = nextChannels.some((channel) => channel.id === activeChannelId);
        if (!stillValid) {
          setActiveChannelId(nextChannels[0]?.id ?? 'all');
        }
      },
      setActiveChannelId,
      setAddonStatus,
      setStoreStatus,
      toggleItemMark: (itemId) => {
        setItems((prev) =>
          prev.map((item) => {
            if (item.id !== itemId) return item;
            const nextMark: ItemAvailabilityMark = item.mark === 'available' ? '86d' : 'available';
            return { ...item, mark: nextMark };
          }),
        );
      },
      updateAvailability: () => {
        setBaselineItems(items);
      },
    }),
    [
      activeCategoryId,
      activeChannelId,
      addonStatus,
      categories,
      categoryCounts,
      changedCount,
      channelGroup,
      channels,
      filteredItems,
      items,
      pageConfig,
      searchQuery,
      stats,
      storeStatus,
    ],
  );

  return (
    <MenuAvailabilityContext.Provider value={value}>{children}</MenuAvailabilityContext.Provider>
  );
}

export function useMenuAvailability(): MenuAvailabilityContextValue {
  const context = useContext(MenuAvailabilityContext);
  if (!context) {
    throw new Error('useMenuAvailability must be used within MenuAvailabilityProvider');
  }
  return context;
}
