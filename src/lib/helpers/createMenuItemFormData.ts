import type { MenuCataloguePageScope } from '@/lib/helpers/menuBranchContext';
import type { CreateMenuItemFormValues } from '@/lib/schemas/menu/menuCreationSchema';
import {
  createMenuItemBodySchema,
  type CreateMenuItemBody,
} from '@/lib/schemas/menu/createMenuItemSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import { ApiError } from '@/services/api/types';

export type BuildCreateMenuItemFormDataInput = Readonly<{
  values: CreateMenuItemFormValues;
  pageScope: MenuCataloguePageScope;
  branchId?: number;
  imageFile?: File | null;
  imageIsPrimary?: boolean;
  /** Resolve tag label → tag definition id from existing menu items. */
  tagNameToId?: ReadonlyMap<string, number>;
  /** Tag ids selected on the form (includes newly created tags). */
  tagIdsByName?: Readonly<Record<string, number>>;
}>;

const OPERATIONAL_TAG_LABELS = new Set(['set as favorite', 'set as combo']);

export function buildTagNameToIdMap(items: readonly MenuItemResponse[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const item of items) {
    for (const tag of item.tags) {
      const key = tag.name.trim().toLowerCase();
      if (key && !map.has(key)) {
        map.set(key, tag.id);
      }
    }
  }
  return map;
}

function dietaryTypeToApi(
  dietary: CreateMenuItemFormValues['dietaryType'],
): CreateMenuItemBody['dietary_type'] {
  if (dietary === 'Non-Veg') return 'non_veg';
  if (dietary === 'Egg') return 'egg';
  return 'veg';
}

function parseGstRateId(gst: string | undefined): number {
  const trimmed = gst?.trim() ?? '';
  const id = Number(trimmed);
  if (!Number.isFinite(id) || id <= 0) {
    throw new ApiError('Enter a valid GST rate id (numeric).', 400);
  }
  return id;
}

function resolveTagIds(
  tags: readonly string[],
  tagNameToId: ReadonlyMap<string, number> | undefined,
  tagIdsByName: Readonly<Record<string, number>> | undefined,
): number[] {
  const ids: number[] = [];
  const seen = new Set<number>();
  for (const label of tags) {
    const key = label.trim().toLowerCase();
    if (!key || OPERATIONAL_TAG_LABELS.has(key)) continue;
    const id = tagIdsByName?.[key] ?? tagNameToId?.get(key);
    if (id != null && id > 0 && !seen.has(id)) {
      seen.add(id);
      ids.push(id);
    }
  }
  return ids;
}

function mapModifierGroups(
  modifiers: CreateMenuItemFormValues['modifiers'],
): CreateMenuItemBody['modifier_groups'] {
  const groups: CreateMenuItemBody['modifier_groups'] = [];

  modifiers.forEach((modifier, index) => {
    const groupId =
      modifier.modifierGroupId ??
      (Number.isInteger(Number(modifier.id)) && Number(modifier.id) > 0
        ? Number(modifier.id)
        : undefined);

    if (groupId == null || groupId <= 0) return;

    groups.push({
      modifier_group_id: groupId,
      display_order: index,
    });
  });

  return groups;
}

function mapVariants(values: CreateMenuItemFormValues): CreateMenuItemBody['variants'] {
  const basePrice = values.itemPrice;
  return values.variants.map((variant, index) => ({
    name: variant.name.trim(),
    price_adjustment: variant.price - basePrice,
    final_price: variant.price,
    display_order: index,
    is_default: index === 0,
  }));
}

export function buildCreateMenuItemBody(
  input: BuildCreateMenuItemFormDataInput,
): CreateMenuItemBody {
  const { values, pageScope, branchId, tagNameToId, tagIdsByName } = input;
  const categoryId = Number(values.category);
  if (!Number.isFinite(categoryId) || categoryId <= 0) {
    throw new ApiError('Select a valid category.', 400);
  }

  const scope = pageScope === 'branch' ? 'branch' : pageScope === 'company' ? 'company' : undefined;

  const profitRaw = values.profitMargin?.trim();
  const profitMargin = profitRaw && profitRaw.length > 0 ? Number(profitRaw) : undefined;

  const body: CreateMenuItemBody = {
    name: values.name.trim(),
    code: values.code.trim(),
    category_id: categoryId,
    taxes: [{ gst_rate_id: parseGstRateId(values.gst), is_inclusive: false }],
    preparation_stations: [],
    modifier_groups: mapModifierGroups(values.modifiers),
    variants: mapVariants(values),
    tag_ids: resolveTagIds(values.tags, tagNameToId, tagIdsByName),
    image_ids: [],
    base_price: values.itemPrice,
    profit_margin_percent:
      profitMargin != null && Number.isFinite(profitMargin) ? profitMargin : undefined,
    allow_dine_in: values.orderTypes.some((type) => type.toLowerCase().includes('dine')),
    allow_takeaway: values.orderTypes.some((type) => type.toLowerCase().includes('take')),
    allow_delivery: values.orderTypes.some((type) => type.toLowerCase().includes('deliver')),
    expose_captain_app: values.exposedIn.some((channel) =>
      channel.toLowerCase().includes('captain'),
    ),
    is_favorite: values.tags.some((t) => t.toLowerCase() === 'set as favorite'),
    is_combo: values.tags.some((t) => t.toLowerCase() === 'set as combo'),
    dietary_type: dietaryTypeToApi(values.dietaryType),
    description: values.description?.trim() || undefined,
    sku: values.code.trim() || undefined,
  };

  if (scope) {
    body.scope = scope;
    if (scope === 'branch' && branchId != null && branchId > 0) {
      body.assign_branch_id = branchId;
    }
  }

  return createMenuItemBodySchema.parse(body);
}

/** Multipart POST /v1/restaurant/menu/items — scalar fields + JSON array strings + optional image. */
function buildCreateMenuItemFormData(input: BuildCreateMenuItemFormDataInput): FormData {
  const body = buildCreateMenuItemBody(input);
  const form = new FormData();

  form.append('name', body.name);
  form.append('code', body.code);
  form.append('category_id', String(body.category_id));
  form.append('taxes', JSON.stringify(body.taxes));
  form.append('preparation_stations', JSON.stringify(body.preparation_stations));
  form.append('modifier_groups', JSON.stringify(body.modifier_groups));
  form.append('variants', JSON.stringify(body.variants));
  form.append('tag_ids', JSON.stringify(body.tag_ids));
  form.append('image_ids', JSON.stringify(body.image_ids));
  form.append('base_price', String(body.base_price));

  if (body.profit_margin_percent != null && Number.isFinite(body.profit_margin_percent)) {
    form.append('profit_margin_percent', String(body.profit_margin_percent));
  }

  form.append('allow_dine_in', String(body.allow_dine_in));
  form.append('allow_takeaway', String(body.allow_takeaway));
  form.append('allow_delivery', String(body.allow_delivery));
  form.append('expose_captain_app', String(body.expose_captain_app));
  form.append('is_favorite', String(body.is_favorite));
  form.append('is_combo', String(body.is_combo));
  form.append('dietary_type', body.dietary_type);

  if (body.description) form.append('description', body.description);
  if (body.sku) form.append('sku', body.sku);
  if (body.barcode) form.append('barcode', body.barcode);
  if (body.scope) form.append('scope', body.scope);
  if (body.assign_branch_id != null) {
    form.append('assign_branch_id', String(body.assign_branch_id));
  }

  if (input.imageFile) {
    form.append('image', input.imageFile);
    form.append('image_is_primary', String(input.imageIsPrimary ?? true));
  }

  return form;
}
