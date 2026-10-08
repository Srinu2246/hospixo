import type { ItemVariant } from '../types/menu';
import type {
  CreateMenuItemVariantApiRequest,
  MenuItemVariantApi,
  UpdateMenuItemVariantApiRequest,
} from '../types/menu-item-variant-api';

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

export function isMenuItemVariantApi(value: unknown): value is MenuItemVariantApi {
  if (!isRecord(value)) return false;
  if (typeof value.id !== 'number' && typeof value.id !== 'string') return false;
  if (typeof value.name !== 'string' || !value.name.trim()) return false;
  return typeof value.price_adjustment === 'number' || typeof value.final_price === 'number';
}

function mapVariantStatus(status: MenuItemVariantApi['status'] | undefined): ItemVariant['status'] {
  return status === 'active' ? 'Active' : 'Inactive';
}

export function mapMenuItemVariantApi(variant: MenuItemVariantApi): ItemVariant {
  return {
    id: String(variant.id),
    size: variant.name,
    price:
      typeof variant.price_adjustment === 'number'
        ? variant.price_adjustment
        : (variant.final_price ?? 0),
    status: mapVariantStatus(variant.status),
  };
}

export function mapMenuItemVariantsApi(variants: readonly MenuItemVariantApi[]): ItemVariant[] {
  return variants.map(mapMenuItemVariantApi);
}

export function unwrapMenuItemVariantList(data: unknown): MenuItemVariantApi[] {
  if (Array.isArray(data)) {
    return data.filter(isMenuItemVariantApi);
  }

  if (!isRecord(data)) return [];

  for (const key of ['variants', 'items', 'data'] as const) {
    const nested = data[key];
    if (Array.isArray(nested)) {
      return nested.filter(isMenuItemVariantApi);
    }
  }

  return isMenuItemVariantApi(data) ? [data] : [];
}

export function unwrapCreatedMenuItemVariant(data: unknown): MenuItemVariantApi {
  if (isMenuItemVariantApi(data)) return data;

  if (isRecord(data)) {
    if (isMenuItemVariantApi(data.variant)) return data.variant;
    if (isMenuItemVariantApi(data.data)) return data.data;
  }

  const listed = unwrapMenuItemVariantList(data);
  const created = listed.at(-1);
  if (created) return created;

  throw new Error('Invalid menu item variant response');
}

export function findCreatedMenuItemVariant(
  variants: readonly ItemVariant[],
  body: Pick<CreateMenuItemVariantApiRequest, 'name' | 'price_adjustment'>,
): ItemVariant | undefined {
  const name = body.name.trim().toLowerCase();
  const matches = variants.filter((variant) => variant.size.trim().toLowerCase() === name);
  if (matches.length === 0) return undefined;

  const priceMatches = matches.filter((variant) => variant.price === body.price_adjustment);
  if (priceMatches.length === 0) return undefined;

  return [...priceMatches].sort((left, right) => Number(right.id) - Number(left.id))[0];
}

export function toCreateMenuItemVariantPayload(
  variant: Pick<ItemVariant, 'size' | 'price'> & {
    displayOrder?: number;
    sku?: string;
    isDefault?: boolean;
  },
): CreateMenuItemVariantApiRequest {
  return {
    name: variant.size.trim(),
    price_adjustment: variant.price,
    display_order: variant.displayOrder,
    sku: variant.sku?.trim() || undefined,
    is_default: variant.isDefault,
    scope: 'company',
    assign_branch_id: null,
  };
}

type Writable<T> = { -readonly [P in keyof T]: T[P] };

export function toUpdateMenuItemVariantPayload(updates: {
  size?: string;
  price?: number;
  displayOrder?: number;
  sku?: string | null;
  isDefault?: boolean;
}): UpdateMenuItemVariantApiRequest {
  const payload: Writable<UpdateMenuItemVariantApiRequest> = {};

  if (updates.size !== undefined) payload.name = updates.size.trim();
  if (updates.price !== undefined) payload.price_adjustment = updates.price;
  if (updates.displayOrder !== undefined) payload.display_order = updates.displayOrder;
  if (updates.sku !== undefined) payload.sku = updates.sku?.trim() || undefined;
  if (updates.isDefault !== undefined) payload.is_default = updates.isDefault;

  return payload;
}
