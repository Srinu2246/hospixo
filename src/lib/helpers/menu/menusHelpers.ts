import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import type {
  CreateRestaurantMenuBody,
  MenuAssignment,
  MenuSessionFormValues,
  RestaurantMenuRecord,
} from '@/lib/schemas/menu/menus/menusSchema';
import { createRestaurantMenuBodySchema } from '@/lib/schemas/menu/menus/menusSchema';
import { ApiError } from '@/services/api/types';

/** Map GET /v1/restaurant/menus rows into cards that expect branch-assignment shape. */
export function restaurantMenuRecordToAssignment(record: RestaurantMenuRecord): MenuAssignment {
  const statusRaw = record.status ?? 'active';
  const status = statusRaw.toLowerCase() === 'inactive' ? 'inactive' : 'active';

  return {
    id: record.id,
    organization_id: record.organization_id,
    company_id: record.company_id,
    branch_id: record.branch_id ?? null,
    menu_id: record.id,
    display_order: record.display_order ?? 0,
    is_default: false,
    status,
    menu: {
      id: record.id,
      organization_id: record.organization_id,
      company_id: record.company_id,
      catalogue_scope: record.catalogue_scope,
      branch_id: record.branch_id,
      name: record.name,
      code: record.code,
      description: record.description,
      menu_type: record.menu_type ?? 'all',
      display_order: record.display_order ?? 0,
      status,
      branch_assignment_id: record.branch_assignment_id,
      created_at: record.created_at,
      updated_at: record.updated_at,
    },
    created_at: record.created_at,
    updated_at: record.updated_at,
  };
}

function normalizeMenuType(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[\s-]+/g, '_');
}

export function buildCreateRestaurantMenuBody(input: {
  values: MenuSessionFormValues;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
}): CreateRestaurantMenuBody {
  const base = {
    name: input.values.name.trim(),
    menu: input.values.menu,
    code: input.values.code.trim(),
    description: input.values.description?.trim() || undefined,
    menu_type: normalizeMenuType(input.values.menuType),
    display_order: 0,
  };

  if (input.pageScope === 'company' || input.pageScope === 'organization') {
    return createRestaurantMenuBodySchema.parse(base);
  }

  if (input.pageScope === 'branch') {
    if (input.branchId == null || input.branchId <= 0) {
      throw new ApiError('Branch is required to create a menu for this account.', 400);
    }
    return createRestaurantMenuBodySchema.parse({
      ...base,
      scope: 'branch',
      assign_branch_id: input.branchId,
    });
  }

  return createRestaurantMenuBodySchema.parse(base);
}
