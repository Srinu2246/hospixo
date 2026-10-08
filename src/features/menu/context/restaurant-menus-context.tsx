'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

import { fetchMenuCategories } from '@/lib/menu-cache';
import {
  activateRestaurantMenuClient,
  assignMenuCategoryClient,
  createRestaurantMenuClient,
  deactivateRestaurantMenuClient,
  fetchMenuCategoryAssignmentsClient,
  fetchRestaurantMenuTreeClient,
  fetchRestaurantMenusClient,
  removeMenuCategoryAssignmentClient,
  updateRestaurantMenuClient,
} from '../api/restaurant-menus-client';
import type { MenuBuilderPageConfig } from '../config/menu-builder-page-config';
import {
  menuCategoriesQueryKey,
  restaurantMenuAssignmentsQueryKey,
  restaurantMenuTreeQueryKey,
  restaurantMenusQueryKey,
} from '../hooks/restaurant-menus-query-keys';
import type { MenuCategory } from '../types/menu';
import type {
  CreateRestaurantMenuInput,
  MenuCategoryAssignment,
  MenuTree,
  MenusViewMode,
  RestaurantMenu,
} from '../types/restaurant-menu';
import type {
  ListRestaurantMenusApiQuery,
  MenuCategoryAssignmentId,
  RestaurantMenuId,
} from '../types/restaurant-menu-api';

type RestaurantMenusContextType = {
  pageConfig: MenuBuilderPageConfig;
  menus: RestaurantMenu[];
  categories: readonly MenuCategory[];
  selectedMenu: RestaurantMenu | null;
  editingMenu: RestaurantMenu | null;
  categoryAssignments: MenuCategoryAssignment[];
  menuTree: MenuTree | null;
  viewMode: MenusViewMode;
  statusFilter: ListRestaurantMenusApiQuery['status'] | 'all';
  menuTypeFilter: string;
  isHydrated: boolean;
  menusLoading: boolean;
  menusError: string | null;
  categoriesLoading: boolean;
  detailLoading: boolean;
  serverDetailHydrated: boolean;
  detailError: string | null;

  setStatusFilter: (status: ListRestaurantMenusApiQuery['status'] | 'all') => void;
  setMenuTypeFilter: (menuType: string) => void;
  openCreateMenuPage: () => void;
  openEditMenuPage: (menu: RestaurantMenu) => void;
  openViewMenuPage: (menu: RestaurantMenu) => void;
  backToList: () => void;

  createMenu: (input: CreateRestaurantMenuInput) => Promise<{ ok: boolean; message?: string }>;
  updateMenu: (
    menuId: RestaurantMenuId,
    updates: Partial<CreateRestaurantMenuInput> & {
      status?: RestaurantMenu['status'];
      displayOrder?: number;
    },
  ) => Promise<{ ok: boolean; message?: string }>;
  activateMenu: (menuId: RestaurantMenuId) => Promise<{ ok: boolean; message?: string }>;
  deactivateMenu: (menuId: RestaurantMenuId) => Promise<{ ok: boolean; message?: string }>;

  loadMenuDetail: (menuId: RestaurantMenuId) => Promise<{ ok: boolean; message?: string }>;
  assignCategory: (
    menuId: RestaurantMenuId,
    categoryId: string,
    displayOrder?: number,
  ) => Promise<{ ok: boolean; message?: string }>;
  removeCategoryAssignment: (
    menuId: RestaurantMenuId,
    assignmentId: MenuCategoryAssignmentId,
  ) => Promise<{ ok: boolean; message?: string }>;

  availableCategoriesForAssignment: MenuCategory[];
};

const RestaurantMenusContext = createContext<RestaurantMenusContextType | null>(null);

const EMPTY_MENUS: RestaurantMenu[] = [];
const EMPTY_CATEGORIES: MenuCategory[] = [];
const EMPTY_ASSIGNMENTS: MenuCategoryAssignment[] = [];

export function RestaurantMenusProvider({
  children,
  pageConfig,
}: Readonly<{
  children: ReactNode;
  pageConfig: MenuBuilderPageConfig;
}>) {
  const queryClient = useQueryClient();
  const [selectedMenu, setSelectedMenu] = useState<RestaurantMenu | null>(null);
  const [editingMenu, setEditingMenu] = useState<RestaurantMenu | null>(null);
  const [viewMode, setViewMode] = useState<MenusViewMode>('list');
  const [statusFilter, setStatusFilter] = useState<ListRestaurantMenusApiQuery['status'] | 'all'>(
    'all',
  );
  const [menuTypeFilter, setMenuTypeFilter] = useState('all');
  const [detailError, setDetailError] = useState<string | null>(null);
  const [serverDetailHydrated, setServerDetailHydrated] = useState(false);
  const [activeDetailMenuId, setActiveDetailMenuId] = useState<string | null>(null);

  const listQuery = useMemo((): ListRestaurantMenusApiQuery | undefined => {
    const query: {
      status?: ListRestaurantMenusApiQuery['status'];
      menu_type?: ListRestaurantMenusApiQuery['menu_type'];
    } = {};
    if (statusFilter !== 'all') query.status = statusFilter;
    if (menuTypeFilter !== 'all')
      query.menu_type = menuTypeFilter as ListRestaurantMenusApiQuery['menu_type'];
    return Object.keys(query).length > 0 ? query : undefined;
  }, [menuTypeFilter, statusFilter]);

  const menusQuery = useQuery({
    queryKey: restaurantMenusQueryKey(listQuery),
    queryFn: () => fetchRestaurantMenusClient(listQuery),
  });

  const categoriesQuery = useQuery({
    queryKey: menuCategoriesQueryKey,
    queryFn: () => fetchMenuCategories({ forceRefresh: true }),
  });

  const assignmentsQuery = useQuery({
    queryKey: restaurantMenuAssignmentsQueryKey(activeDetailMenuId ?? ''),
    queryFn: () =>
      fetchMenuCategoryAssignmentsClient(
        activeDetailMenuId!,
        categoriesQuery.data ?? EMPTY_CATEGORIES,
      ),
    enabled: Boolean(activeDetailMenuId) && (categoriesQuery.data?.length ?? 0) >= 0,
  });

  const treeQuery = useQuery({
    queryKey: restaurantMenuTreeQueryKey(activeDetailMenuId ?? ''),
    queryFn: () => fetchRestaurantMenuTreeClient(activeDetailMenuId!),
    enabled: Boolean(activeDetailMenuId),
  });

  const menus = menusQuery.data ?? EMPTY_MENUS;
  const categories = categoriesQuery.data ?? EMPTY_CATEGORIES;
  const categoryAssignments = assignmentsQuery.data ?? EMPTY_ASSIGNMENTS;
  const menuTree = treeQuery.data ?? null;

  const detailLoading =
    Boolean(activeDetailMenuId) &&
    (assignmentsQuery.isPending || treeQuery.isPending) &&
    !serverDetailHydrated;

  const invalidateMenus = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['menu', 'restaurant-menus'] });
  }, [queryClient]);

  const openCreateMenuPage = useCallback(() => {
    setEditingMenu(null);
    setViewMode('create-menu');
  }, []);

  const openEditMenuPage = useCallback((menu: RestaurantMenu) => {
    setEditingMenu(menu);
    setViewMode('edit-menu');
  }, []);

  const openViewMenuPage = useCallback((menu: RestaurantMenu) => {
    setSelectedMenu(menu);
    setActiveDetailMenuId(menu.id);
    setServerDetailHydrated(false);
    setDetailError(null);
    setViewMode('view-menu');
  }, []);

  const backToList = useCallback(() => {
    setViewMode('list');
    setSelectedMenu(null);
    setEditingMenu(null);
    setActiveDetailMenuId(null);
    setServerDetailHydrated(false);
    setDetailError(null);
  }, []);

  const createMenuMutation = useMutation({
    mutationFn: createRestaurantMenuClient,
    onSuccess: async () => {
      await invalidateMenus();
      backToList();
    },
  });

  const updateMenuMutation = useMutation({
    mutationFn: ({
      menuId,
      updates,
    }: {
      menuId: RestaurantMenuId;
      updates: Parameters<typeof updateRestaurantMenuClient>[1];
    }) => updateRestaurantMenuClient(menuId, updates),
    onSuccess: async (data) => {
      await invalidateMenus();
      if (selectedMenu?.id === data.id) setSelectedMenu(data);
      backToList();
    },
  });

  const activateMenuMutation = useMutation({
    mutationFn: activateRestaurantMenuClient,
    onSuccess: async (data) => {
      await invalidateMenus();
      if (selectedMenu?.id === data.id) setSelectedMenu(data);
    },
  });

  const deactivateMenuMutation = useMutation({
    mutationFn: deactivateRestaurantMenuClient,
    onSuccess: async (data) => {
      await invalidateMenus();
      if (selectedMenu?.id === data.id) setSelectedMenu(data);
    },
  });

  const assignCategoryMutation = useMutation({
    mutationFn: ({
      menuId,
      categoryId,
      displayOrder,
    }: {
      menuId: RestaurantMenuId;
      categoryId: string;
      displayOrder?: number;
    }) => assignMenuCategoryClient(menuId, { categoryId, displayOrder }, categories),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: restaurantMenuAssignmentsQueryKey(variables.menuId),
      });
      await queryClient.invalidateQueries({
        queryKey: restaurantMenuTreeQueryKey(variables.menuId),
      });
    },
  });

  const removeAssignmentMutation = useMutation({
    mutationFn: ({
      menuId,
      assignmentId,
    }: {
      menuId: RestaurantMenuId;
      assignmentId: MenuCategoryAssignmentId;
    }) => removeMenuCategoryAssignmentClient(menuId, assignmentId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: restaurantMenuAssignmentsQueryKey(variables.menuId),
      });
      await queryClient.invalidateQueries({
        queryKey: restaurantMenuTreeQueryKey(variables.menuId),
      });
    },
  });

  const loadMenuDetail = useCallback(
    async (menuId: RestaurantMenuId) => {
      setActiveDetailMenuId(menuId);
      setDetailError(null);
      try {
        await Promise.all([
          queryClient.fetchQuery({
            queryKey: restaurantMenuAssignmentsQueryKey(menuId),
            queryFn: () => fetchMenuCategoryAssignmentsClient(menuId, categories),
          }),
          queryClient.fetchQuery({
            queryKey: restaurantMenuTreeQueryKey(menuId),
            queryFn: () => fetchRestaurantMenuTreeClient(menuId),
          }),
        ]);
        setServerDetailHydrated(true);
        return { ok: true as const };
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to load menu detail';
        setDetailError(message);
        return { ok: false as const, message };
      }
    },
    [categories, queryClient],
  );

  const availableCategoriesForAssignment = useMemo(() => {
    const assignedIds = new Set(categoryAssignments.map((a) => a.categoryId));
    return categories.filter(
      (category) => category.status !== 'Inactive' && !assignedIds.has(category.id),
    );
  }, [categories, categoryAssignments]);

  useEffect(() => {
    if (
      activeDetailMenuId &&
      !assignmentsQuery.isPending &&
      !treeQuery.isPending &&
      assignmentsQuery.isFetched &&
      treeQuery.isFetched
    ) {
      queueMicrotask(() => {
        setServerDetailHydrated(true);
      });
    }
  }, [
    activeDetailMenuId,
    assignmentsQuery.isFetched,
    assignmentsQuery.isPending,
    treeQuery.isFetched,
    treeQuery.isPending,
  ]);

  const createMenu = useCallback(
    async (input: CreateRestaurantMenuInput) => {
      try {
        await createMenuMutation.mutateAsync(input);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Failed to create menu',
        };
      }
    },
    [createMenuMutation],
  );

  const updateMenu = useCallback(
    async (
      menuId: RestaurantMenuId,
      updates: Partial<CreateRestaurantMenuInput> & {
        status?: RestaurantMenu['status'];
        displayOrder?: number;
      },
    ) => {
      try {
        await updateMenuMutation.mutateAsync({ menuId, updates });
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Failed to update menu',
        };
      }
    },
    [updateMenuMutation],
  );

  const activateMenu = useCallback(
    async (menuId: RestaurantMenuId) => {
      try {
        await activateMenuMutation.mutateAsync(menuId);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Failed to activate menu',
        };
      }
    },
    [activateMenuMutation],
  );

  const deactivateMenu = useCallback(
    async (menuId: RestaurantMenuId) => {
      try {
        await deactivateMenuMutation.mutateAsync(menuId);
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Failed to deactivate menu',
        };
      }
    },
    [deactivateMenuMutation],
  );

  const assignCategory = useCallback(
    async (menuId: RestaurantMenuId, categoryId: string, displayOrder?: number) => {
      try {
        await assignCategoryMutation.mutateAsync({
          menuId,
          categoryId,
          displayOrder: displayOrder ?? categoryAssignments.length,
        });
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Failed to assign category',
        };
      }
    },
    [assignCategoryMutation, categoryAssignments.length],
  );

  const removeCategoryAssignment = useCallback(
    async (menuId: RestaurantMenuId, assignmentId: MenuCategoryAssignmentId) => {
      try {
        await removeAssignmentMutation.mutateAsync({ menuId, assignmentId });
        return { ok: true };
      } catch (err) {
        return {
          ok: false,
          message: err instanceof Error ? err.message : 'Failed to remove assignment',
        };
      }
    },
    [removeAssignmentMutation],
  );

  const value = useMemo<RestaurantMenusContextType>(
    () => ({
      pageConfig,
      menus,
      categories,
      selectedMenu,
      editingMenu,
      categoryAssignments,
      menuTree,
      viewMode,
      statusFilter,
      menuTypeFilter,
      isHydrated: menusQuery.isFetched,
      menusLoading: menusQuery.isPending,
      menusError: menusQuery.error instanceof Error ? menusQuery.error.message : null,
      categoriesLoading: categoriesQuery.isPending,
      detailLoading,
      serverDetailHydrated,
      detailError,
      setStatusFilter,
      setMenuTypeFilter,
      openCreateMenuPage,
      openEditMenuPage,
      openViewMenuPage,
      backToList,
      createMenu,
      updateMenu,
      activateMenu,
      deactivateMenu,
      loadMenuDetail,
      assignCategory,
      removeCategoryAssignment,
      availableCategoriesForAssignment,
    }),
    [
      pageConfig,
      menus,
      categories,
      selectedMenu,
      editingMenu,
      categoryAssignments,
      menuTree,
      viewMode,
      statusFilter,
      menuTypeFilter,
      menusQuery.isFetched,
      menusQuery.isPending,
      menusQuery.error,
      categoriesQuery.isPending,
      detailLoading,
      serverDetailHydrated,
      detailError,
      setStatusFilter,
      setMenuTypeFilter,
      openCreateMenuPage,
      openEditMenuPage,
      openViewMenuPage,
      backToList,
      createMenu,
      updateMenu,
      activateMenu,
      deactivateMenu,
      loadMenuDetail,
      assignCategory,
      removeCategoryAssignment,
      availableCategoriesForAssignment,
    ],
  );

  return (
    <RestaurantMenusContext.Provider value={value}>{children}</RestaurantMenusContext.Provider>
  );
}

export function useRestaurantMenus() {
  const context = useContext(RestaurantMenusContext);
  if (!context) {
    throw new Error('useRestaurantMenus must be used within RestaurantMenusProvider');
  }
  return context;
}
