import { z } from 'zod';

import { dietaryTypeApiSchema } from '@/lib/schemas/menu/menuItemsSchema';
import { ApiError } from '@/services/api/types';

const nullableText = z.string().nullable().optional();
const coerceInt = z.coerce.number().int();
const coerceNum = z.coerce.number();

const menuTreeMenuSchema = z.object({
  id: coerceInt,
  organization_id: coerceInt.optional(),
  company_id: coerceInt.optional(),
  catalogue_scope: z.string().optional(),
  branch_id: coerceInt.nullable().optional(),
  name: z.string(),
  code: nullableText,
  description: nullableText,
  menu_type: z.string().optional(),
  display_order: coerceInt.optional(),
  status: z.string().optional(),
  branch_assignment_id: coerceInt.nullable().optional(),
  created_at: nullableText,
  updated_at: nullableText,
});

const menuTreeCategoryRefSchema = z.object({
  id: coerceInt,
  name: z.string(),
  status: z.string().optional(),
});

const menuTreeImageSchema = z.object({
  id: coerceInt.optional(),
  url: nullableText,
  is_primary: z.boolean().optional(),
  sort_order: coerceInt.optional(),
});

const branchMenuTreeVariantSchema = z.object({
  menu_item_variant_id: coerceInt,
  name: z.string(),
  sku: nullableText,
  is_default: z.boolean().optional(),
  effective_price_adjustment: coerceNum.optional(),
  effective_final_price: coerceNum.optional(),
  display_order: coerceInt.optional(),
});

const companyMenuTreeVariantSchema = z.object({
  id: coerceInt,
  name: z.string(),
  sku: nullableText,
  is_default: z.boolean().optional(),
  price_adjustment: coerceNum.optional(),
  final_price: coerceNum.optional(),
  display_order: coerceInt.optional(),
});

const branchMenuTreeModifierOptionSchema = z.object({
  modifier_option_id: coerceInt,
  name: z.string(),
  effective_price_delta: coerceNum.optional(),
  display_order: coerceInt.optional(),
});

const branchMenuTreeModifierGroupSchema = z.object({
  modifier_group_id: coerceInt,
  name: z.string(),
  min_select: coerceInt.optional(),
  max_select: coerceInt.optional(),
  is_required: z.boolean().optional(),
  display_order: coerceInt.optional(),
  options: z.array(branchMenuTreeModifierOptionSchema).default([]),
});

const companyMenuTreeModifierGroupSchema = z.object({
  id: coerceInt.optional(),
  modifier_group_id: coerceInt,
  display_order: coerceInt.optional(),
  modifier_group: z
    .object({
      id: coerceInt,
      name: z.string(),
      min_select: coerceInt.optional(),
      max_select: coerceInt.optional(),
      is_required: z.boolean().optional(),
      options: z
        .array(
          z.object({
            id: coerceInt,
            name: z.string(),
            price_delta: coerceNum.optional(),
            display_order: coerceInt.optional(),
          }),
        )
        .optional()
        .default([]),
    })
    .optional(),
});

const branchMenuTreePrepStationSchema = z.object({
  preparation_station_id: coerceInt,
  name: z.string().optional(),
  code: nullableText,
  effective_default_order: coerceInt.optional(),
});

const companyMenuTreePrepStationSchema = z.object({
  id: coerceInt.optional(),
  preparation_station_id: coerceInt,
  default_order: coerceInt.optional(),
  preparation_station: z
    .object({
      id: coerceInt,
      name: z.string(),
      code: nullableText,
    })
    .optional(),
});

export const branchMenuTreeItemSchema = z.object({
  branch_menu_id: coerceInt,
  /** Sent as POST …/orders/{id}/items `branch_menu_item_id` for branch-scope menus. */
  item_override_id: coerceInt.positive(),
  menu_item_id: coerceInt,
  name: z.string(),
  code: nullableText,
  description: nullableText,
  sku: nullableText,
  dietary_type: dietaryTypeApiSchema.optional(),
  effective_price: coerceNum,
  profit_margin_percent: coerceNum.nullable().optional(),
  allow_dine_in: z.boolean().optional(),
  allow_takeaway: z.boolean().optional(),
  allow_delivery: z.boolean().optional(),
  expose_captain_app: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  is_combo: z.boolean().optional(),
  tag_ids: z.array(coerceInt).optional(),
  display_order: coerceInt.optional(),
  variants: z.array(branchMenuTreeVariantSchema).default([]),
  modifier_groups: z.array(branchMenuTreeModifierGroupSchema).default([]),
  prep_stations: z.array(branchMenuTreePrepStationSchema).default([]),
  images: z.array(menuTreeImageSchema).default([]),
});

export const companyMenuTreeItemSchema = z.object({
  id: coerceInt,
  category_id: coerceInt,
  name: z.string(),
  code: nullableText,
  description: nullableText,
  sku: nullableText,
  barcode: nullableText,
  base_price: coerceNum,
  profit_margin_percent: coerceNum.nullable().optional(),
  allow_dine_in: z.boolean().optional(),
  allow_takeaway: z.boolean().optional(),
  allow_delivery: z.boolean().optional(),
  expose_captain_app: z.boolean().optional(),
  is_favorite: z.boolean().optional(),
  is_combo: z.boolean().optional(),
  tag_ids: z.array(coerceInt).optional(),
  dietary_type: dietaryTypeApiSchema.optional(),
  status: z.string().optional(),
  variants: z.array(companyMenuTreeVariantSchema).default([]),
  modifier_groups: z.array(companyMenuTreeModifierGroupSchema).default([]),
  preparation_stations: z.array(companyMenuTreePrepStationSchema).default([]),
  images: z.array(menuTreeImageSchema).default([]),
});

const menuTreeCategoryBranchSchema = z.object({
  assignment_id: coerceInt,
  display_order: coerceInt.optional(),
  category: menuTreeCategoryRefSchema,
  items: z.array(branchMenuTreeItemSchema).default([]),
});

const menuTreeCategoryCompanySchema = z.object({
  assignment_id: coerceInt.optional(),
  display_order: coerceInt.optional(),
  category: menuTreeCategoryRefSchema,
  items: z.array(companyMenuTreeItemSchema).default([]),
});

export const branchMenuTreeDataSchema = z.object({
  assignment_id: coerceInt,
  branch_id: coerceInt,
  menu: menuTreeMenuSchema,
  categories: z.array(menuTreeCategoryBranchSchema).default([]),
});

export const companyMenuTreeDataSchema = z.object({
  menu: menuTreeMenuSchema,
  categories: z.array(menuTreeCategoryCompanySchema).default([]),
});

export type BranchMenuTreeItem = z.infer<typeof branchMenuTreeItemSchema>;
export type CompanyMenuTreeItem = z.infer<typeof companyMenuTreeItemSchema>;
export type BranchMenuTreeData = z.infer<typeof branchMenuTreeDataSchema>;
export type CompanyMenuTreeData = z.infer<typeof companyMenuTreeDataSchema>;

export type MenuTreeScope = 'branch' | 'company';

export type PosMenuCatalogRow = {
  posKey: string;
  menuItemId: number;
  /** Branch tree `item_override_id` → POST …/items `branch_menu_item_id`. */
  itemOverrideId?: number;
  branchMenuItemId: number;
  branchMenuId?: number;
  categoryId: number;
  categoryAssignmentId?: number;
  categoryName?: string;
  name: string;
  basePrice: number;
  isFavorite: boolean;
  imageUrl?: string;
  variants: Array<{ variantId: number; name: string; price: number; isDefault: boolean }>;
  modifierGroups: Array<{
    modifierGroupId: number;
    linkId?: number;
    options: Array<{ optionId: number; name: string; priceDelta: number }>;
  }>;
  preparationStationId?: number;
};

export type MenuTreeCategoryView = {
  assignmentId: number;
  categoryId: number;
  categoryName: string;
  displayOrder: number;
  items: PosMenuCatalogRow[];
};

export type NormalizedMenuTree = {
  scope: MenuTreeScope;
  menuId: number;
  assignmentId?: number;
  branchId?: number;
  categories: MenuTreeCategoryView[];
};

const successEnvelopeSchema = z.object({
  success: z.boolean(),
  data: z.unknown().nullable().optional(),
  message: nullableText,
  request_id: nullableText,
});

function branchTreeItemToCatalogRow(
  item: BranchMenuTreeItem,
  categoryId: number,
  categoryAssignmentId: number,
  categoryName: string,
): PosMenuCatalogRow {
  const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
  const defaultVariant = item.variants.find((v) => v.is_default) ?? item.variants[0];
  const basePrice = defaultVariant?.effective_final_price ?? item.effective_price;

  return {
    posKey: String(item.menu_item_id),
    menuItemId: item.menu_item_id,
    itemOverrideId: item.item_override_id,
    branchMenuItemId: item.item_override_id,
    branchMenuId: item.branch_menu_id,
    categoryId,
    categoryAssignmentId,
    categoryName,
    name: item.name,
    basePrice,
    isFavorite: Boolean(item.is_favorite),
    imageUrl: primaryImage?.url ?? undefined,
    variants: item.variants.map((variant) => ({
      variantId: variant.menu_item_variant_id,
      name: variant.name,
      price: variant.effective_final_price ?? item.effective_price,
      isDefault: Boolean(variant.is_default),
    })),
    modifierGroups: item.modifier_groups.map((group) => ({
      modifierGroupId: group.modifier_group_id,
      options: group.options.map((option) => ({
        optionId: option.modifier_option_id,
        name: option.name,
        priceDelta: option.effective_price_delta ?? 0,
      })),
    })),
    preparationStationId: item.prep_stations[0]?.preparation_station_id,
  };
}

function companyTreeItemToCatalogRow(
  item: CompanyMenuTreeItem,
  categoryId: number,
  categoryName: string,
  categoryAssignmentId?: number,
): PosMenuCatalogRow {
  const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
  const defaultVariant = item.variants.find((v) => v.is_default) ?? item.variants[0];
  const basePrice = defaultVariant?.final_price ?? item.base_price;

  return {
    posKey: String(item.id),
    menuItemId: item.id,
    branchMenuItemId: item.id,
    categoryId,
    categoryAssignmentId,
    categoryName,
    name: item.name,
    basePrice,
    isFavorite: Boolean(item.is_favorite),
    imageUrl: primaryImage?.url ?? undefined,
    variants: item.variants.map((variant) => ({
      variantId: variant.id,
      name: variant.name,
      price: variant.final_price ?? item.base_price,
      isDefault: Boolean(variant.is_default),
    })),
    modifierGroups: item.modifier_groups.map((group) => ({
      modifierGroupId: group.modifier_group_id,
      linkId: group.id,
      options: (group.modifier_group?.options ?? []).map((option) => ({
        optionId: option.id,
        name: option.name,
        priceDelta: Number(option.price_delta ?? 0),
      })),
    })),
    preparationStationId:
      item.preparation_stations[0]?.preparation_station_id ??
      item.preparation_stations[0]?.preparation_station?.id,
  };
}

function normalizeBranchMenuTree(data: BranchMenuTreeData): NormalizedMenuTree {
  const categories: MenuTreeCategoryView[] = data.categories.map((row) => ({
    assignmentId: row.assignment_id,
    categoryId: row.category.id,
    categoryName: row.category.name,
    displayOrder: row.display_order ?? 0,
    items: row.items.map((item) =>
      branchTreeItemToCatalogRow(item, row.category.id, row.assignment_id, row.category.name),
    ),
  }));

  return {
    scope: 'branch',
    menuId: data.menu.id,
    assignmentId: data.assignment_id,
    branchId: data.branch_id,
    categories,
  };
}

function normalizeCompanyMenuTree(data: CompanyMenuTreeData): NormalizedMenuTree {
  const categories: MenuTreeCategoryView[] = data.categories.map((row) => ({
    assignmentId: row.assignment_id ?? row.category.id,
    categoryId: row.category.id,
    categoryName: row.category.name,
    displayOrder: row.display_order ?? 0,
    items: row.items.map((item) =>
      companyTreeItemToCatalogRow(item, row.category.id, row.category.name, row.assignment_id),
    ),
  }));

  return {
    scope: 'company',
    menuId: data.menu.id,
    categories,
  };
}

export function parseBranchMenuTree(payload: unknown): NormalizedMenuTree {
  const envelope = successEnvelopeSchema.safeParse(payload);
  const raw = envelope.success && envelope.data.success ? envelope.data.data : payload;
  const parsed = branchMenuTreeDataSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError('Unexpected branch menu tree response', 502);
  }
  return normalizeBranchMenuTree(parsed.data);
}

export function parseCompanyMenuTree(payload: unknown): NormalizedMenuTree {
  const envelope = successEnvelopeSchema.safeParse(payload);
  const raw = envelope.success && envelope.data.success ? envelope.data.data : payload;
  const parsed = companyMenuTreeDataSchema.safeParse(raw);
  if (!parsed.success) {
    throw new ApiError('Unexpected menu tree response', 502);
  }
  return normalizeCompanyMenuTree(parsed.data);
}
