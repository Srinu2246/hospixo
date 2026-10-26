import {
  resolveCatalogueContextIds,
  type ResolvedCatalogueContextIds,
} from '@/lib/helpers/apiContextHeaders';
import type { MenuItemStatusChangeBody } from '@/lib/schemas/menu/menuItemsSchema';
import {
  createMenuCategoryBodySchema,
  type CreateMenuCategoryBody,
} from '@/lib/schemas/menu/menuCategoriesSchema';
import { ApiError } from '@/services/api/types';
import { useSidebarStore } from '@/stores/sidebarStore';

export type MenuCataloguePageScope = 'branch' | 'company' | 'organization';

export function resolveMenuBranchIdFromStore(): number | undefined {
  const { context, account } = useSidebarStore.getState();
  const raw = context.branchId ?? account?.branch_id;
  if (raw == null) return undefined;
  const id = typeof raw === 'number' ? raw : Number(raw);
  return Number.isFinite(id) && id > 0 ? id : undefined;
}

/** Branch routes must send branch_id on item status writes so the API matches session scope. */
export function buildMenuItemStatusChangeBody(
  pageScope: MenuCataloguePageScope | undefined,
): MenuItemStatusChangeBody {
  if (pageScope !== 'branch') {
    return {};
  }

  const branchId = resolveMenuBranchIdFromStore();
  if (branchId == null) {
    throw new ApiError('Branch is required to update item status for this account.', 400);
  }

  return { branch_id: branchId };
}

export function assertCatalogueContextForCategoryCreate(
  pageScope: MenuCataloguePageScope,
  ids: ResolvedCatalogueContextIds = resolveCatalogueContextIds(pageScope),
): ResolvedCatalogueContextIds {
  if (pageScope === 'branch') {
    if (ids.branchId == null) {
      throw new ApiError('Branch is required to create a category for this account.', 400);
    }
    return ids;
  }

  if (ids.companyId == null) {
    throw new ApiError('Company context is required to create a category.', 403);
  }

  return ids;
}

/**
 * POST /v1/restaurant/menu/categories body + implied headers (see resolveUpstreamContextHeaders).
 *
 * Branch workspace (X-Branch-Id): name/description only — never `scope: company`.
 * Company workspace (X-Company-Id, no branch header): name/description only for company categories.
 * Company creating a branch category: scope `branch` + assign_branch_id (not used in branch-manager UI).
 */
export function buildCreateMenuCategoryBody(input: {
  name: string;
  description?: string;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
  companyId?: number;
  /** When true from company workspace, create a branch-scoped category for this branch. */
  assignBranchId?: number;
}): CreateMenuCategoryBody {
  const ids = assertCatalogueContextForCategoryCreate(input.pageScope, {
    companyId: input.companyId,
    branchId: input.branchId,
  });

  const base = {
    name: input.name.trim(),
    ...(input.description?.trim() ? { description: input.description.trim() } : {}),
  };

  if (input.pageScope === 'branch') {
    return createMenuCategoryBodySchema.parse(base);
  }

  if (input.assignBranchId != null && input.assignBranchId > 0) {
    return createMenuCategoryBodySchema.parse({
      ...base,
      scope: 'branch',
      assign_branch_id: input.assignBranchId,
    });
  }

  if (input.pageScope === 'company' || input.pageScope === 'organization') {
    void ids.companyId;
    return createMenuCategoryBodySchema.parse(base);
  }

  return createMenuCategoryBodySchema.parse(base);
}
