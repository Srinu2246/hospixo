'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  AVAILABILITY_CHANNELS,
  MOCK_AVAILABILITY_CATEGORIES,
  MOCK_AVAILABILITY_ITEMS,
} from '@/lib/mocks/menu/useMenuAvailability.mocks';
import { MOCK_MENU_ITEMS } from '@/lib/mocks/menu/useMenuCreation.mocks';
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
  type CreateMenuItemFormValues,
  type MenuCatalogItem,
  type MenuCategory,
  type MenuCreationViewMode,
  type MenuPageConfig,
} from '@/lib/schemas/menu/menuCreationSchema';
import { useMenuCategories } from '@/lib/hooks/menu/useMenuCategories';

/* -------------------------------------------------------------------------- */
/* Menu Creation                                                              */
/* -------------------------------------------------------------------------- */

export interface MenuCreationContextValue {
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
  isCategoriesLoading?: boolean;
  categoriesError?: Error | null;
  refetchCategories?: () => void;
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
  addItem: (data: CreateMenuItemFormValues) => void;
  updateItem: (id: string, data: CreateMenuItemFormValues) => void;
  deleteItem: (id: string) => void;
}

const MenuCreationContext = createContext<MenuCreationContextValue | null>(null);

const ACTIVE_CATEGORIES_PARAMS = { status: 'active' as const };

export function MenuCreationProvider({
  pageConfig,
  initialViewMode = 'list',
  initialItemId,
  children,
}: Readonly<{
  pageConfig: MenuPageConfig;
  initialViewMode?: MenuCreationViewMode;
  initialItemId?: string;
  children: ReactNode;
}>) {
  const categoriesQuery = useMenuCategories(ACTIVE_CATEGORIES_PARAMS);
  const apiCategories = categoriesQuery.data?.items;
  const isCategoriesLoading = categoriesQuery.isLoading;
  const categoriesError = categoriesQuery.error;
  const refetchCategories = categoriesQuery.refetch;

  const [localCategories, setLocalCategories] = useState<MenuCategory[]>([]);
  const [items, setItems] = useState<MenuCatalogItem[]>(MOCK_MENU_ITEMS);

  const categories: MenuCategory[] = useMemo(() => {
    if (localCategories.length > 0) {
      return localCategories;
    }
    return (apiCategories ?? []).map((c): MenuCategory => ({
      id: String(c.id),
      name: c.name,
      status: c.status === 'active' ? 'Active' : 'Inactive',
      description: c.description ?? undefined,
      displayOrder: c.display_order,
    }));
  }, [apiCategories, localCategories]);

  // Deterministic initial item and category based on props (identical on server and client)
  const initialItem = useMemo(() => {
    if (initialViewMode === 'view-item' || initialViewMode === 'edit-item') {
      return (initialItemId ? items.find((i) => i.id === initialItemId) : null) ?? items[0];
    }
    return null;
  }, [initialViewMode, initialItemId, items]);

  const [viewMode, setViewMode] = useState<MenuCreationViewMode>(initialViewMode);
  const [selectedItem, setSelectedItem] = useState<MenuCatalogItem | null>(initialItem);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(
    initialItem ? initialItem.categoryId : null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('session-wise');

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const urlParams = new URLSearchParams(window.location.search);
      const viewParam = urlParams.get('view');
      const itemId = urlParams.get('itemId');
      if (viewParam === 'create-item') {
        setSelectedItem(null);
        setViewMode('create-item');
      } else if (viewParam === 'edit-item') {
        const item = (itemId ? items.find((i) => i.id === itemId) : null) ?? items[0];
        setSelectedItem(item);
        if (item) setActiveCategoryId(item.categoryId);
        setViewMode('edit-item');
      } else if (viewParam === 'view-item') {
        const item = (itemId ? items.find((i) => i.id === itemId) : null) ?? items[0];
        setSelectedItem(item);
        if (item) setActiveCategoryId(item.categoryId);
        setViewMode('view-item');
      } else if (viewParam === 'create-category') {
        setViewMode('create-category');
      } else if (
        window.location.pathname.endsWith('/create-menu-item') ||
        window.location.pathname.endsWith('/menu-creation/create')
      ) {
        setViewMode('create-item');
      } else {
        setSelectedItem(null);
        setViewMode('list');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [items]);

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
      isCategoriesLoading,
      categoriesError,
      refetchCategories: () => {
        void refetchCategories();
      },
      setActiveCategoryId,
      setSearchQuery,
      setSessionFilter,
      openCreateCategory: () => {
        setViewMode('create-category');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'create-category');
          window.history.pushState({ view: 'create-category' }, '', url.toString());
        }
      },
      openCreateItem: () => {
        setSelectedItem(null);
        setViewMode('create-item');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'create-item');
          window.history.pushState({ view: 'create-item' }, '', url.toString());
        }
      },
      openEditItem: (item) => {
        setSelectedItem(item);
        setActiveCategoryId(item.categoryId);
        setViewMode('edit-item');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'edit-item');
          url.searchParams.set('itemId', item.id);
          window.history.pushState({ view: 'edit-item', itemId: item.id }, '', url.toString());
        }
      },
      openViewItem: (item) => {
        setSelectedItem(item);
        setActiveCategoryId(item.categoryId);
        setViewMode('view-item');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.set('view', 'view-item');
          url.searchParams.set('itemId', item.id);
          window.history.pushState({ view: 'view-item', itemId: item.id }, '', url.toString());
        }
      },
      deleteItem: (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
        setSelectedItem(null);
        setViewMode('list');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          url.searchParams.delete('itemId');
          window.history.pushState({}, '', `${url.pathname}${url.search}`);
        }
      },
      backToList: () => {
        setSelectedItem(null);
        setViewMode('list');
        if (typeof window !== 'undefined') {
          const url = new URL(window.location.href);
          url.searchParams.delete('view');
          url.searchParams.delete('itemId');
          const cleanPath = url.pathname
            .replace(/\/create-menu-item$/, '/menu-creation')
            .replace(/\/create$/, '');
          window.history.pushState({}, '', `${cleanPath}${url.search}`);
        }
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
        setLocalCategories([...categories, next]);
        setActiveCategoryId(next.id);
        setViewMode('list');
      },
      toggleCategoryStatus: (categoryId) => {
        setLocalCategories(
          categories.map((category) =>
            category.id === categoryId
              ? {
                  ...category,
                  status: (category.status === 'Active' ? 'Inactive' : 'Active') as
                    'Active' | 'Inactive',
                }
              : category,
          ),
        );
      },
      addItem: (data: CreateMenuItemFormValues) => {
        const cat = categories.find((c) => c.id === data.category);
        const newItem: MenuCatalogItem = {
          id: `item_${Date.now()}`,
          name: data.name,
          categoryId: data.category,
          categoryName: cat?.name ?? 'Starters',
          basePrice: data.itemPrice,
          dietary: data.dietaryType as 'Veg' | 'Non-Veg' | 'Egg',
          status: 'Available',
          code: data.code,
          description: data.description,
          imageUrl: data.images[0] ?? undefined,
          orderTypes: data.orderTypes,
          tags: data.tags,
        };
        setItems((prev) => [newItem, ...prev]);
        setActiveCategoryId(data.category);
        setViewMode('list');
      },
      updateItem: (id: string, data: CreateMenuItemFormValues) => {
        const cat = categories.find((c) => c.id === data.category);
        setItems((prev) =>
          prev.map((item) =>
            item.id === id
              ? {
                  ...item,
                  name: data.name,
                  categoryId: data.category,
                  categoryName: cat?.name ?? item.categoryName,
                  basePrice: data.itemPrice,
                  dietary: data.dietaryType as 'Veg' | 'Non-Veg' | 'Egg',
                  code: data.code,
                  description: data.description,
                  imageUrl: data.images[0] ?? item.imageUrl,
                  orderTypes: data.orderTypes,
                  tags: data.tags,
                }
              : item,
          ),
        );
        setViewMode('list');
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
      isCategoriesLoading,
      categoriesError,
      refetchCategories,
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

export interface MenuAvailabilityContextValue {
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
