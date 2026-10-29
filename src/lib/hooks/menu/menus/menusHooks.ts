'use client';

import { useMemo } from 'react';
import { usePathname } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useQuery } from '@/lib/hooks/api/useQuery';
import {
  buildCreateRestaurantMenuBody,
  restaurantMenuRecordToAssignment,
} from '@/lib/helpers/menu/menusHelpers';
import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import {
  assignMenuCategoryBodySchema,
  parseMenuAssignmentRecord,
  parsePagedMenuAssignments,
  parseMenuCategoryAssignmentList,
  parseMenuCategoryAssignmentRecord,
  parseRestaurantMenuList,
  parseRestaurantMenuRecord,
  type MenuAssignment,
  type MenuCategoryAssignment,
  type MenuSessionFormValues,
  type PagedMenusData,
} from '@/lib/schemas/menu/menus/menusSchema';
import { useSidebarStore } from '@/stores/sidebarStore';
import ApiUrlsV1, {
  restaurantBranchMenuActivatePath,
  restaurantBranchMenuDeactivatePath,
  restaurantMenuActivatePath,
  restaurantMenuCategoryAssignmentsPath,
  restaurantMenuDeactivatePath,
  restaurantMenusPath,
} from '@/services/api/ApiUrlsV1';
import { api } from '@/services/api/browserClient';
import { ApiError } from '@/services/api/types';

// ——— Branch menus list ———

export type BranchMenusListParams = {
  status?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export function parseBranchIdFromPathname(pathname: string | null | undefined): number | undefined {
  if (!pathname) return undefined;
  const decoded = decodeURIComponent(pathname);
  const branchLabelMatch = decoded.match(/\/Branch\s+(\d+)(?:\/|$)/i);
  if (branchLabelMatch?.[1]) {
    const id = Number(branchLabelMatch[1]);
    return Number.isFinite(id) && id > 0 ? id : undefined;
  }
  return undefined;
}

export function useActiveBranchId(propBranchId?: number) {
  const pathname = usePathname();
  const pathBranchId = useMemo(() => parseBranchIdFromPathname(pathname), [pathname]);
  const storeBranchId = useSidebarStore(
    (state) => state.context.branchId ?? state.account?.branch_id ?? undefined,
  );
  return propBranchId ?? storeBranchId ?? pathBranchId ?? 49;
}

/** POS settle / payments: no default branch — avoids silent calls to branch 49. */
export function useStrictActiveBranchId(propBranchId?: number): number | undefined {
  const pathname = usePathname();
  const pathBranchId = useMemo(() => parseBranchIdFromPathname(pathname), [pathname]);
  const storeBranchId = useSidebarStore(
    (state) => state.context.branchId ?? state.account?.branch_id ?? undefined,
  );
  return propBranchId ?? storeBranchId ?? pathBranchId;
}

export const branchMenusQueryKey = (branchId: number, params?: BranchMenusListParams) =>
  ['restaurant', 'branch-menus', branchId, params ?? {}] as const;

/** GET /v1/restaurant/branches/{branch_id}/menus */
export function useBranchMenus(params?: BranchMenusListParams, branchId?: number) {
  const activeBranchId = useActiveBranchId(branchId);

  return useQuery({
    queryKey: branchMenusQueryKey(activeBranchId, params),
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        ApiUrlsV1.restaurant.branchMenus.list(activeBranchId),
        {
          page: params?.page ?? 1,
          page_size: params?.page_size ?? 15,
          ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
          ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
        },
        signal,
      );
      return parsePagedMenuAssignments(payload);
    },
  });
}

// ——— Restaurant menus catalogue list ———

export type RestaurantMenusListParams = {
  status?: string;
  menu_type?: string;
  search?: string;
  page?: number;
  page_size?: number;
};

export const restaurantMenusQueryKey = (params?: RestaurantMenusListParams) =>
  ['restaurant', 'menus', params ?? {}] as const;

function restaurantMenusListQueryParams(params?: RestaurantMenusListParams) {
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 50,
    ...(params?.status && params.status !== 'all' ? { status: params.status } : {}),
    ...(params?.menu_type?.trim() ? { menu_type: params.menu_type.trim() } : {}),
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
  };
}

/** GET /v1/restaurant/menus */
export function useRestaurantMenus(params?: RestaurantMenusListParams) {
  return useQuery({
    queryKey: restaurantMenusQueryKey(params),
    staleTime: 30_000,
    refetchOnWindowFocus: false,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantMenusPath(),
        restaurantMenusListQueryParams(params),
        signal,
      );
      const paged = parseRestaurantMenuList(payload);
      const rows: MenuAssignment[] = paged.items.map(restaurantMenuRecordToAssignment);
      const result: PagedMenusData = {
        items: rows,
        total: paged.total,
        page: paged.page,
        page_size: paged.page_size,
      };
      return result;
    },
  });
}

// ——— Create menu ———

export type CreateRestaurantMenuVariables = Readonly<{
  values: MenuSessionFormValues;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
}>;

/** POST /v1/restaurant/menus */
export function useCreateRestaurantMenu() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: CreateRestaurantMenuVariables) => {
      const body = buildCreateRestaurantMenuBody(variables);
      const payload = await api.post(restaurantMenusPath(), body, { silent: true });
      return parseRestaurantMenuRecord(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menus'] });
    },
  });
}

// ——— Activate / deactivate ———

export type SetRestaurantMenuActiveVariables = Readonly<{
  pageScope: MenuCataloguePageScope;
  active: boolean;
  menuId?: number;
  assignmentId?: number;
  branchId?: number;
}>;

/** Branch: POST …/branches/{branch_id}/menus/{assignment_id}/activate|deactivate; company: POST …/menus/{menu_id}/activate|deactivate */
export function useSetRestaurantMenuActive() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (variables: SetRestaurantMenuActiveVariables): Promise<MenuAssignment> => {
      if (variables.pageScope === 'branch') {
        const branchId = variables.branchId;
        const assignmentId = variables.assignmentId;
        if (branchId == null || branchId <= 0 || assignmentId == null || assignmentId <= 0) {
          throw new ApiError('Branch and menu assignment are required to update status.', 400);
        }
        const path = variables.active
          ? restaurantBranchMenuActivatePath(branchId, assignmentId)
          : restaurantBranchMenuDeactivatePath(branchId, assignmentId);
        const payload = await api.post(path, {}, { silent: true });
        return parseMenuAssignmentRecord(payload);
      }

      const menuId = variables.menuId;
      if (menuId == null || menuId <= 0) {
        throw new ApiError('Menu id is required to update status.', 400);
      }
      const path = variables.active
        ? restaurantMenuActivatePath(menuId)
        : restaurantMenuDeactivatePath(menuId);
      const payload = await api.post(path, {}, { silent: true });
      return restaurantMenuRecordToAssignment(parseRestaurantMenuRecord(payload));
    },
    onSuccess: async (_data, variables) => {
      if (variables.pageScope === 'branch' && variables.branchId != null) {
        await queryClient.invalidateQueries({
          queryKey: ['restaurant', 'branch-menus', variables.branchId],
        });
      } else {
        await queryClient.invalidateQueries({ queryKey: ['restaurant', 'menus'] });
      }
    },
  });
}

// ——— Category assignments ———

export type AssignMenuCategoryVariables = Readonly<{
  menuId: number;
  categoryId: number;
  displayOrder?: number;
}>;

/** POST /v1/restaurant/menus/{menu_id}/category-assignments */
export function useAssignMenuCategory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      menuId,
      categoryId,
      displayOrder = 0,
    }: AssignMenuCategoryVariables): Promise<MenuCategoryAssignment> => {
      const body = assignMenuCategoryBodySchema.parse({
        category_id: categoryId,
        display_order: displayOrder,
      });
      const payload = await api.post(restaurantMenuCategoryAssignmentsPath(menuId), body, {
        silent: true,
      });
      return parseMenuCategoryAssignmentRecord(payload);
    },
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ['restaurant', 'menu-category-assignments', variables.menuId],
      });
    },
  });
}

export type MenuCategoryAssignmentsListParams = {
  search?: string;
  category_id?: number;
  page?: number;
  page_size?: number;
};

export const menuCategoryAssignmentsQueryKey = (
  menuId: number | undefined,
  params?: MenuCategoryAssignmentsListParams,
) => ['restaurant', 'menu-category-assignments', menuId, params ?? {}] as const;

function menuCategoryAssignmentsListQueryParams(params?: MenuCategoryAssignmentsListParams) {
  return {
    page: params?.page ?? 1,
    page_size: params?.page_size ?? 100,
    ...(params?.search?.trim() ? { search: params.search.trim() } : {}),
    ...(params?.category_id != null ? { category_id: params.category_id } : {}),
  };
}

/** GET /v1/restaurant/menus/{menu_id}/category-assignments */
export function useMenuCategoryAssignments(
  menuId: number | undefined,
  params?: MenuCategoryAssignmentsListParams,
) {
  const enabled = menuId != null && Number.isFinite(menuId) && menuId > 0;

  return useQuery({
    queryKey: menuCategoryAssignmentsQueryKey(menuId, params),
    enabled,
    staleTime: 30_000,
    queryFn: async ({ signal }) => {
      const payload = await api.get(
        restaurantMenuCategoryAssignmentsPath(menuId!),
        menuCategoryAssignmentsListQueryParams(params),
        signal,
      );
      return parseMenuCategoryAssignmentList(payload);
    },
  });
}
