import type { CreateCategoryInput, MenuCategory } from '../types/menu';
import type {
  CreateMenuCategoryApiRequest,
  MenuCategoryApi,
  MenuCategoryApiStatus,
  MenuCategoryScope,
  UpdateMenuCategoryApiRequest,
} from '../types/menu-category-api';
import type { MenuScope } from '../lib/menu-store';

function mapStatus(status: MenuCategoryApiStatus): MenuCategory['status'] {
  return status === 'active' ? 'Active' : 'Inactive';
}

export function mapMenuCategoryApi(category: MenuCategoryApi): MenuCategory {
  return {
    id: String(category.id),
    name: category.name,
    parentId: category.parent_id != null ? String(category.parent_id) : undefined,
    status: mapStatus(category.status),
    description: category.description ?? undefined,
    displayOrder: category.display_order,
    scope: category.scope,
    assignBranchId:
      category.assign_branch_id != null ? String(category.assign_branch_id) : undefined,
  };
}

export function mapMenuCategoriesApi(categories: readonly MenuCategoryApi[]): MenuCategory[] {
  return categories.map(mapMenuCategoryApi);
}

export type CreateMenuCategoryPayloadOptions = Readonly<{
  displayOrder?: number;
  scope: MenuScope;
  assignBranchId?: number | null;
}>;

function resolveMenuCategoryScope(scope: MenuScope): MenuCategoryScope {
  return scope === 'company' ? 'company' : 'branch';
}

export function toCreateMenuCategoryPayload(
  input: CreateCategoryInput,
  options: CreateMenuCategoryPayloadOptions,
): CreateMenuCategoryApiRequest {
  const assignBranchId =
    input.assignBranchId != null && input.assignBranchId !== ''
      ? Number(input.assignBranchId)
      : (options.assignBranchId ?? null);

  return {
    name: input.name.trim(),
    description: input.description?.trim() || undefined,
    parent_id: input.parentId ? Number(input.parentId) : null,
    ...(options.displayOrder !== undefined ? { display_order: options.displayOrder } : {}),
    scope: input.scope ?? resolveMenuCategoryScope(options.scope),
    assign_branch_id: assignBranchId,
  };
}

export function toUpdateMenuCategoryPayload(
  input: Partial<CreateCategoryInput> & { displayOrder?: number },
): UpdateMenuCategoryApiRequest {
  return {
    ...(input.name !== undefined ? { name: input.name.trim() } : {}),
    ...(input.description !== undefined ? { description: input.description.trim() || null } : {}),
    ...(input.parentId !== undefined
      ? { parent_id: input.parentId ? Number(input.parentId) : null }
      : {}),
    ...(input.displayOrder !== undefined ? { display_order: input.displayOrder } : {}),
    ...(input.scope !== undefined ? { scope: input.scope } : {}),
    ...(input.assignBranchId !== undefined
      ? {
          assign_branch_id: input.assignBranchId !== '' ? Number(input.assignBranchId) : null,
        }
      : {}),
  };
}

export function unwrapMenuCategoryList(
  data: MenuCategoryApi[] | { items?: MenuCategoryApi[] } | null | undefined,
): MenuCategoryApi[] {
  if (Array.isArray(data)) return data;
  return data?.items ?? [];
}
