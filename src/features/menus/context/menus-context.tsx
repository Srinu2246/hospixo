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
import { useDashboardFilter } from '@/context/dashboard-filter';
import { clientApi } from '@/lib/client-api';
import {
  companyMenuSessionsQueryKey,
  fetchRestaurantMenus,
  useCompanyMenuSessionsQuery,
} from '../hooks/use-company-menus-sessions';
import { filterRestaurantMenusForBranchScope } from '../lib/branch-menu-scope';
import { useMenusRoutes } from './menus-routes-context';
import { fetchMenuItemImagesByItemId } from '@/lib/menu-cache';
import {
  useMenuSessionCategoriesQuery,
  useMenuSessionItemsQuery,
} from '../hooks/use-menu-session-catalog';
import type {
  CreateRestaurantMenuInput,
  MenuTree,
  MenuTreeCategory,
  RestaurantMenu,
} from '@/features/menu/types/restaurant-menu';

import {
  flattenAssignedItems,
  restaurantMenuToSession,
  sessionFormToCreateInput,
  toCatalogCategories,
  toCatalogItems,
} from '../lib/map-session';
import type {
  CompanyMenusPageData,
  MenuCatalogCategory,
  MenuCatalogItem,
  MenuSession,
  MenuSessionForm,
  MenuSessionStatus,
} from '../types/menus';

type MenusContextValue = {
  sessions: MenuSession[];
  categories: MenuCatalogCategory[];
  items: MenuCatalogItem[];
  assignedItems: MenuCatalogItem[];
  ready: boolean;
  error: string | null;
  getSession: (id: string) => MenuSession | undefined;
  loadDetail: (id: string) => Promise<void>;
  ensureSessions: () => Promise<void>;
  hydrateItemImages: (itemIds: readonly string[]) => Promise<void>;
  ensureCategories: () => Promise<void>;
  ensureItems: () => Promise<void>;
  createSession: (
    form: MenuSessionForm,
  ) => Promise<{ ok: true; data: MenuSession } | { ok: false; message: string }>;
  updateSession: (
    id: string,
    form: MenuSessionForm,
  ) => Promise<{ ok: true; data: MenuSession } | { ok: false; message: string }>;
  setStatus: (
    id: string,
    status: MenuSessionStatus,
  ) => Promise<{ ok: true; data: undefined } | { ok: false; message: string }>;
  assignCategories: (
    id: string,
    categoryIds: readonly string[],
  ) => Promise<{ ok: true; data: undefined } | { ok: false; message: string }>;
  unassignCategory: (
    id: string,
    categoryId: string,
  ) => Promise<{ ok: true; data: undefined } | { ok: false; message: string }>;
  unassignCategoryAssignment: (
    id: string,
    assignmentId: string,
  ) => Promise<{ ok: true; data: undefined } | { ok: false; message: string }>;
  unassignItem: (
    id: string,
    itemId: string,
  ) => Promise<{ ok: true; data: undefined } | { ok: false; message: string }>;
};

const MenusContext = createContext<MenusContextValue | null>(null);

function upsertSession(current: MenuSession[], next: MenuSession): MenuSession[] {
  const exists = current.some((session) => session.id === next.id);
  return exists
    ? current.map((session) => (session.id === next.id ? next : session))
    : [next, ...current];
}

function assignedCategoryIds(tree: MenuTree | null): Set<string> {
  const ids = new Set<string>();
  function walk(category: MenuTreeCategory) {
    if (category.categoryId) ids.add(category.categoryId);
    for (const child of category.children) walk(child);
  }
  for (const category of tree?.categories ?? []) walk(category);
  return ids;
}

export function MenusProvider({
  children,
  initialData,
}: {
  children: ReactNode;
  initialData?: CompanyMenusPageData;
}) {
  const queryClient = useQueryClient();
  const { scope: menusScope } = useMenusRoutes();
  const { user } = useAuth();
  const dashboardFilter = useDashboardFilter();
  const branchId =
    (user?.branch_id != null ? String(user.branch_id) : null) ??
    dashboardFilter?.activeBranchId ??
    null;
  const sessionsQuery = useCompanyMenuSessionsQuery(!initialData);
  const categoriesQuery = useMenuSessionCategoriesQuery(true);
  const itemsQuery = useMenuSessionItemsQuery(true);
  const [sessions, setSessions] = useState<MenuSession[]>(initialData?.sessions ?? []);
  const [tree, setTree] = useState<MenuTree | null>(null);
  const [imageByItemId, setImageByItemId] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(Boolean(initialData));
  const [error, setError] = useState<string | null>(
    sessionsQuery.error instanceof Error ? sessionsQuery.error.message : null,
  );

  const apiCategories = useMemo(() => {
    if (categoriesQuery.data && categoriesQuery.data.length > 0) {
      return [...categoriesQuery.data];
    }
    return initialData?.sourceCategories ?? [];
  }, [categoriesQuery.data, initialData?.sourceCategories]);

  const apiItems = useMemo(() => [...(itemsQuery.data ?? [])], [itemsQuery.data]);

  const sessionsRef = useRef(sessions);
  const apiItemsRef = useRef(apiItems);
  const apiCategoriesRef = useRef(apiCategories);
  const treeRef = useRef(tree);
  const imageByItemIdRef = useRef(imageByItemId);
  const inFlightDetailRequestsRef = useRef<Map<string, Promise<void>>>(new Map());
  const inFlightSessionsRequestRef = useRef<Promise<void> | null>(null);

  useEffect(() => {
    sessionsRef.current = sessions;
    apiItemsRef.current = apiItems;
    apiCategoriesRef.current = apiCategories;
    treeRef.current = tree;
    imageByItemIdRef.current = imageByItemId;
  }, [sessions, apiItems, apiCategories, tree, imageByItemId]);

  const categories = useMemo(() => toCatalogCategories(apiCategories), [apiCategories]);
  const items = useMemo(() => toCatalogItems(apiItems), [apiItems]);
  const assignedItems = useMemo(
    () => flattenAssignedItems(tree, apiItems, imageByItemId),
    [apiItems, imageByItemId, tree],
  );

  const visibleRestaurantMenus = useMemo(() => {
    const menus = sessionsQuery.data ?? [];
    if (menusScope === 'branch') {
      return filterRestaurantMenusForBranchScope(menus, branchId);
    }
    return menus;
  }, [branchId, menusScope, sessionsQuery.data]);

  useEffect(() => {
    if (initialData || !sessionsQuery.data) return;
    queueMicrotask(() => {
      setSessions(visibleRestaurantMenus.map(restaurantMenuToSession));
      setReady(true);
      setError(null);
    });
  }, [initialData, sessionsQuery.data, visibleRestaurantMenus]);

  useEffect(() => {
    if (sessionsQuery.isError) {
      queueMicrotask(() => {
        setError(
          sessionsQuery.error instanceof Error
            ? sessionsQuery.error.message
            : 'Failed to load menus',
        );
        setReady(true);
      });
    }
  }, [sessionsQuery.error, sessionsQuery.isError]);

  const ensureSessions = useCallback(async () => {
    if (sessionsRef.current.length > 0) {
      setReady(true);
      return;
    }
    if (inFlightSessionsRequestRef.current) return inFlightSessionsRequestRef.current;

    const promise = (async () => {
      try {
        const menus = await queryClient.fetchQuery({
          queryKey: companyMenuSessionsQueryKey,
          queryFn: fetchRestaurantMenus,
        });
        const visible =
          menusScope === 'branch' ? filterRestaurantMenusForBranchScope(menus, branchId) : menus;
        setSessions(visible.map(restaurantMenuToSession));
        setError(null);
      } catch (err) {
        setSessions([]);
        setError(err instanceof Error ? err.message : 'Failed to load menus');
      } finally {
        setReady(true);
      }
    })().finally(() => {
      inFlightSessionsRequestRef.current = null;
    });

    inFlightSessionsRequestRef.current = promise;
    return promise;
  }, [branchId, menusScope, queryClient]);

  const menuScopeOptions = useMemo((): Pick<
    CreateRestaurantMenuInput,
    'scope' | 'assignBranchId'
  > => {
    if (menusScope === 'branch' && branchId != null) {
      return { scope: 'branch', assignBranchId: branchId };
    }
    return { scope: 'company', assignBranchId: null };
  }, [branchId, menusScope]);

  useEffect(() => {
    if (initialData) return;
    let cancelled = false;

    void ensureSessions().then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
    };
  }, [ensureSessions, initialData]);

  const getSession = useCallback(
    (id: string) => sessions.find((session) => session.id === id),
    [sessions],
  );

  const ensureCategories = useCallback(async () => {
    if (apiCategoriesRef.current.length > 0) return;
    try {
      await categoriesQuery.refetch();
    } catch {
      // silently fallback
    }
  }, [categoriesQuery]);

  const ensureItems = useCallback(async () => {
    if (apiItemsRef.current.length > 0) return;
    try {
      if (apiCategoriesRef.current.length === 0) {
        await categoriesQuery.refetch();
      }
      await itemsQuery.refetch();
    } catch {
      // silently fallback
    }
  }, [categoriesQuery, itemsQuery]);

  const hydrateItemImages = useCallback(async (itemIds: readonly string[]) => {
    const missing = itemIds.filter((itemId) => imageByItemIdRef.current[itemId] === undefined);
    if (missing.length === 0) return;

    const results = await Promise.all(
      missing.map(async (itemId) => {
        try {
          const images = await fetchMenuItemImagesByItemId(itemId);
          const primary = images.find((img) => img.isPrimary)?.url || images[0]?.url || '';
          return [itemId, primary] as const;
        } catch {
          return [itemId, ''] as const;
        }
      }),
    );

    setImageByItemId((current) => {
      const next = { ...current };
      for (const [itemId, url] of results) {
        next[itemId] = url;
        imageByItemIdRef.current[itemId] = url;
      }
      return next;
    });
  }, []);

  const loadDetail = useCallback(async (id: string) => {
    if (!id) return;
    const existing = inFlightDetailRequestsRef.current.get(id);
    if (existing) return existing;

    const promise = (async () => {
      try {
        const [treeRes, menuRes] = await Promise.all([
          clientApi
            .get<{ success?: boolean; data?: MenuTree }>(`/menu/menus/${id}/tree`)
            .catch(() => null),
          clientApi
            .get<{ success?: boolean; data?: RestaurantMenu }>(`/menu/menus/${id}`)
            .catch(() => null),
        ]);

        const loadedTree = (
          treeRes && typeof treeRes === 'object' && 'data' in treeRes && treeRes.data
            ? treeRes.data
            : treeRes
        ) as MenuTree | null;
        const loadedMenu = (
          menuRes && typeof menuRes === 'object' && 'data' in menuRes && menuRes.data
            ? menuRes.data
            : menuRes
        ) as RestaurantMenu | null;

        if (loadedTree) {
          setTree(loadedTree);
          const seeded: Record<string, string> = {};
          function walk(category: MenuTreeCategory) {
            for (const item of category.items) {
              if (item.imageUrl) seeded[item.id] = item.imageUrl;
            }
            for (const child of category.children) walk(child);
          }
          for (const category of loadedTree.categories ?? []) walk(category);
          if (Object.keys(seeded).length > 0) {
            setImageByItemId((current) => ({ ...seeded, ...current }));
            imageByItemIdRef.current = { ...seeded, ...imageByItemIdRef.current };
          }
        } else {
          setTree({ menuId: id, categories: [] });
        }

        if (loadedMenu) {
          setSessions((current) => upsertSession(current, restaurantMenuToSession(loadedMenu)));
        }
      } catch {
        setTree({ menuId: id, categories: [] });
      }
    })().finally(() => {
      inFlightDetailRequestsRef.current.delete(id);
    });

    inFlightDetailRequestsRef.current.set(id, promise);
    return promise;
  }, []);

  const createSession = useCallback(
    async (form: MenuSessionForm) => {
      try {
        const response = await clientApi.post<{ success?: boolean; data?: RestaurantMenu }>(
          '/menu/menus',
          sessionFormToCreateInput(form, menuScopeOptions),
        );
        const data = (
          response && typeof response === 'object' && 'data' in response && response.data
            ? response.data
            : response
        ) as RestaurantMenu;
        const session = restaurantMenuToSession(data);
        setSessions((current) => [session, ...current]);
        await queryClient.invalidateQueries({ queryKey: companyMenuSessionsQueryKey });
        return { ok: true as const, data: session };
      } catch (err) {
        return {
          ok: false as const,
          message: err instanceof Error ? err.message : 'Failed to create menu',
        };
      }
    },
    [menuScopeOptions, queryClient],
  );

  const updateSession = useCallback(
    async (id: string, form: MenuSessionForm) => {
      try {
        const response = await clientApi.patch<{ success?: boolean; data?: RestaurantMenu }>(
          `/menu/menus/${id}`,
          sessionFormToCreateInput(form, menuScopeOptions),
        );
        const data = (
          response && typeof response === 'object' && 'data' in response && response.data
            ? response.data
            : response
        ) as RestaurantMenu;
        const session = restaurantMenuToSession(data);
        setSessions((current) => current.map((item) => (item.id === id ? session : item)));
        return { ok: true as const, data: session };
      } catch (err) {
        return {
          ok: false as const,
          message: err instanceof Error ? err.message : 'Failed to update menu',
        };
      }
    },
    [menuScopeOptions],
  );

  const setStatus = useCallback(async (id: string, status: MenuSessionStatus) => {
    try {
      const path =
        status === 'active' ? `/menu/menus/${id}/activate` : `/menu/menus/${id}/deactivate`;
      const response = await clientApi.post<{ success?: boolean; data?: RestaurantMenu }>(path, {});
      const data = (
        response && typeof response === 'object' && 'data' in response && response.data
          ? response.data
          : response
      ) as RestaurantMenu;
      const session = restaurantMenuToSession(data);
      setSessions((current) => current.map((item) => (item.id === id ? session : item)));
      return { ok: true as const, data: undefined };
    } catch (err) {
      return {
        ok: false as const,
        message: err instanceof Error ? err.message : 'Failed to update status',
      };
    }
  }, []);

  const assignCategories = useCallback(
    async (id: string, categoryIds: readonly string[]) => {
      try {
        const assigned = assignedCategoryIds(treeRef.current);
        const nextIds = categoryIds.filter((categoryId) => !assigned.has(categoryId));
        const order = assigned.size;

        await Promise.all(
          nextIds.map((categoryId, index) =>
            clientApi.post(`/menu/menus/${id}/category-assignments`, {
              categoryId,
              displayOrder: order + index,
            }),
          ),
        );

        await loadDetail(id);
        return { ok: true as const, data: undefined };
      } catch (err) {
        return {
          ok: false as const,
          message: err instanceof Error ? err.message : 'Failed to assign categories',
        };
      }
    },
    [loadDetail],
  );

  const unassignCategoryAssignment = useCallback(
    async (id: string, assignmentId: string) => {
      try {
        await clientApi.delete(`/menu/menus/${id}/category-assignments/${assignmentId}`);
        await loadDetail(id);
        return { ok: true as const, data: undefined };
      } catch (err) {
        return {
          ok: false as const,
          message: err instanceof Error ? err.message : 'Failed to unassign category',
        };
      }
    },
    [loadDetail],
  );

  const unassignCategory = useCallback(
    (id: string, categoryId: string) => {
      let assignmentId: string | undefined;
      function findInTree(cat: MenuTreeCategory) {
        if (cat.categoryId === categoryId && cat.assignmentId) {
          assignmentId = cat.assignmentId;
          return;
        }
        for (const child of cat.children) {
          findInTree(child);
          if (assignmentId) return;
        }
      }
      for (const cat of treeRef.current?.categories ?? []) {
        findInTree(cat);
        if (assignmentId) break;
      }
      if (!assignmentId) {
        return Promise.resolve({
          ok: false as const,
          message: 'Category assignment was not found.',
        });
      }
      return unassignCategoryAssignment(id, assignmentId);
    },
    [unassignCategoryAssignment],
  );

  const unassignItem = useCallback(
    () =>
      Promise.resolve({
        ok: false as const,
        message:
          'Per-item unassignment is not supported by the restaurant menu API. Please unassign the entire category instead.',
      }),
    [],
  );

  const value = useMemo(
    () => ({
      sessions,
      categories,
      items,
      assignedItems,
      ready,
      error,
      getSession,
      loadDetail,
      ensureSessions,
      hydrateItemImages,
      ensureCategories,
      ensureItems,
      createSession,
      updateSession,
      setStatus,
      assignCategories,
      unassignCategory,
      unassignCategoryAssignment,
      unassignItem,
    }),
    [
      assignCategories,
      assignedItems,
      categories,
      createSession,
      ensureCategories,
      ensureItems,
      ensureSessions,
      error,
      getSession,
      hydrateItemImages,
      items,
      loadDetail,
      ready,
      sessions,
      setStatus,
      unassignCategory,
      unassignCategoryAssignment,
      unassignItem,
      updateSession,
    ],
  );

  return <MenusContext.Provider value={value}>{children}</MenusContext.Provider>;
}

export function useMenus() {
  const context = useContext(MenusContext);
  if (!context) {
    throw new Error('useMenus must be used inside <MenusProvider>');
  }
  return context;
}
