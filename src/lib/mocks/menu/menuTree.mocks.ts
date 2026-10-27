import { MOCK_MENUS } from '@/lib/mocks/menu/menu.mocks';
import { MOCK_MENU_ITEMS } from '@/lib/mocks/menu/useMenuCreation.mocks';
import {
  branchMenuTreeDataSchema,
  companyMenuTreeDataSchema,
  parseCompanyMenuTree,
} from '@/lib/schemas/menu/menus/menuTreeSchema';
import type { HttpMethod, QueryParams } from '@/services/api/types';

type MockRequest = {
  method: HttpMethod;
  path: string;
  params?: QueryParams;
};

const COMPANY_MENU_TREE_RE = /^\/v1\/restaurant\/menus\/(\d+)\/tree$/;
const BRANCH_MENU_TREE_RE = /^\/v1\/restaurant\/branches\/(\d+)\/menus\/(\d+)\/tree$/;

function buildCompanyMenuTree(menuId: number) {
  const byCategory = new Map<number, typeof MOCK_MENU_ITEMS>();
  for (const item of MOCK_MENU_ITEMS) {
    const list = byCategory.get(item.category_id) ?? [];
    list.push(item);
    byCategory.set(item.category_id, list);
  }

  let assignmentCounter = 1;
  const categories = [...byCategory.entries()].map(([categoryId, items]) => ({
    assignment_id: assignmentCounter++,
    display_order: categoryId,
    category: {
      id: categoryId,
      name: `Category ${categoryId}`,
      status: 'active',
    },
    items: items.map((item) => ({
      id: item.id,
      category_id: item.category_id,
      name: item.name,
      code: item.code,
      description: item.description,
      sku: item.sku,
      base_price: item.base_price,
      dietary_type: item.dietary_type,
      status: item.status,
      allow_dine_in: item.allow_dine_in,
      allow_takeaway: item.allow_takeaway,
      allow_delivery: item.allow_delivery,
      is_favorite: item.is_favorite,
      variants: item.variants.map((variant) => ({
        id: variant.id,
        name: variant.name,
        final_price: variant.final_price,
        is_default: variant.is_default,
      })),
      modifier_groups: item.modifier_groups.map((group) => ({
        id: group.id,
        modifier_group_id: group.modifier_group_id,
        modifier_group: group.modifier_group
          ? {
              id: group.modifier_group.id,
              name: group.modifier_group.name,
              min_select: group.modifier_group.min_select,
              max_select: group.modifier_group.max_select,
              is_required: group.modifier_group.is_required,
              options: (group.modifier_group.options ?? []).map((option) => ({
                id: option.id,
                name: option.name,
                price_delta: option.price_delta,
              })),
            }
          : undefined,
      })),
      preparation_stations: item.preparation_stations.map((station) => ({
        id: station.id,
        preparation_station_id: station.preparation_station_id,
        preparation_station: station.preparation_station,
      })),
      images: item.images.map((image) => ({
        id: image.id,
        url: image.url,
        is_primary: image.is_primary,
      })),
    })),
  }));

  return companyMenuTreeDataSchema.parse({
    menu: {
      id: menuId,
      name: 'Menu',
      catalogue_scope: 'company',
      status: 'active',
    },
    categories,
  });
}

function buildBranchMenuTree(branchId: number, assignmentId: number, categoryFilter?: number) {
  const assignment = MOCK_MENUS.find((row) => row.id === assignmentId);
  const menuId = assignment?.menu_id ?? assignmentId;
  const companyTree = buildCompanyMenuTree(menuId);

  const branchMenuIdBase = assignmentId * 1000;

  const categories = companyTree.categories
    .filter((row) => (categoryFilter ? row.category.id === categoryFilter : true))
    .map((row) => ({
      assignment_id: row.assignment_id,
      display_order: row.display_order,
      category: row.category,
      items: row.items.map((item) => ({
        branch_menu_id: branchMenuIdBase + (row.assignment_id ?? row.category.id),
        item_override_id: branchMenuIdBase + item.id,
        menu_item_id: item.id,
        name: item.name,
        code: item.code,
        description: item.description,
        sku: item.sku,
        dietary_type: item.dietary_type,
        effective_price: item.base_price,
        is_favorite: item.is_favorite,
        variants: item.variants.map((variant) => ({
          menu_item_variant_id: variant.id,
          name: variant.name,
          effective_final_price: variant.final_price,
          is_default: variant.is_default,
        })),
        modifier_groups: item.modifier_groups.map((group) => ({
          modifier_group_id: group.modifier_group_id,
          name: group.modifier_group?.name ?? 'Modifiers',
          options: (group.modifier_group?.options ?? []).map((option) => ({
            modifier_option_id: option.id,
            name: option.name,
            effective_price_delta: Number(option.price_delta ?? 0),
          })),
        })),
        prep_stations: item.preparation_stations.map((station) => ({
          preparation_station_id:
            station.preparation_station_id ?? station.preparation_station?.id ?? 1,
          name: station.preparation_station?.name ?? 'Kitchen',
          code: station.preparation_station?.code,
        })),
        images: item.images,
      })),
    }));

  return branchMenuTreeDataSchema.parse({
    assignment_id: assignmentId,
    branch_id: branchId,
    menu: {
      id: menuId,
      name: assignment?.menu.name ?? 'Branch menu',
      catalogue_scope: 'branch',
      branch_id: branchId,
      status: 'active',
    },
    categories,
  });
}

/** GET menu tree mocks for company + branch assignment trees. */
export function resolveMenuTreeMock(request: MockRequest): unknown | undefined {
  if (request.method !== 'GET') return undefined;

  const branchMatch = BRANCH_MENU_TREE_RE.exec(request.path);
  if (branchMatch) {
    const branchId = Number(branchMatch[1]);
    const assignmentId = Number(branchMatch[2]);
    const categoryFilter =
      request.params?.category_id != null ? Number(request.params.category_id) : undefined;
    const data = buildBranchMenuTree(branchId, assignmentId, categoryFilter);
    return {
      success: true,
      data,
      message: 'OK',
      request_id: 'mock-branch-menu-tree',
    };
  }

  const companyMatch = COMPANY_MENU_TREE_RE.exec(request.path);
  if (companyMatch) {
    const menuId = Number(companyMatch[1]);
    const data = buildCompanyMenuTree(menuId);
    const payload = {
      success: true,
      data,
      message: 'OK',
      request_id: 'mock-company-menu-tree',
    };
    parseCompanyMenuTree(payload);
    return payload;
  }

  return undefined;
}
