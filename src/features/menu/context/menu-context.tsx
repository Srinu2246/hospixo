'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/context/auth';
import { useOptionalDashboardFilter } from '@/context/dashboard-filter';
import { isMockDashboardOutletId } from '@/lib/api/branch-tenancy';
import type { MenuPageConfig } from '../config/menu-page-config';
import { useInvalidateMenuManagementQueries } from '../hooks/use-invalidate-menu-queries';
import {
  menuCategoriesQueryKey,
  menuItemImagesQueryKey,
  menuItemTagsQueryKey,
  menuItemVariantsQueryKey,
  menuItemsQueryKey,
} from '../hooks/menu-management-query-keys';
import { useMenuCatalogQueries } from '../hooks/use-menu-catalog-queries';
import { useMenuItemResourceQueries } from '../hooks/use-menu-item-resource-queries';
import {
  initialMockCategories,
  initialMockMenuItems,
  sampleFoodImages,
  createBranchTagDefinitions,
  slugifyTagName,
} from '../config/mock-menu';
import { syncMenuItemPrimaryImage } from '../api/menu-item-images-map';
import { isPersistedMenuItemId } from '../lib/menu-item-id';
import { isPersistedMenuItemImageId } from '../lib/menu-item-image-id';
import { isPersistedMenuItemVariantId } from '../lib/menu-item-variant-id';
import { uploadMenuItemImageFlow } from '../lib/upload-menu-item-image-flow';
import {
  activateMenuCategoryViaBff,
  activateMenuItemImageViaBff,
  activateMenuItemVariantViaBff,
  activateMenuItemViaBff,
  clearMenuCache,
  createMenuCategoryViaBff,
  createMenuItemTagViaBff,
  createMenuItemVariantViaBff,
  createMenuItemViaBff,
  deactivateMenuCategoryViaBff,
  deactivateMenuItemImageViaBff,
  deactivateMenuItemVariantViaBff,
  deactivateMenuItemViaBff,
  syncBranchMenuForOutlet,
  updateMenuItemImageViaBff,
  updateMenuItemTagViaBff,
  updateMenuItemVariantViaBff,
  updateMenuItemViaBff,
} from '@/lib/menu-cache';
import type { ModifierGroup } from '@/features/modifier-groups/types/modifier-group';
import type { PreparationStation } from '@/features/preparation-stations/types/preparation-station';
import {
  isBranchOwnedCategory,
  matchesBranchScopeFilter,
  saveBranchDeactivatedCategory,
  usesPersistedMenuItemApi,
} from '../lib/menu-scope';
import { saveMenuCategories, saveMenuItems } from '../lib/menu-store';
import type {
  CreateCategoryInput,
  CreateMenuItemInput,
  ItemImage,
  ItemVariant,
  MenuCategory,
  MenuItem,
  MenuItemTag,
  MenuViewMode,
} from '../types/menu';
import type { MenuItemId } from '../types/menu-item-api';
import type { MenuItemImageId } from '../types/menu-item-image-api';
import type { MenuItemVariantId } from '../types/menu-item-variant-api';

export type CompanyMenuCreationInitialData = Readonly<{
  categories: MenuCategory[];
  categoriesError: string | null;
  items: MenuItem[];
  itemsError: string | null;
  tags: MenuItemTag[];
  tagsError: string | null;
  preparationStations: PreparationStation[];
  preparationStationsError: string | null;
  modifierGroups: ModifierGroup[];
  modifierGroupsError: string | null;
}>;

function withItemImages(item: MenuItem, images: ItemImage[]): MenuItem {
  return syncMenuItemPrimaryImage({ ...item, images });
}

function mergePersistedMenuItem(existing: MenuItem | undefined, next: MenuItem): MenuItem {
  if (!existing) return next;
  return {
    ...existing,
    ...next,
    variants: existing.variants ?? next.variants,
    images: existing.images ?? next.images,
    image: next.image ?? existing.image,
  };
}

function generateSecureTempId(prefix: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefix}_${Date.now()}_${crypto.randomUUID().slice(0, 8)}`;
  }
  return `${prefix}_${Date.now()}_${Date.now().toString(36)}`;
}

const DEFAULT_COMPANY_ID = 'default-company';
const DEFAULT_BRANCH_ID = 'default-branch';
const LEGACY_CATEGORIES_STORAGE_KEY = 'hospixo_branch_menu_categories';
const LEGACY_ITEMS_STORAGE_KEY = 'hospixo_branch_menu_items';

type MenuContextType = {
  pageConfig?: MenuPageConfig;
  categories: MenuCategory[];
  items: MenuItem[];
  activeCategoryId: string | null;
  searchQuery: string;
  currentPage: number;
  pageSize: number;
  filteredItems: MenuItem[];
  paginatedItems: MenuItem[];
  totalPages: number;
  categoryCounts: Record<string, number>;
  totalItemCount: number;
  isHydrated: boolean;
  categoriesLoading: boolean;
  categoriesError: string | null;
  itemsLoading: boolean;
  itemsError: string | null;
  tagDefinitions: MenuItemTag[];
  tagsLoading: boolean;
  tagsError: string | null;
  preparationStations: PreparationStation[];
  modifierGroups: ModifierGroup[];
  catalogsLoading: boolean;

  // Full-page flow (MenuCreationPage)
  viewMode: MenuViewMode;
  selectedItem: MenuItem | null;
  editingItem: MenuItem | null;
  deletingItem: MenuItem | null;
  setViewMode: (mode: MenuViewMode) => void;
  openCreateItemPage: () => void;
  openEditItemPage: (item: MenuItem) => void;
  openViewItemPage: (item: MenuItem) => void;
  openCreateCategoryPage: () => void;
  backToList: () => void;
  closeDeleteModal: () => void;

  // Modal flow
  isAddModalOpen: boolean;
  isAddCategoryModalOpen: boolean;
  openAddModal: () => void;
  openEditModal: (item: MenuItem) => void;
  openAddCategoryModal: () => void;
  closeModals: () => void;

  // Shared actions
  setActiveCategoryId: (id: string | null) => void;
  setSearchQuery: (query: string) => void;
  setCurrentPage: (page: number) => void;
  branchFilterId: string | null;
  setBranchFilterId: (branchId: string | null) => void;
  openDeleteModal: (item: MenuItem) => void;

  addMenuItem: (
    input: CreateMenuItemInput,
  ) => Promise<{ ok: boolean; message?: string; data?: MenuItem }>;
  updateMenuItem: (
    id: string,
    updates: Partial<MenuItem>,
  ) => Promise<{ ok: boolean; message?: string }>;
  activateMenuItemByItemId: (
    itemId: MenuItemId,
  ) => Promise<{ ok: boolean; message?: string; data?: MenuItem }>;
  deactivateMenuItemByItemId: (
    itemId: MenuItemId,
  ) => Promise<{ ok: boolean; message?: string; data?: MenuItem }>;
  deleteMenuItem: (itemId: MenuItemId) => Promise<{ ok: boolean; message?: string }>;
  addCategory: (input: CreateCategoryInput) => Promise<{ ok: boolean; message?: string }>;
  deactivateCategory: (id: string) => Promise<{ ok: boolean; message?: string }>;
  activateCategory: (id: string) => Promise<{ ok: boolean; message?: string }>;

  loadMenuItemVariants: (
    itemId: MenuItemId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemVariant[] }>;
  createMenuItemVariant: (
    itemId: MenuItemId,
    input: Pick<ItemVariant, 'size' | 'price'>,
    displayOrder?: number,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemVariant }>;
  updateMenuItemVariant: (
    itemId: MenuItemId,
    variantId: MenuItemVariantId,
    input: Partial<Pick<ItemVariant, 'size' | 'price'>>,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemVariant }>;
  activateMenuItemVariant: (
    itemId: MenuItemId,
    variantId: MenuItemVariantId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemVariant }>;
  deactivateMenuItemVariant: (
    itemId: MenuItemId,
    variantId: MenuItemVariantId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemVariant }>;

  loadMenuItemImages: (
    itemId: MenuItemId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemImage[] }>;
  uploadMenuItemImage: (
    itemId: MenuItemId,
    file: File,
    options?: { sortOrder?: number; isPrimary?: boolean },
  ) => Promise<{ ok: boolean; message?: string; data?: ItemImage }>;
  setPrimaryMenuItemImage: (
    itemId: MenuItemId,
    imageId: MenuItemImageId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemImage }>;
  activateMenuItemImage: (
    itemId: MenuItemId,
    imageId: MenuItemImageId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemImage }>;
  deactivateMenuItemImage: (
    itemId: MenuItemId,
    imageId: MenuItemImageId,
  ) => Promise<{ ok: boolean; message?: string; data?: ItemImage }>;

  createMenuItemTag: (input: {
    name: string;
    code: string;
  }) => Promise<{ ok: boolean; message?: string; data?: MenuItemTag }>;
  updateMenuItemTag: (
    tagId: string,
    updates: Partial<Pick<MenuItemTag, 'name' | 'code' | 'status'>>,
  ) => Promise<{ ok: boolean; message?: string; data?: MenuItemTag }>;
};

const MenuContext = createContext<MenuContextType | null>(null);

function findFallbackItem(
  itemId: string,
  selectedItem: MenuItem | null,
  editingItem: MenuItem | null,
): MenuItem | undefined {
  if (selectedItem?.id === itemId) return selectedItem;
  if (editingItem?.id === itemId) return editingItem;
  return undefined;
}

function resolveScopeId(
  scope: MenuPageConfig['scope'],
  user: ReturnType<typeof useAuth>['user'],
): string {
  if (scope === 'company') {
    return user?.company_id != null ? String(user.company_id) : DEFAULT_COMPANY_ID;
  }
  return user?.branch_id != null ? String(user.branch_id) : DEFAULT_BRANCH_ID;
}

function shouldUseCategoryApi(pageConfig: MenuPageConfig | undefined): boolean {
  return pageConfig?.scope === 'company' || Boolean(pageConfig?.canManageCategories);
}

function resolveCategoryApiScope(
  input: CreateCategoryInput,
  pageConfig: MenuPageConfig,
): MenuPageConfig['scope'] {
  if (input.scope) return input.scope;
  return pageConfig.scope === 'branch' ? 'branch' : 'company';
}

function resolveCategoryAssignBranchId(
  input: CreateCategoryInput,
  pageConfig: MenuPageConfig,
  user: ReturnType<typeof useAuth>['user'],
  apiScope: MenuPageConfig['scope'],
): number | null {
  if (input.assignBranchId != null && input.assignBranchId !== '') {
    return Number(input.assignBranchId);
  }
  if (apiScope === 'branch') {
    return user?.branch_id ?? null;
  }
  if (input.scope === 'branch' && user?.branch_id != null) {
    return user.branch_id;
  }
  if (pageConfig.scope === 'branch' && user?.branch_id != null) {
    return user.branch_id;
  }
  return null;
}

export function MenuProvider({
  children,
  pageConfig,
  initialData,
}: Readonly<{
  children: ReactNode;
  pageConfig?: MenuPageConfig;
  initialData?: CompanyMenuCreationInitialData;
}>) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const invalidateMenuManagementQueries = useInvalidateMenuManagementQueries();
  const menuItemResources = useMenuItemResourceQueries();
  const scopeId = pageConfig ? resolveScopeId(pageConfig.scope, user) : DEFAULT_BRANCH_ID;
  const hasServerBootstrap = pageConfig != null && initialData !== undefined;
  const usesPageFlow = pageConfig != null;
  const usesApiCatalog = pageConfig?.scope === 'company' || pageConfig?.scope === 'branch';
  const dashboardFilter = useOptionalDashboardFilter();
  const activeDashboardBranchId =
    dashboardFilter?.activeBranchId && dashboardFilter.activeBranchId !== 'all'
      ? String(dashboardFilter.activeBranchId)
      : null;

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [branchFilterId, setBranchFilterId] = useState<string | null>(null);

  const resolvedBranchId = useMemo(() => {
    if (user?.branch_id != null) return String(user.branch_id);
    if (activeDashboardBranchId) return activeDashboardBranchId;
    if (branchFilterId) return branchFilterId;
    if (typeof window !== 'undefined') {
      try {
        const search = new URLSearchParams(window.location.search);
        const outlet = search.get('outlet') ?? search.get('branch_id');
        if (outlet && outlet !== 'all' && !isMockDashboardOutletId(outlet)) {
          return outlet;
        }
      } catch {
        // ignore
      }
    }
    return null;
  }, [user?.branch_id, activeDashboardBranchId, branchFilterId]);

  const userBranchId = resolvedBranchId;

  const persistedMenuItemBffOptions = useMemo(
    () =>
      pageConfig?.scope === 'branch' && resolvedBranchId
        ? ({ branchUserBranchId: resolvedBranchId } as const)
        : ({} as const),
    [pageConfig?.scope, resolvedBranchId],
  );

  const catalog = useMenuCatalogQueries({
    scope: pageConfig?.scope,
    enabled: usesApiCatalog,
    branchFilterId,
    userBranchId: resolvedBranchId,
    initialData,
    skipInitialFetch: hasServerBootstrap && pageConfig?.scope === 'company',
  });

  const refreshMenuCatalog = useCallback(
    async (itemId?: string) => {
      clearMenuCache();
      await invalidateMenuManagementQueries();
      await queryClient.invalidateQueries({ queryKey: ['menu', 'branches'] });
      await queryClient.invalidateQueries({ queryKey: ['menu', 'branch-menus'] });
      await queryClient.invalidateQueries({ queryKey: ['branch-menu-availability'] });
      if (itemId) {
        await queryClient.invalidateQueries({ queryKey: menuItemVariantsQueryKey(itemId) });
        await queryClient.invalidateQueries({ queryKey: menuItemImagesQueryKey(itemId) });
      }
    },
    [invalidateMenuManagementQueries, queryClient],
  );

  const initialCategories = usesApiCatalog
    ? []
    : (initialData?.categories ?? initialMockCategories);
  const initialItems = usesApiCatalog ? [] : (initialData?.items ?? initialMockMenuItems);
  const initialTags = usesApiCatalog ? [] : (initialData?.tags ?? createBranchTagDefinitions());

  const [legacyCategories, setLegacyCategories] = useState<MenuCategory[]>(initialCategories);
  const [legacyItems, setLegacyItems] = useState<MenuItem[]>(initialItems);
  const [legacyTagDefinitions, setLegacyTagDefinitions] = useState<MenuItemTag[]>(initialTags);
  const [legacyPreparationStations] = useState<PreparationStation[]>(
    hasServerBootstrap ? (initialData?.preparationStations ?? []) : [],
  );
  const [legacyModifierGroups] = useState<ModifierGroup[]>(
    hasServerBootstrap ? (initialData?.modifierGroups ?? []) : [],
  );
  const [legacyHydrated, setLegacyHydrated] = useState(!usesApiCatalog);

  const categories = usesApiCatalog ? catalog.categories : legacyCategories;
  const items = usesApiCatalog ? catalog.items : legacyItems;
  const tagDefinitions = usesApiCatalog ? catalog.tagDefinitions : legacyTagDefinitions;
  const preparationStations = usesApiCatalog
    ? catalog.preparationStations
    : legacyPreparationStations;
  const modifierGroups = usesApiCatalog ? catalog.modifierGroups : legacyModifierGroups;
  const categoriesLoading = usesApiCatalog ? catalog.categoriesLoading : false;
  const categoriesError = usesApiCatalog ? catalog.categoriesError : null;
  const itemsLoading = usesApiCatalog ? catalog.itemsLoading : false;
  const itemsError = usesApiCatalog ? catalog.itemsError : null;
  const tagsLoading = usesApiCatalog ? catalog.tagsLoading : false;
  const tagsError = usesApiCatalog ? catalog.tagsError : null;
  const catalogsLoading = usesApiCatalog ? catalog.catalogsLoading : false;
  const isHydrated = usesApiCatalog ? catalog.isHydrated : legacyHydrated;

  const itemsRef = useRef(items);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  const patchMenuItemInCatalogCache = useCallback(
    (itemId: string, patch: (item: MenuItem) => MenuItem) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuItem[]>(menuItemsQueryKey, (prev) =>
          prev?.map((item) => (item.id === itemId ? patch(item) : item)),
        );
      }
      setLegacyItems((prev) => prev.map((item) => (item.id === itemId ? patch(item) : item)));
    },
    [queryClient, usesApiCatalog],
  );

  const addMenuItemToCatalogCache = useCallback(
    (newItem: MenuItem) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuItem[]>(menuItemsQueryKey, (prev) =>
          prev ? [newItem, ...prev.filter((i) => i.id !== newItem.id)] : [newItem],
        );
      }
      setLegacyItems((prev) => [newItem, ...prev.filter((i) => i.id !== newItem.id)]);
    },
    [queryClient, usesApiCatalog],
  );

  const removeMenuItemFromCatalogCache = useCallback(
    (itemId: string) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuItem[]>(menuItemsQueryKey, (prev) =>
          prev?.filter((item) => item.id !== itemId),
        );
      }
      setLegacyItems((prev) => prev.filter((item) => item.id !== itemId));
    },
    [queryClient, usesApiCatalog],
  );

  const patchMenuCategoryInCatalogCache = useCallback(
    (categoryId: string, patch: (cat: MenuCategory) => MenuCategory) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuCategory[]>(menuCategoriesQueryKey, (prev) =>
          prev?.map((cat) => (cat.id === categoryId ? patch(cat) : cat)),
        );
      }
      setLegacyCategories((prev) => prev.map((cat) => (cat.id === categoryId ? patch(cat) : cat)));
    },
    [queryClient, usesApiCatalog],
  );

  const addMenuCategoryToCatalogCache = useCallback(
    (newCat: MenuCategory) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuCategory[]>(menuCategoriesQueryKey, (prev) =>
          prev ? [...prev.filter((c) => c.id !== newCat.id), newCat] : [newCat],
        );
      }
      setLegacyCategories((prev) => [...prev.filter((c) => c.id !== newCat.id), newCat]);
    },
    [queryClient, usesApiCatalog],
  );

  const removeMenuCategoryFromCatalogCache = useCallback(
    (categoryId: string) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuCategory[]>(menuCategoriesQueryKey, (prev) =>
          prev?.filter((c) => c.id !== categoryId),
        );
      }
      setLegacyCategories((prev) => prev.filter((c) => c.id !== categoryId));
    },
    [queryClient, usesApiCatalog],
  );

  const addMenuItemTagToCatalogCache = useCallback(
    (newTag: MenuItemTag) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuItemTag[]>(menuItemTagsQueryKey, (prev) => {
          if (!prev) return [newTag];
          const exists = prev.some((t) => t.id === newTag.id || t.code === newTag.code);
          return exists ? prev : [...prev, newTag];
        });
      }
      setLegacyTagDefinitions((prev) => {
        const exists = prev.some((t) => t.id === newTag.id || t.code === newTag.code);
        return exists ? prev : [...prev, newTag];
      });
    },
    [queryClient, usesApiCatalog],
  );

  const patchMenuItemTagInCatalogCache = useCallback(
    (tagId: string, patch: (tag: MenuItemTag) => MenuItemTag) => {
      if (usesApiCatalog) {
        queryClient.setQueryData<MenuItemTag[]>(menuItemTagsQueryKey, (prev) =>
          prev?.map((tag) => (tag.id === tagId ? patch(tag) : tag)),
        );
      }
      setLegacyTagDefinitions((prev) => prev.map((tag) => (tag.id === tagId ? patch(tag) : tag)));
    },
    [queryClient, usesApiCatalog],
  );

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);

  const [viewMode, setViewMode] = useState<MenuViewMode>('list');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [deletingItem, setDeletingItem] = useState<MenuItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAddCategoryModalOpen, setIsAddCategoryModalOpen] = useState(false);

  useEffect(() => {
    if (usesApiCatalog) return;

    queueMicrotask(() => {
      try {
        const storedCats = localStorage.getItem(LEGACY_CATEGORIES_STORAGE_KEY);
        if (storedCats) {
          const parsed = JSON.parse(storedCats);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLegacyCategories(parsed);
          }
        }

        const storedItems = localStorage.getItem(LEGACY_ITEMS_STORAGE_KEY);
        if (storedItems) {
          const parsed = JSON.parse(storedItems);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setLegacyItems(parsed);
          }
        }
      } catch {
        // ignore JSON parse errors
      }

      setLegacyHydrated(true);
    });
  }, [usesApiCatalog]);

  useEffect(() => {
    if (!isHydrated || usesApiCatalog) return;

    if (pageConfig) {
      saveMenuCategories(pageConfig.scope, scopeId, categories);
      saveMenuItems(pageConfig.scope, scopeId, items);
      return;
    }

    try {
      localStorage.setItem(LEGACY_CATEGORIES_STORAGE_KEY, JSON.stringify(categories));
      localStorage.setItem(LEGACY_ITEMS_STORAGE_KEY, JSON.stringify(items));
    } catch {
      // ignore storage quota errors
    }
  }, [categories, isHydrated, items, pageConfig, scopeId, usesApiCatalog]);

  const scopedItems = useMemo(() => {
    if (pageConfig?.scope !== 'company' || !branchFilterId) return items;
    return items.filter((item) => matchesBranchScopeFilter(item, branchFilterId));
  }, [branchFilterId, items, pageConfig?.scope]);

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    for (const cat of categories) {
      counts[cat.id] = scopedItems.filter((item) => item.categoryId === cat.id).length;
    }
    return counts;
  }, [categories, scopedItems]);

  const filteredItems = useMemo(() => {
    return scopedItems.filter((item) => {
      if (activeCategoryId && item.categoryId !== activeCategoryId) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchName = item.name.toLowerCase().includes(q);
        const matchCategory = item.categoryName.toLowerCase().includes(q);
        const matchDietary = item.dietary.toLowerCase().includes(q);
        const matchCode = item.code?.toLowerCase().includes(q) ?? false;
        if (!matchName && !matchCategory && !matchDietary && !matchCode) {
          return false;
        }
      }
      return true;
    });
  }, [scopedItems, activeCategoryId, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredItems.length / pageSize));

  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredItems.slice(start, start + pageSize);
  }, [filteredItems, currentPage, pageSize]);

  const handleCategorySelect = useCallback((id: string | null) => {
    setActiveCategoryId(id);
    setCurrentPage(1);
    setViewMode('list');
  }, []);

  const handleSearchChange = useCallback((query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  }, []);

  const openCreateItemPage = useCallback(() => {
    setEditingItem(null);
    setViewMode('create-item');
  }, []);

  const openEditItemPage = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setViewMode('edit-item');
  }, []);

  const openViewItemPage = useCallback((item: MenuItem) => {
    setSelectedItem(item);
    setViewMode('view-item');
  }, []);

  const openCreateCategoryPage = useCallback(() => {
    if (pageConfig && !pageConfig.canManageCategories) return;
    setViewMode('create-category');
  }, [pageConfig]);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedItem(null);
    setEditingItem(null);
  }, []);

  const openAddModal = useCallback(() => {
    setEditingItem(null);
    setIsAddModalOpen(true);
  }, []);

  const openEditModal = useCallback((item: MenuItem) => {
    setEditingItem(item);
    setIsAddModalOpen(true);
  }, []);

  const openDeleteModal = useCallback((item: MenuItem) => {
    setDeletingItem(item);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setDeletingItem(null);
  }, []);

  const openAddCategoryModal = useCallback(() => {
    setIsAddCategoryModalOpen(true);
  }, []);

  const closeModals = useCallback(() => {
    setIsAddModalOpen(false);
    setEditingItem(null);
    setDeletingItem(null);
    setIsAddCategoryModalOpen(false);
  }, []);

  const addMenuItem = useCallback(
    async (input: CreateMenuItemInput) => {
      const matchedCat = categories.find((c) => c.id === input.categoryId);
      const tempId = generateSecureTempId('temp_item');

      const optimisticItem: MenuItem = {
        id: tempId,
        name: input.name.trim(),
        categoryId: input.categoryId,
        categoryName: matchedCat ? matchedCat.name : 'General',
        onlineDisplayName: input.onlineDisplayName?.trim() || input.name.trim(),
        code: input.code?.trim() ?? '',
        basePrice: input.basePrice,
        profitMargin: input.profitMargin?.trim() || '10%',
        gst: input.gst?.trim() ?? '',
        dietary: input.dietary,
        orderTypes:
          input.orderTypes.length > 0 ? input.orderTypes : ['Delivery', 'Take Away', 'Dine In'],
        exposeIn: input.exposeIn || ['Captain App'],
        tags: input.tags || ['chef-special'],
        tagIds: input.tagIds,
        variants: (() => {
          if (input.variants && input.variants.length > 0) return input.variants;
          if (usesPageFlow) {
            return [
              {
                id: 'v1',
                size: 'Mini',
                price: Math.round(input.basePrice * 0.7),
                status: 'Active',
              },
              { id: 'v2', size: 'Single', price: input.basePrice, status: 'Active' },
              {
                id: 'v3',
                size: 'Double',
                price: Math.round(input.basePrice * 1.6),
                status: 'Active',
              },
              {
                id: 'v4',
                size: 'Family Pack',
                price: Math.round(input.basePrice * 2.4),
                status: 'Active',
              },
            ];
          }
          return undefined;
        })(),
        modifiers: (() => {
          if (input.modifiers && input.modifiers.length > 0) return input.modifiers;
          if (usesPageFlow) {
            return [
              { id: 'm1', name: 'Extra Roti', price: 10 },
              { id: 'm2', name: 'Extra Gravy', price: 50 },
            ];
          }
          return undefined;
        })(),
        image: input.image || input.images?.[0]?.url || sampleFoodImages[0]?.url,
        images: input.images,
        description: input.description,
        status: 'Available',
        scope: input.scope ?? 'company',
        assignBranchId: input.assignBranchId ?? undefined,
        createdAt: new Date().toISOString(),
      };

      addMenuItemToCatalogCache(optimisticItem);
      if (!usesPageFlow) {
        closeModals();
      }

      if (usesApiCatalog) {
        try {
          const scopedInput: CreateMenuItemInput =
            pageConfig?.scope === 'branch' && userBranchId
              ? {
                  ...input,
                  scope: 'branch',
                  assignBranchId: input.assignBranchId ?? userBranchId,
                }
              : input;
          const result = await createMenuItemViaBff(scopedInput, {
            categoryName: matchedCat?.name ?? 'General',
            tagDefinitions,
          });
          if (!result.ok) {
            removeMenuItemFromCatalogCache(tempId);
            return { ok: false, message: result.message };
          }

          let savedItem = result.data;
          const pendingVariants = input.variants ?? [];

          if (pendingVariants.length > 0 && isPersistedMenuItemId(savedItem.id)) {
            const variantResults = await Promise.allSettled(
              pendingVariants.map((variant, index) =>
                createMenuItemVariantViaBff(
                  savedItem.id,
                  {
                    size: variant.size,
                    price: variant.price,
                    displayOrder: index,
                    isDefault: index === 0,
                  },
                  `create-item-${savedItem.id}-variant-${index}`,
                ),
              ),
            );
            const createdVariants: ItemVariant[] = [];
            for (const r of variantResults) {
              if (r.status === 'fulfilled' && r.value.ok) {
                createdVariants.push(r.value.data);
              }
            }
            savedItem = {
              ...savedItem,
              variants: createdVariants.length > 0 ? createdVariants : pendingVariants,
            };
          } else if (pendingVariants.length > 0) {
            savedItem = { ...savedItem, variants: pendingVariants };
          }

          savedItem = {
            ...savedItem,
            scope: input.scope ?? 'company',
            assignBranchId: input.assignBranchId ?? undefined,
            images: input.images ?? savedItem.images,
            image: input.image ?? savedItem.image,
          };

          if (input.scope === 'branch' && input.assignBranchId) {
            void syncBranchMenuForOutlet(input.assignBranchId).catch(() => {});
          }

          const imageFiles = input.imageFiles ?? [];
          if (imageFiles.length > 0 && isPersistedMenuItemId(savedItem.id)) {
            const uploadPromises = imageFiles.map((file, index) =>
              uploadMenuItemImageFlow(savedItem.id, file, {
                sortOrder: index,
                isPrimary: index === 0,
              }).catch(() => null),
            );
            const uploaded = (await Promise.all(uploadPromises)).filter(Boolean) as ItemImage[];
            if (uploaded.length > 0) {
              savedItem = {
                ...savedItem,
                images: uploaded,
                image: uploaded[0]?.url ?? savedItem.image,
              };
            }
          }

          patchMenuItemInCatalogCache(tempId, () => savedItem);
          await refreshMenuCatalog();
          if (usesPageFlow) {
            setViewMode('list');
          }
          return { ok: true, data: savedItem };
        } catch (error) {
          removeMenuItemFromCatalogCache(tempId);
          const message = error instanceof Error ? error.message : 'Failed to create menu item.';
          return { ok: false, message };
        }
      }

      if (usesPageFlow) {
        setViewMode('list');
      }
      return { ok: true, data: optimisticItem };
    },
    [
      addMenuItemToCatalogCache,
      categories,
      closeModals,
      pageConfig,
      patchMenuItemInCatalogCache,
      refreshMenuCatalog,
      removeMenuItemFromCatalogCache,
      tagDefinitions,
      userBranchId,
      usesApiCatalog,
      usesPageFlow,
    ],
  );

  const normalizeBranchItemUpdates = useCallback(
    (updates: Partial<CreateMenuItemInput>): Partial<CreateMenuItemInput> => {
      if (pageConfig?.scope !== 'branch' || !resolvedBranchId) return updates;
      return {
        ...updates,
        scope: updates.scope ?? 'branch',
        assignBranchId: updates.assignBranchId ?? resolvedBranchId,
      };
    },
    [pageConfig?.scope, resolvedBranchId],
  );

  const updateMenuItem = useCallback(
    async (id: string, updates: Partial<MenuItem>) => {
      const existingItem =
        itemsRef.current.find((item) => item.id === id) ??
        (editingItem?.id === id ? editingItem : undefined);
      if (!existingItem) {
        return { ok: false, message: 'Menu item not found.' };
      }

      const updatedCat = updates.categoryId
        ? categories.find((c) => c.id === updates.categoryId)
        : undefined;

      const optimisticUpdatedItem: MenuItem = {
        ...existingItem,
        ...updates,
        categoryName: updatedCat
          ? updatedCat.name
          : (updates.categoryName ?? existingItem.categoryName),
        images: updates.images ?? existingItem.images,
        image: updates.image ?? existingItem.image,
        variants: updates.variants ?? existingItem.variants,
      };

      patchMenuItemInCatalogCache(id, () => optimisticUpdatedItem);
      if (selectedItem?.id === id) {
        setSelectedItem(optimisticUpdatedItem);
      }
      if (!usesPageFlow) {
        closeModals();
      }

      if (
        pageConfig?.scope === 'company' ||
        (pageConfig?.scope === 'branch' && isPersistedMenuItemId(id))
      ) {
        try {
          const patchInput: Partial<CreateMenuItemInput> & { status?: MenuItem['status'] } = {
            ...normalizeBranchItemUpdates({
              name: updates.name,
              categoryId: updates.categoryId,
              onlineDisplayName: updates.onlineDisplayName,
              code: updates.code,
              basePrice: updates.basePrice,
              profitMargin: updates.profitMargin,
              gst: updates.gst,
              gstRateId: updates.gstRateId,
              description: updates.description,
              dietary: updates.dietary,
              orderTypes: updates.orderTypes,
              exposeIn: updates.exposeIn,
              tags: updates.tags,
              tagIds: updates.tagIds,
              modifiers: updates.modifiers,
              preparationStations: updates.preparationStations,
              modifierGroups: updates.modifierGroups,
              image: updates.image,
              scope: updates.scope,
              assignBranchId: updates.assignBranchId,
            }),
            ...(updates.status !== undefined ? { status: updates.status } : {}),
          };
          const result = await updateMenuItemViaBff(id, patchInput, existingItem, {
            categoryName: updatedCat?.name ?? existingItem.categoryName,
            tagDefinitions,
            ...persistedMenuItemBffOptions,
          });

          if (!result.ok) {
            patchMenuItemInCatalogCache(id, () => existingItem);
            if (selectedItem?.id === id) {
              setSelectedItem(existingItem);
            }
            return { ok: false, message: result.message };
          }

          if (
            updates.scope === 'branch' &&
            updates.assignBranchId &&
            (existingItem.scope !== 'branch' ||
              existingItem.assignBranchId !== updates.assignBranchId)
          ) {
            void syncBranchMenuForOutlet(updates.assignBranchId).catch(() => {});
          }

          const mergedUpdatedItem: MenuItem = {
            ...optimisticUpdatedItem,
            ...result.data,
            status: updates.status ?? result.data.status ?? existingItem.status,
            images: updates.images ?? existingItem.images ?? result.data.images,
            image: updates.image ?? result.data.image ?? existingItem.image,
            variants: updates.variants ?? existingItem.variants ?? result.data.variants,
          };

          patchMenuItemInCatalogCache(id, () => mergedUpdatedItem);
          if (selectedItem?.id === id) {
            setSelectedItem(mergedUpdatedItem);
          }
          await refreshMenuCatalog();
          if (usesPageFlow) {
            setViewMode('list');
          }
          return { ok: true };
        } catch (error) {
          patchMenuItemInCatalogCache(id, () => existingItem);
          if (selectedItem?.id === id) {
            setSelectedItem(existingItem);
          }
          const message = error instanceof Error ? error.message : 'Failed to update menu item.';
          return { ok: false, message };
        }
      }

      if (usesPageFlow) {
        setViewMode('list');
      }
      return { ok: true };
    },
    [
      categories,
      closeModals,
      editingItem,
      normalizeBranchItemUpdates,
      pageConfig,
      patchMenuItemInCatalogCache,
      persistedMenuItemBffOptions,
      refreshMenuCatalog,
      selectedItem,
      tagDefinitions,
      usesPageFlow,
    ],
  );

  const deactivateMenuItemByItemId = useCallback(
    async (itemId: MenuItemId) => {
      const existingItem =
        itemsRef.current.find((item) => item.id === itemId) ??
        findFallbackItem(itemId, selectedItem, editingItem);
      const previousStatus = existingItem?.status ?? 'Available';

      patchMenuItemInCatalogCache(itemId, (item) => ({ ...item, status: 'Hidden' as const }));
      if (selectedItem?.id === itemId) {
        setSelectedItem((prev) => (prev ? { ...prev, status: 'Hidden' } : null));
      }
      if (editingItem?.id === itemId) {
        setEditingItem((prev) => (prev ? { ...prev, status: 'Hidden' } : null));
      }

      if (
        pageConfig?.scope === 'company' ||
        (pageConfig?.scope === 'branch' && isPersistedMenuItemId(itemId))
      ) {
        const result = await deactivateMenuItemViaBff(itemId, existingItem, {
          categoryName: existingItem?.categoryName ?? '',
          tagDefinitions,
          ...persistedMenuItemBffOptions,
        });
        if (!result.ok) {
          patchMenuItemInCatalogCache(
            itemId,
            (item) => existingItem ?? { ...item, status: previousStatus },
          );
          if (selectedItem?.id === itemId) {
            setSelectedItem((prev) =>
              prev ? (existingItem ?? { ...prev, status: previousStatus }) : null,
            );
          }
          if (editingItem?.id === itemId) {
            setEditingItem((prev) =>
              prev ? (existingItem ?? { ...prev, status: previousStatus }) : null,
            );
          }
          return { ok: false, message: result.message };
        }

        const next: MenuItem = {
          ...mergePersistedMenuItem(existingItem, result.data),
          status: 'Hidden',
        };
        patchMenuItemInCatalogCache(itemId, () => next);
        if (selectedItem?.id === itemId) setSelectedItem(next);
        if (editingItem?.id === itemId) setEditingItem(next);
        await refreshMenuCatalog();
        return { ok: true, data: next };
      }

      return {
        ok: true,
        data: existingItem ? { ...existingItem, status: 'Hidden' as const } : undefined,
      };
    },
    [
      editingItem,
      pageConfig?.scope,
      patchMenuItemInCatalogCache,
      persistedMenuItemBffOptions,
      refreshMenuCatalog,
      selectedItem,
      tagDefinitions,
    ],
  );

  const activateMenuItemByItemId = useCallback(
    async (itemId: MenuItemId) => {
      const existingItem =
        itemsRef.current.find((item) => item.id === itemId) ??
        findFallbackItem(itemId, selectedItem, editingItem);
      const previousStatus = existingItem?.status ?? 'Hidden';

      patchMenuItemInCatalogCache(itemId, (item) => ({ ...item, status: 'Available' as const }));
      if (selectedItem?.id === itemId) {
        setSelectedItem((prev) => (prev ? { ...prev, status: 'Available' } : null));
      }
      if (editingItem?.id === itemId) {
        setEditingItem((prev) => (prev ? { ...prev, status: 'Available' } : null));
      }

      if (
        pageConfig?.scope === 'company' ||
        (pageConfig?.scope === 'branch' && isPersistedMenuItemId(itemId))
      ) {
        const result = await activateMenuItemViaBff(itemId, existingItem, {
          categoryName: existingItem?.categoryName ?? '',
          tagDefinitions,
          ...persistedMenuItemBffOptions,
        });
        if (!result.ok) {
          patchMenuItemInCatalogCache(
            itemId,
            (item) => existingItem ?? { ...item, status: previousStatus },
          );
          if (selectedItem?.id === itemId) {
            setSelectedItem((prev) =>
              prev ? (existingItem ?? { ...prev, status: previousStatus }) : null,
            );
          }
          if (editingItem?.id === itemId) {
            setEditingItem((prev) =>
              prev ? (existingItem ?? { ...prev, status: previousStatus }) : null,
            );
          }
          return { ok: false, message: result.message };
        }

        const next: MenuItem = {
          ...mergePersistedMenuItem(existingItem, result.data),
          status: 'Available',
        };
        patchMenuItemInCatalogCache(itemId, () => next);
        if (selectedItem?.id === itemId) setSelectedItem(next);
        if (editingItem?.id === itemId) setEditingItem(next);
        await refreshMenuCatalog();
        return { ok: true, data: next };
      }

      return {
        ok: true,
        data: existingItem ? { ...existingItem, status: 'Available' as const } : undefined,
      };
    },
    [
      editingItem,
      pageConfig?.scope,
      patchMenuItemInCatalogCache,
      persistedMenuItemBffOptions,
      refreshMenuCatalog,
      selectedItem,
      tagDefinitions,
    ],
  );

  const deleteMenuItem = useCallback(
    async (itemId: MenuItemId) => {
      const existingItem = items.find((item) => item.id === itemId);

      if (usesPersistedMenuItemApi(pageConfig?.scope) && isPersistedMenuItemId(itemId)) {
        const result = await deactivateMenuItemViaBff(itemId, existingItem, {
          categoryName: existingItem?.categoryName ?? '',
          tagDefinitions,
          ...persistedMenuItemBffOptions,
        });
        if (!result.ok) {
          return { ok: false, message: result.message };
        }
      }

      removeMenuItemFromCatalogCache(itemId);
      setDeletingItem(null);
      if (selectedItem?.id === itemId) {
        setSelectedItem(null);
        setViewMode('list');
      }
      if (!usesPageFlow) {
        closeModals();
      }
      await refreshMenuCatalog();
      return { ok: true };
    },
    [
      closeModals,
      items,
      pageConfig,
      persistedMenuItemBffOptions,
      refreshMenuCatalog,
      removeMenuItemFromCatalogCache,
      selectedItem?.id,
      tagDefinitions,
      usesPageFlow,
    ],
  );

  const addCategory = useCallback(
    async (input: CreateCategoryInput) => {
      const tempId = generateSecureTempId('temp_cat');
      const optimisticCat: MenuCategory = {
        id: tempId,
        name: input.name.trim(),
        parentId: input.parentId || undefined,
        status: input.status || 'Active',
        description: input.description?.trim(),
        displayOrder: categories.length + 1,
        scope: input.scope,
        assignBranchId: input.assignBranchId,
      };

      addMenuCategoryToCatalogCache(optimisticCat);
      setActiveCategoryId(tempId);

      if (usesPageFlow) {
        setViewMode('list');
      } else {
        closeModals();
      }

      if (pageConfig && shouldUseCategoryApi(pageConfig)) {
        const apiScope = resolveCategoryApiScope(input, pageConfig);
        const assignBranchId = resolveCategoryAssignBranchId(input, pageConfig, user, apiScope);

        try {
          const result = await createMenuCategoryViaBff(
            {
              ...input,
              scope: apiScope,
              assignBranchId: assignBranchId != null ? String(assignBranchId) : undefined,
            },
            {
              scope: apiScope,
              assignBranchId,
            },
          );
          if (!result.ok) {
            removeMenuCategoryFromCatalogCache(tempId);
            return { ok: false, message: result.message };
          }

          patchMenuCategoryInCatalogCache(tempId, () => result.data);
          setActiveCategoryId((prev) => (prev === tempId ? result.data.id : prev));
          await refreshMenuCatalog();
          return { ok: true };
        } catch (error) {
          removeMenuCategoryFromCatalogCache(tempId);
          const message = error instanceof Error ? error.message : 'Failed to create category.';
          return { ok: false, message };
        }
      }

      return { ok: true };
    },
    [
      addMenuCategoryToCatalogCache,
      categories.length,
      closeModals,
      pageConfig,
      patchMenuCategoryInCatalogCache,
      refreshMenuCatalog,
      removeMenuCategoryFromCatalogCache,
      usesPageFlow,
      user,
    ],
  );

  const deactivateCategory = useCallback(
    async (id: string) => {
      const existingCategory = categories.find((c) => c.id === id);
      const isInherited =
        pageConfig?.scope === 'branch' &&
        (!existingCategory ||
          !resolvedBranchId ||
          !isBranchOwnedCategory(existingCategory, resolvedBranchId));

      if (isInherited) {
        if (resolvedBranchId) {
          saveBranchDeactivatedCategory(resolvedBranchId, id, true);
        }
        patchMenuCategoryInCatalogCache(id, (category) => ({
          ...category,
          status: 'Inactive',
        }));
        if (activeCategoryId === id) {
          setActiveCategoryId(null);
        }
        return { ok: true };
      }

      if (!pageConfig || !shouldUseCategoryApi(pageConfig)) {
        patchMenuCategoryInCatalogCache(id, (category) => ({
          ...category,
          status: 'Inactive',
        }));
        if (activeCategoryId === id) {
          setActiveCategoryId(null);
        }
        return { ok: true };
      }

      const result = await deactivateMenuCategoryViaBff(id);
      if (!result.ok) {
        if (pageConfig?.scope === 'branch') {
          if (resolvedBranchId) {
            saveBranchDeactivatedCategory(resolvedBranchId, id, true);
          }
          patchMenuCategoryInCatalogCache(id, (category) => ({
            ...category,
            status: 'Inactive',
          }));
          if (activeCategoryId === id) {
            setActiveCategoryId(null);
          }
          return { ok: true };
        }
        return { ok: false, message: result.message };
      }

      patchMenuCategoryInCatalogCache(id, () => result.data);
      if (activeCategoryId === id) {
        setActiveCategoryId(null);
      }
      await refreshMenuCatalog();
      return { ok: true };
    },
    [
      activeCategoryId,
      categories,
      pageConfig,
      patchMenuCategoryInCatalogCache,
      refreshMenuCatalog,
      resolvedBranchId,
    ],
  );

  const activateCategory = useCallback(
    async (id: string) => {
      const existingCategory = categories.find((c) => c.id === id);
      const isInherited =
        pageConfig?.scope === 'branch' &&
        (!existingCategory ||
          !resolvedBranchId ||
          !isBranchOwnedCategory(existingCategory, resolvedBranchId));

      if (isInherited) {
        if (resolvedBranchId) {
          saveBranchDeactivatedCategory(resolvedBranchId, id, false);
        }
        patchMenuCategoryInCatalogCache(id, (category) => ({
          ...category,
          status: 'Active',
        }));
        return { ok: true };
      }

      if (!pageConfig || !shouldUseCategoryApi(pageConfig)) {
        patchMenuCategoryInCatalogCache(id, (category) => ({
          ...category,
          status: 'Active',
        }));
        return { ok: true };
      }

      const result = await activateMenuCategoryViaBff(id);
      if (!result.ok) {
        if (pageConfig?.scope === 'branch') {
          if (resolvedBranchId) {
            saveBranchDeactivatedCategory(resolvedBranchId, id, false);
          }
          patchMenuCategoryInCatalogCache(id, (category) => ({
            ...category,
            status: 'Active',
          }));
          return { ok: true };
        }
        return { ok: false, message: result.message };
      }

      patchMenuCategoryInCatalogCache(id, () => result.data);
      await refreshMenuCatalog();
      return { ok: true };
    },
    [categories, pageConfig, patchMenuCategoryInCatalogCache, refreshMenuCatalog, resolvedBranchId],
  );

  const loadMenuItemVariants = useCallback(
    async (itemId: MenuItemId) => {
      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemId(itemId)) {
        const item = itemsRef.current.find((entry) => entry.id === itemId);
        return { ok: true, data: item?.variants ?? [] };
      }

      const result = await menuItemResources.loadMenuItemVariants(itemId);
      if (!result.ok || !result.data) {
        return result;
      }

      const variantsData = result.data;
      patchMenuItemInCatalogCache(itemId, (item) => ({ ...item, variants: variantsData }));
      setEditingItem((prev) => (prev?.id === itemId ? { ...prev, variants: variantsData } : prev));
      setSelectedItem((prev) => (prev?.id === itemId ? { ...prev, variants: variantsData } : prev));

      return { ok: true, data: variantsData };
    },
    [menuItemResources, pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const createMenuItemVariant = useCallback(
    async (itemId: MenuItemId, input: Pick<ItemVariant, 'size' | 'price'>, displayOrder = 0) => {
      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemId(itemId)) {
        const localVariant: ItemVariant = {
          id: `v_${Date.now()}`,
          size: input.size,
          price: input.price,
          status: 'Active',
        };
        return { ok: true, data: localVariant };
      }

      const result = await createMenuItemVariantViaBff(
        itemId,
        {
          size: input.size,
          price: input.price,
          displayOrder,
          isDefault: displayOrder === 0,
        },
        `create-variant-${itemId}-${Date.now()}`,
      );

      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) => ({
        ...item,
        status: 'Available',
        variants: [...(item.variants ?? []), result.data],
      }));

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const deactivateMenuItemVariant = useCallback(
    async (itemId: MenuItemId, variantId: MenuItemVariantId) => {
      if (
        !usesPersistedMenuItemApi(pageConfig?.scope) ||
        !isPersistedMenuItemVariantId(variantId)
      ) {
        return { ok: true };
      }

      const result = await deactivateMenuItemVariantViaBff(itemId, variantId);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) => ({
        ...item,
        variants: (item.variants ?? []).map((variant) =>
          variant.id === variantId ? result.data : variant,
        ),
      }));

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const updateMenuItemVariant = useCallback(
    async (
      itemId: MenuItemId,
      variantId: MenuItemVariantId,
      input: Partial<Pick<ItemVariant, 'size' | 'price'>>,
    ) => {
      if (
        !usesPersistedMenuItemApi(pageConfig?.scope) ||
        !isPersistedMenuItemVariantId(variantId)
      ) {
        const updated: ItemVariant = {
          id: variantId,
          size: input.size ?? '',
          price: input.price ?? 0,
          status: 'Active',
        };
        return { ok: true, data: updated };
      }

      const result = await updateMenuItemVariantViaBff(itemId, variantId, input);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) => ({
        ...item,
        variants: (item.variants ?? []).map((variant) =>
          variant.id === variantId ? result.data : variant,
        ),
      }));

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const activateMenuItemVariant = useCallback(
    async (itemId: MenuItemId, variantId: MenuItemVariantId) => {
      if (
        !usesPersistedMenuItemApi(pageConfig?.scope) ||
        !isPersistedMenuItemVariantId(variantId)
      ) {
        return { ok: true };
      }

      const result = await activateMenuItemVariantViaBff(itemId, variantId);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) => ({
        ...item,
        variants: (item.variants ?? []).map((variant) =>
          variant.id === variantId ? result.data : variant,
        ),
      }));

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const loadMenuItemImages = useCallback(
    async (itemId: MenuItemId) => {
      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemId(itemId)) {
        const item = itemsRef.current.find((entry) => entry.id === itemId);
        return { ok: true, data: item?.images ?? [] };
      }

      const result = await menuItemResources.loadMenuItemImages(itemId);
      if (!result.ok || !result.data) {
        return result;
      }

      const imagesData = result.data;
      patchMenuItemInCatalogCache(itemId, (item) => withItemImages(item, imagesData));
      setEditingItem((prev) => (prev?.id === itemId ? withItemImages(prev, imagesData) : prev));
      setSelectedItem((prev) => (prev?.id === itemId ? withItemImages(prev, imagesData) : prev));

      return { ok: true, data: imagesData };
    },
    [menuItemResources, pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const uploadMenuItemImage = useCallback(
    async (
      itemId: MenuItemId,
      file: File,
      options: { sortOrder?: number; isPrimary?: boolean } = {},
    ) => {
      const createLocalPreview = (): ItemImage => {
        const objectUrl = URL.createObjectURL(file);
        return {
          id: generateSecureTempId('img'),
          url: objectUrl,
          previewUrl: objectUrl,
          mimeType: file.type,
          isPrimary: options.isPrimary ?? false,
          status: 'Active',
        };
      };

      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemId(itemId)) {
        const localImage = createLocalPreview();
        return { ok: true, data: localImage };
      }

      try {
        const data = await uploadMenuItemImageFlow(itemId, file, options);
        patchMenuItemInCatalogCache(itemId, (item) =>
          withItemImages(item, [...(item.images ?? []), data]),
        );
        setEditingItem((prev) =>
          prev?.id === itemId ? withItemImages(prev, [...(prev.images ?? []), data]) : prev,
        );
        setSelectedItem((prev) =>
          prev?.id === itemId ? withItemImages(prev, [...(prev.images ?? []), data]) : prev,
        );
        return { ok: true, data };
      } catch (error) {
        const fallbackImage = createLocalPreview();
        patchMenuItemInCatalogCache(itemId, (item) =>
          withItemImages(item, [...(item.images ?? []), fallbackImage]),
        );
        setEditingItem((prev) =>
          prev?.id === itemId
            ? withItemImages(prev, [...(prev.images ?? []), fallbackImage])
            : prev,
        );
        setSelectedItem((prev) =>
          prev?.id === itemId
            ? withItemImages(prev, [...(prev.images ?? []), fallbackImage])
            : prev,
        );
        return {
          ok: true,
          data: fallbackImage,
          message: error instanceof Error ? error.message : 'Failed to upload image',
        };
      }
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const setPrimaryMenuItemImage = useCallback(
    async (itemId: MenuItemId, imageId: MenuItemImageId) => {
      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemImageId(imageId)) {
        return { ok: true };
      }

      const result = await updateMenuItemImageViaBff(itemId, imageId, { isPrimary: true });
      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) =>
        withItemImages(
          item,
          (item.images ?? []).map((image) => ({
            ...image,
            isPrimary: image.id === imageId,
          })),
        ),
      );

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const activateMenuItemImage = useCallback(
    async (itemId: MenuItemId, imageId: MenuItemImageId) => {
      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemImageId(imageId)) {
        return { ok: true };
      }

      const result = await activateMenuItemImageViaBff(itemId, imageId);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) =>
        withItemImages(
          item,
          (item.images ?? []).map((image) => (image.id === imageId ? result.data : image)),
        ),
      );

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const deactivateMenuItemImage = useCallback(
    async (itemId: MenuItemId, imageId: MenuItemImageId) => {
      if (!usesPersistedMenuItemApi(pageConfig?.scope) || !isPersistedMenuItemImageId(imageId)) {
        return { ok: true };
      }

      const result = await deactivateMenuItemImageViaBff(itemId, imageId);
      if (!result.ok) {
        return { ok: false, message: result.message };
      }

      patchMenuItemInCatalogCache(itemId, (item) =>
        withItemImages(
          item,
          (item.images ?? []).map((image) => (image.id === imageId ? result.data : image)),
        ),
      );

      return { ok: true, data: result.data };
    },
    [pageConfig?.scope, patchMenuItemInCatalogCache],
  );

  const createMenuItemTag = useCallback(
    async (input: { name: string; code: string }) => {
      if (usesPersistedMenuItemApi(pageConfig?.scope)) {
        const result = await createMenuItemTagViaBff(input);
        if (!result.ok) {
          return { ok: false, message: result.message };
        }

        addMenuItemTagToCatalogCache(result.data);
        return { ok: true, data: result.data };
      }

      const localTag: MenuItemTag = {
        id: slugifyTagName(input.name),
        name: input.name.trim(),
        code: input.code.trim().toUpperCase(),
        status: 'Active',
      };

      addMenuItemTagToCatalogCache(localTag);

      return { ok: true, data: localTag };
    },
    [addMenuItemTagToCatalogCache, pageConfig?.scope],
  );

  const updateMenuItemTag = useCallback(
    async (tagId: string, updates: Partial<Pick<MenuItemTag, 'name' | 'code' | 'status'>>) => {
      if (usesPersistedMenuItemApi(pageConfig?.scope)) {
        const result = await updateMenuItemTagViaBff(tagId, updates);
        if (!result.ok) {
          return { ok: false, message: result.message };
        }

        patchMenuItemTagInCatalogCache(tagId, () => result.data);
        return { ok: true, data: result.data };
      }

      let merged: MenuItemTag | undefined;
      patchMenuItemTagInCatalogCache(tagId, (tag) => {
        merged = {
          ...tag,
          ...updates,
          name: updates.name?.trim() ?? tag.name,
          code: updates.code?.trim().toUpperCase() ?? tag.code,
        };
        return merged;
      });

      return merged ? { ok: true, data: merged } : { ok: false, message: 'Tag not found.' };
    },
    [pageConfig?.scope, patchMenuItemTagInCatalogCache],
  );

  const value = useMemo<MenuContextType>(
    () => ({
      pageConfig,
      categories,
      items,
      activeCategoryId,
      searchQuery,
      currentPage,
      pageSize,
      filteredItems,
      paginatedItems,
      totalPages,
      categoryCounts,
      totalItemCount: scopedItems.length,
      branchFilterId,
      setBranchFilterId,
      isHydrated,
      categoriesLoading,
      categoriesError,
      itemsLoading,
      itemsError,
      tagDefinitions,
      tagsLoading,
      tagsError,
      preparationStations,
      modifierGroups,
      catalogsLoading,

      viewMode,
      selectedItem,
      editingItem,
      deletingItem,

      setViewMode,
      openCreateItemPage,
      openEditItemPage,
      openViewItemPage,
      openCreateCategoryPage,
      backToList,
      closeDeleteModal,

      isAddModalOpen,
      isAddCategoryModalOpen,
      openAddModal,
      openEditModal,
      openAddCategoryModal,
      closeModals,

      setActiveCategoryId: handleCategorySelect,
      setSearchQuery: handleSearchChange,
      setCurrentPage,
      openDeleteModal,

      addMenuItem,
      updateMenuItem,
      activateMenuItemByItemId,
      deactivateMenuItemByItemId,
      deleteMenuItem,
      addCategory,
      deactivateCategory,
      activateCategory,
      loadMenuItemVariants,
      createMenuItemVariant,
      updateMenuItemVariant,
      activateMenuItemVariant,
      deactivateMenuItemVariant,
      loadMenuItemImages,
      uploadMenuItemImage,
      setPrimaryMenuItemImage,
      activateMenuItemImage,
      deactivateMenuItemImage,
      createMenuItemTag,
      updateMenuItemTag,
    }),
    [
      pageConfig,
      categories,
      items,
      activeCategoryId,
      searchQuery,
      currentPage,
      pageSize,
      filteredItems,
      paginatedItems,
      totalPages,
      categoryCounts,
      scopedItems.length,
      branchFilterId,
      setBranchFilterId,
      isHydrated,
      categoriesLoading,
      categoriesError,
      itemsLoading,
      itemsError,
      tagDefinitions,
      tagsLoading,
      tagsError,
      preparationStations,
      modifierGroups,
      catalogsLoading,
      viewMode,
      selectedItem,
      editingItem,
      deletingItem,
      setViewMode,
      openCreateItemPage,
      openEditItemPage,
      openViewItemPage,
      openCreateCategoryPage,
      backToList,
      closeDeleteModal,
      isAddModalOpen,
      isAddCategoryModalOpen,
      openAddModal,
      openEditModal,
      openAddCategoryModal,
      closeModals,
      handleCategorySelect,
      handleSearchChange,
      setCurrentPage,
      openDeleteModal,
      addMenuItem,
      updateMenuItem,
      activateMenuItemByItemId,
      deactivateMenuItemByItemId,
      deleteMenuItem,
      addCategory,
      deactivateCategory,
      activateCategory,
      loadMenuItemVariants,
      createMenuItemVariant,
      updateMenuItemVariant,
      activateMenuItemVariant,
      deactivateMenuItemVariant,
      loadMenuItemImages,
      uploadMenuItemImage,
      setPrimaryMenuItemImage,
      activateMenuItemImage,
      deactivateMenuItemImage,
      createMenuItemTag,
      updateMenuItemTag,
    ],
  );

  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (!context) {
    throw new Error('useMenu must be used within a MenuProvider');
  }
  return context;
}
