'use client';

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import {
  AVAILABILITY_CHANNELS,
  type AvailabilityDietaryFilter,
  type AvailabilityStatusFilter,
} from '@/lib/mocks/menu/useMenuAvailability.mocks';
import type {
  AvailabilityCategory,
  AvailabilityChannel,
  AvailabilityChannelGroup,
  AvailabilityItem,
  ItemAvailabilityMark,
  MenuAvailabilityPageConfig,
} from '@/lib/schemas/menu/menuAvailabilitySchema';
import type { MenuItemListParams } from '@/lib/schemas/menu/menuItemsSchema';
import {
  createCategoryInputSchema,
  type CreateCategoryInput,
  type CreateMenuItemFormValues,
  type MenuCatalogItem,
  type MenuCategory,
  type MenuCreationViewMode,
  type MenuPageConfig,
} from '@/lib/schemas/menu/menuCreationSchema';
import { toCatalogDietary, toMenuCatalogItem } from '@/lib/helpers/menuItemHelpers';
import {
  useCreateMenuCategory,
  useMenuCategories,
  useSetMenuCategoryActive,
  useUpdateMenuCategory,
} from '@/lib/hooks/menu/useMenuCategories';
import {
  useDeactivateMenuItem,
  useMenuItems,
  useSetMenuItemActive,
} from '@/lib/hooks/menu/useMenuItems';
import type {
  CreateMenuCategoryBody,
  UpdateMenuCategoryBody,
} from '@/lib/schemas/menu/menuCategoriesSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import {
  pushMenuCreationList,
  pushMenuCreationView,
  readMenuCreationParamsFromLocation,
  replaceMenuCreationCategoryParam,
} from '@/lib/params/menu';
import { useSidebarStore } from '@/stores/sidebarStore';
import { ApiError } from '@/services/api/types';

function toUpdateCategoryBody(
  category: MenuCategory,
  overrides: Partial<{
    name: string;
    description: string;
    status: 'active' | 'inactive';
    display_order: number;
  }> = {},
): UpdateMenuCategoryBody {
  const body: UpdateMenuCategoryBody = {
    name: overrides.name ?? category.name,
    display_order: overrides.display_order ?? category.displayOrder,
    status: overrides.status ?? (category.status === 'Active' ? 'active' : 'inactive'),
  };
  if (overrides.description !== undefined) {
    body.description = overrides.description;
  } else if (category.description) {
    body.description = category.description;
  }
  if (category.parentId != null) body.parent_id = category.parentId;
  return body;
}

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
  isItemsLoading?: boolean;
  itemsError?: Error | null;
  refetchCategories?: () => void;
  refetchItems?: () => void;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setSessionFilter: (sessionId: string) => void;
  openCreateCategory: () => void;
  openEditCategory: (category: MenuCategory) => void;
  openCreateItem: () => void;
  openEditItem: (item: MenuCatalogItem) => void;
  openViewItem: (item: MenuCatalogItem) => void;
  backToList: () => void;
  editingCategory: MenuCategory | null;
  /** POST /v1/restaurant/menu/categories */
  addCategory: (input: CreateCategoryInput) => Promise<void>;
  /** PATCH /v1/restaurant/menu/categories/{id} — edit name/description */
  updateCategory: (input: CreateCategoryInput) => Promise<void>;
  /** POST .../activate | .../deactivate */
  toggleCategoryStatus: (categoryId: string, nextActive: boolean) => Promise<void>;
  addItem: (data: CreateMenuItemFormValues) => void;
  updateItem: (id: string, data: CreateMenuItemFormValues) => void;
  /** Soft-delete via POST .../items/{id}/deactivate */
  deleteItem: (id: string) => Promise<void>;
  isDeletingItem?: boolean;
  isCreatingCategory?: boolean;
  isUpdatingCategory?: boolean;
}

const MenuCreationContext = createContext<MenuCreationContextValue | null>(null);

const MENU_LIST_PARAMS = { page_size: 100 } as const;

export function MenuCreationProvider({
  pageConfig,
  initialViewMode = 'list',
  initialItemId,
  initialCategoryId,
  children,
}: Readonly<{
  pageConfig: MenuPageConfig;
  initialViewMode?: MenuCreationViewMode;
  initialItemId?: string;
  initialCategoryId?: string;
  children: ReactNode;
}>) {
  const [localCategories, setLocalCategories] = useState<MenuCategory[]>([]);
  const [localItems, setLocalItems] = useState<MenuCatalogItem[]>([]);
  const [viewMode, setViewMode] = useState<MenuCreationViewMode>(initialViewMode);
  const [selectedItem, setSelectedItem] = useState<MenuCatalogItem | null>(null);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(() =>
    initialViewMode === 'edit-category' ? (initialCategoryId ?? null) : null,
  );
  const [activeCategoryId, setActiveCategoryIdState] = useState<string | null>(
    () => initialCategoryId ?? null,
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [sessionFilter, setSessionFilter] = useState('session-wise');

  const setActiveCategoryId = (id: string | null) => {
    setActiveCategoryIdState(id);
    replaceMenuCreationCategoryParam(id);
  };

  const categoriesQuery = useMenuCategories(MENU_LIST_PARAMS);
  const itemsQuery = useMenuItems(MENU_LIST_PARAMS);
  const deactivateMenuItem = useDeactivateMenuItem();
  const createMenuCategory = useCreateMenuCategory();
  const updateMenuCategory = useUpdateMenuCategory();
  const setMenuCategoryActive = useSetMenuCategoryActive();
  const account = useSidebarStore((state) => state.account);
  const sidebarContext = useSidebarStore((state) => state.context);

  const apiCategories = categoriesQuery.data?.items;
  const apiItems = itemsQuery.data?.items;
  const isCategoriesLoading = categoriesQuery.isLoading;
  const categoriesError = categoriesQuery.error;
  const isItemsLoading = itemsQuery.isLoading || itemsQuery.isFetching;
  const itemsError = itemsQuery.error;
  const refetchCategories = categoriesQuery.refetch;
  const refetchItems = itemsQuery.refetch;

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
      parentId: c.parent_id ?? null,
    }));
  }, [apiCategories, localCategories]);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(category.id, category.name);
    }
    return map;
  }, [categories]);

  const items: MenuCatalogItem[] = useMemo(() => {
    if (localItems.length > 0) return localItems;
    return (apiItems ?? []).map((item) => toMenuCatalogItem(item, categoryNameById));
  }, [apiItems, categoryNameById, localItems]);

  // Seed selection once API items arrive for view/edit deep links.
  if (
    (initialViewMode === 'view-item' || initialViewMode === 'edit-item') &&
    selectedItem == null &&
    items.length > 0
  ) {
    const match = (initialItemId ? items.find((i) => i.id === initialItemId) : null) ?? items[0];
    setSelectedItem(match);
    setActiveCategoryId(match.categoryId);
  }

  const editingCategory = useMemo(() => {
    if (viewMode !== 'edit-category') return null;
    const targetId = editingCategoryId ?? initialCategoryId ?? activeCategoryId;
    if (!targetId) return null;
    return categories.find((category) => category.id === targetId) ?? null;
  }, [viewMode, editingCategoryId, initialCategoryId, activeCategoryId, categories]);

  // Handle browser back/forward buttons
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handlePopState = () => {
      const params = readMenuCreationParamsFromLocation();
      setActiveCategoryIdState(params.categoryFilterId ?? null);

      if (params.viewMode === 'create-item') {
        setSelectedItem(null);
        setViewMode('create-item');
      } else if (params.viewMode === 'edit-item') {
        const item = (params.itemId ? items.find((i) => i.id === params.itemId) : null) ?? items[0];
        setSelectedItem(item);
        if (item) setActiveCategoryIdState(item.categoryId);
        setViewMode('edit-item');
      } else if (params.viewMode === 'view-item') {
        const item = (params.itemId ? items.find((i) => i.id === params.itemId) : null) ?? items[0];
        setSelectedItem(item);
        if (item) setActiveCategoryIdState(item.categoryId);
        setViewMode('view-item');
      } else if (params.viewMode === 'create-category') {
        setEditingCategoryId(null);
        setViewMode('create-category');
      } else if (params.viewMode === 'edit-category') {
        if (params.categoryId) {
          setActiveCategoryIdState(params.categoryId);
          setEditingCategoryId(params.categoryId);
        }
        setViewMode('edit-category');
      } else if (
        window.location.pathname.endsWith('/create-menu-item') ||
        window.location.pathname.endsWith('/menu-creation/create')
      ) {
        setViewMode('create-item');
      } else {
        setSelectedItem(null);
        setEditingCategoryId(null);
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
      isItemsLoading,
      itemsError,
      refetchCategories: () => {
        void refetchCategories();
      },
      refetchItems: () => {
        void refetchItems();
      },
      setActiveCategoryId,
      setSearchQuery,
      setSessionFilter,
      openCreateCategory: () => {
        setEditingCategoryId(null);
        setViewMode('create-category');
        pushMenuCreationView('create-category');
      },
      openEditCategory: (category) => {
        setEditingCategoryId(category.id);
        setActiveCategoryIdState(category.id);
        setViewMode('edit-category');
        pushMenuCreationView('edit-category', {
          categoryId: category.id,
          categoryFilterId: category.id,
        });
      },
      openCreateItem: () => {
        setSelectedItem(null);
        setViewMode('create-item');
        pushMenuCreationView('create-item');
      },
      openEditItem: (item) => {
        setSelectedItem(item);
        setActiveCategoryIdState(item.categoryId);
        setViewMode('edit-item');
        pushMenuCreationView('edit-item', {
          itemId: item.id,
          categoryFilterId: item.categoryId,
        });
      },
      openViewItem: (item) => {
        setSelectedItem(item);
        setActiveCategoryIdState(item.categoryId);
        setViewMode('view-item');
        pushMenuCreationView('view-item', {
          itemId: item.id,
          categoryFilterId: item.categoryId,
        });
      },
      deleteItem: async (id: string) => {
        const itemId = Number(id);
        if (!Number.isFinite(itemId) || itemId <= 0) {
          throw new Error('Invalid menu item id');
        }

        await deactivateMenuItem.mutateAsync(itemId);

        setLocalItems((prev) => {
          const source = prev.length > 0 ? prev : items;
          return source.filter((item) => item.id !== id);
        });
        setSelectedItem(null);
        setViewMode('list');
        pushMenuCreationList();
      },
      editingCategory,
      isDeletingItem: deactivateMenuItem.isPending,
      isCreatingCategory: createMenuCategory.isPending,
      isUpdatingCategory: updateMenuCategory.isPending || setMenuCategoryActive.isPending,
      backToList: () => {
        setSelectedItem(null);
        setEditingCategoryId(null);
        setViewMode('list');
        pushMenuCreationList({ cleanPath: true });
      },
      addCategory: async (input) => {
        const parsed = createCategoryInputSchema.parse(input);
        const scope = pageConfig.scope === 'branch' ? 'branch' : 'company';
        const branchId = sidebarContext.branchId ?? account?.branch_id ?? undefined;

        if (scope === 'branch' && (branchId == null || branchId <= 0)) {
          throw new ApiError('Branch is required to create a category for this account.', 400);
        }

        const body: CreateMenuCategoryBody = {
          name: parsed.name,
          ...(parsed.description ? { description: parsed.description } : {}),
          scope,
          ...(scope === 'branch' && branchId != null ? { assign_branch_id: branchId } : {}),
        };

        const created = await createMenuCategory.mutateAsync(body);
        // Drop local overrides so the refreshed API list is the source of truth.
        setLocalCategories([]);
        await refetchCategories();

        const nextId = String(created.id);
        setEditingCategoryId(null);
        setActiveCategoryIdState(nextId);
        setViewMode('list');
        pushMenuCreationList({ categoryFilterId: nextId });
      },
      updateCategory: async (input) => {
        if (!editingCategory) {
          throw new ApiError('No category selected to edit.', 400);
        }
        const parsed = createCategoryInputSchema.parse(input);
        const categoryId = Number(editingCategory.id);
        if (!Number.isFinite(categoryId) || categoryId <= 0) {
          throw new ApiError('Invalid category id.', 400);
        }

        await updateMenuCategory.mutateAsync({
          categoryId,
          body: toUpdateCategoryBody(editingCategory, {
            name: parsed.name,
            description: parsed.description ?? '',
          }),
        });

        const editedId = editingCategory.id;
        setLocalCategories([]);
        await refetchCategories();
        setEditingCategoryId(null);
        setActiveCategoryIdState(editedId);
        setViewMode('list');
        pushMenuCreationList({ categoryFilterId: editedId });
      },
      toggleCategoryStatus: async (categoryId, nextActive) => {
        const category = categories.find((item) => item.id === categoryId);
        if (!category) {
          throw new ApiError('Category not found.', 404);
        }
        const numericId = Number(categoryId);
        if (!Number.isFinite(numericId) || numericId <= 0) {
          throw new ApiError('Invalid category id.', 400);
        }

        await setMenuCategoryActive.mutateAsync({
          categoryId: numericId,
          active: nextActive,
        });

        setLocalCategories([]);
        await refetchCategories();
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
        setLocalItems([newItem, ...items]);
        setActiveCategoryId(data.category);
        setViewMode('list');
        pushMenuCreationList({ categoryFilterId: data.category });
      },
      updateItem: (id: string, data: CreateMenuItemFormValues) => {
        const cat = categories.find((c) => c.id === data.category);
        setLocalItems(
          items.map((item) =>
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
        setActiveCategoryId(data.category);
        setViewMode('list');
        pushMenuCreationList({ categoryFilterId: data.category });
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
      editingCategory,
      viewMode,
      isCategoriesLoading,
      categoriesError,
      isItemsLoading,
      itemsError,
      refetchCategories,
      refetchItems,
      deactivateMenuItem,
      createMenuCategory,
      updateMenuCategory,
      setMenuCategoryActive,
      account,
      sidebarContext.branchId,
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
  activeCategoryId: string | null;
  searchQuery: string;
  channelGroup: AvailabilityChannelGroup;
  activeChannelId: string;
  dietaryFilter: AvailabilityDietaryFilter;
  statusFilter: AvailabilityStatusFilter;
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setChannelGroup: (group: AvailabilityChannelGroup) => void;
  setActiveChannelId: (channelId: string) => void;
  setDietaryFilter: (value: AvailabilityDietaryFilter) => void;
  setStatusFilter: (value: AvailabilityStatusFilter) => void;
  /** POST .../activate | .../deactivate — active (true) / inactive (false). */
  toggleItemMark: (itemId: string, nextActive: boolean) => Promise<void>;
  isUpdatingItemStatus?: boolean;
  isCategoriesLoading?: boolean;
  isItemsLoading?: boolean;
  categoriesError?: Error | null;
  itemsError?: Error | null;
}

const MenuAvailabilityContext = createContext<MenuAvailabilityContextValue | null>(null);

function channelsForGroup(group: AvailabilityChannelGroup): AvailabilityChannel[] {
  if (group === 'all') return AVAILABILITY_CHANNELS;
  return AVAILABILITY_CHANNELS.filter((channel) => channel.group === group || channel.id === 'all');
}

function toAvailabilityItem(
  item: MenuItemResponse,
  categoryNameById: Map<string, string>,
): AvailabilityItem {
  const categoryId = String(item.category_id);
  const isActive = item.status === 'active';
  return {
    id: String(item.id),
    name: item.name,
    categoryId,
    categoryName: categoryNameById.get(categoryId) ?? 'Uncategorized',
    dietary: toCatalogDietary(item.dietary_type),
    mark: isActive ? 'available' : '86d',
    isActive,
    visibility: !isActive
      ? 'hidden'
      : item.allow_delivery || item.allow_takeaway
        ? 'online'
        : 'dine-in',
    tag: item.tags[0]?.name ?? item.code ?? item.name,
    isHidden: !isActive,
  };
}

function matchesDietaryFilter(
  dietary: AvailabilityItem['dietary'],
  filter: AvailabilityDietaryFilter,
): boolean {
  if (filter === 'all') return true;
  if (filter === 'veg') return dietary === 'Veg';
  if (filter === 'non_veg') return dietary === 'Non-Veg';
  if (filter === 'egg') return dietary === 'Egg';
  return dietary === 'Vegan';
}

export function MenuAvailabilityProvider({
  pageConfig,
  children,
}: Readonly<{
  pageConfig: MenuAvailabilityPageConfig;
  children: ReactNode;
}>) {
  /** null = All Items (same as Menu Creation). */
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  /** Default DineIn QR — All / Online tabs are feature-flagged off for MVP. */
  const [channelGroup, setChannelGroup] = useState<AvailabilityChannelGroup>('dine-in-qr');
  const [activeChannelId, setActiveChannelId] = useState('dine-in-qr');
  const [dietaryFilter, setDietaryFilter] = useState<AvailabilityDietaryFilter>('all');
  const [statusFilter, setStatusFilter] = useState<AvailabilityStatusFilter>('all');
  const [localItems, setLocalItems] = useState<AvailabilityItem[] | null>(null);

  const itemListParams = useMemo<MenuItemListParams>(
    () => ({
      ...MENU_LIST_PARAMS,
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(dietaryFilter !== 'all' ? { dietary_type: dietaryFilter } : {}),
    }),
    [dietaryFilter, statusFilter],
  );

  // Same list APIs as Menu Creation: GET categories + GET menu items (with status / dietary filters).
  const categoriesQuery = useMenuCategories(MENU_LIST_PARAMS);
  const itemsQuery = useMenuItems(itemListParams);
  const setMenuItemActive = useSetMenuItemActive();

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data?.items ?? []) {
      map.set(String(category.id), category.name);
    }
    return map;
  }, [categoriesQuery.data?.items]);

  const apiCategories = useMemo<AvailabilityCategory[]>(
    () =>
      (categoriesQuery.data?.items ?? []).map((category) => ({
        id: String(category.id),
        name: category.name,
        displayOrder: category.display_order,
        status: category.status,
      })),
    [categoriesQuery.data?.items],
  );

  const apiItems = useMemo(
    () => (itemsQuery.data?.items ?? []).map((item) => toAvailabilityItem(item, categoryNameById)),
    [itemsQuery.data?.items, categoryNameById],
  );

  const categories = apiCategories;
  const items = localItems ?? apiItems;

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
      if (!matchesDietaryFilter(item.dietary, dietaryFilter)) return false;
      if (statusFilter === 'active' && !item.isActive) return false;
      if (statusFilter === 'inactive' && item.isActive) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.tag.toLowerCase().includes(query) ||
        item.categoryName.toLowerCase().includes(query)
      );
    });
  }, [activeCategoryId, dietaryFilter, items, searchQuery, statusFilter]);

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
      activeCategoryId,
      searchQuery,
      channelGroup,
      activeChannelId,
      dietaryFilter,
      statusFilter,
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
      setDietaryFilter: (next) => {
        setDietaryFilter(next);
        setLocalItems(null);
      },
      setStatusFilter: (next) => {
        setStatusFilter(next);
        setLocalItems(null);
      },
      toggleItemMark: async (itemId, nextActive) => {
        const numericId = Number(itemId);
        if (!Number.isFinite(numericId) || numericId <= 0) {
          throw new ApiError('Invalid menu item id.', 400);
        }

        await setMenuItemActive.mutateAsync({
          itemId: numericId,
          active: nextActive,
        });

        const nextMark: ItemAvailabilityMark = nextActive ? 'available' : '86d';
        setLocalItems((prev) => {
          const source = prev ?? items;
          return source.map((item) =>
            item.id === itemId
              ? {
                  ...item,
                  mark: nextMark,
                  isActive: nextActive,
                  isHidden: !nextActive,
                  visibility: nextActive ? item.visibility : 'hidden',
                }
              : item,
          );
        });
        await itemsQuery.refetch();
        setLocalItems(null);
      },
      isUpdatingItemStatus: setMenuItemActive.isPending,
      isCategoriesLoading: categoriesQuery.isLoading,
      isItemsLoading: itemsQuery.isLoading || itemsQuery.isFetching,
      categoriesError: categoriesQuery.error,
      itemsError: itemsQuery.error,
    }),
    [
      activeCategoryId,
      activeChannelId,
      categories,
      categoryCounts,
      channelGroup,
      channels,
      dietaryFilter,
      filteredItems,
      items,
      pageConfig,
      searchQuery,
      stats,
      statusFilter,
      setMenuItemActive,
      categoriesQuery.isLoading,
      categoriesQuery.error,
      itemsQuery,
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
