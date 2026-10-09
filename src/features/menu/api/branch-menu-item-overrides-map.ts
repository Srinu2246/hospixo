import type { CreateMenuItemInput, MenuItem, OrderType } from '@/features/menu/types/menu';
import type {
  BranchMenuItemModifierOptionResponse,
  BranchMenuItemOverrideApi,
  BranchMenuItemVariantResponse,
  UpdateBranchMenuItemOverrideApiRequest,
} from '@/features/menu/types/branch-menu-item-api';
import { fromApiDietaryType } from './menu-items-map';

function unwrapBranchMenuItemOverrideApi(
  raw:
    | BranchMenuItemOverrideApi
    | { item?: BranchMenuItemOverrideApi; data?: BranchMenuItemOverrideApi },
): BranchMenuItemOverrideApi {
  if (raw && typeof raw === 'object' && !('id' in raw)) {
    if ('item' in raw && raw.item && typeof raw.item === 'object') {
      return raw.item;
    }
    if ('data' in raw && raw.data && typeof raw.data === 'object') {
      return raw.data;
    }
  }
  return raw as BranchMenuItemOverrideApi;
}

export function unwrapBranchMenuItemOverrideList(
  data: BranchMenuItemOverrideApi[] | { items: BranchMenuItemOverrideApi[] } | unknown,
): BranchMenuItemOverrideApi[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { items: unknown[] }).items)) {
    return (data as { items: BranchMenuItemOverrideApi[] }).items;
  }
  return [];
}

export function unwrapBranchMenuItemVariantList(
  data: BranchMenuItemVariantResponse[] | { items: BranchMenuItemVariantResponse[] } | unknown,
): BranchMenuItemVariantResponse[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { items: unknown[] }).items)) {
    return (data as { items: BranchMenuItemVariantResponse[] }).items;
  }
  return [];
}

export function unwrapBranchMenuItemModifierList(
  data:
    | BranchMenuItemModifierOptionResponse[]
    | { items: BranchMenuItemModifierOptionResponse[] }
    | unknown,
): BranchMenuItemModifierOptionResponse[] {
  if (Array.isArray(data)) return data;
  if (data && typeof data === 'object' && Array.isArray((data as { items: unknown[] }).items)) {
    return (data as { items: BranchMenuItemModifierOptionResponse[] }).items;
  }
  return [];
}

export function mapOrderTypesToAllowFlags(orderTypes: readonly OrderType[] | undefined): {
  allow_dine_in?: boolean;
  allow_takeaway?: boolean;
  allow_delivery?: boolean;
} {
  if (!orderTypes) return {};
  return {
    allow_dine_in: orderTypes.includes('Dine In'),
    allow_takeaway: orderTypes.includes('Take Away'),
    allow_delivery: orderTypes.includes('Delivery'),
  };
}

export function mapAllowFlagsToOrderTypes(
  item: Pick<BranchMenuItemOverrideApi, 'allow_dine_in' | 'allow_takeaway' | 'allow_delivery'>,
): OrderType[] {
  const orderTypes: OrderType[] = [];
  if (item.allow_dine_in !== false) orderTypes.push('Dine In');
  if (item.allow_takeaway !== false) orderTypes.push('Take Away');
  if (item.allow_delivery !== false) orderTypes.push('Delivery');
  return orderTypes;
}

export function toUpdateBranchMenuItemOverridePayload(
  updates: Partial<CreateMenuItemInput> & {
    status?: MenuItem['status'] | string;
    is_available?: boolean;
    selling_price?: number;
    sellingPrice?: number;
  },
): UpdateBranchMenuItemOverrideApiRequest {
  const payload = {} as {
    -readonly [
      K in keyof UpdateBranchMenuItemOverrideApiRequest
    ]: UpdateBranchMenuItemOverrideApiRequest[K];
  };

  const sellingPrice = updates.basePrice ?? updates.selling_price ?? updates.sellingPrice;
  if (sellingPrice !== undefined) {
    payload.selling_price = sellingPrice;
  }
  if (updates.orderTypes !== undefined) {
    Object.assign(payload, mapOrderTypesToAllowFlags(updates.orderTypes));
  }
  if (updates.is_available !== undefined) {
    payload.is_available = updates.is_available;
    payload.status = updates.is_available ? 'active' : 'inactive';
  } else if (updates.status !== undefined) {
    const isAct =
      updates.status === 'Available' ||
      (typeof updates.status === 'string' &&
        ['active', 'available', 'enabled'].includes(updates.status.trim().toLowerCase()));
    payload.status = isAct ? 'active' : 'inactive';
    payload.is_available = isAct;
  }

  return payload;
}

export function applyBranchMenuItemOverrideToMenuItem(
  existingItem: MenuItem,
  rawOverride: BranchMenuItemOverrideApi,
): MenuItem {
  const override = unwrapBranchMenuItemOverrideApi(rawOverride);
  const statusFromOverride =
    override.is_available === false ||
    override.is_active === false ||
    (typeof override.status === 'string' &&
      ['inactive', 'hidden', 'disabled'].includes(override.status.trim().toLowerCase()))
      ? ('Hidden' as const)
      : ('Available' as const);

  const rawMenuItem = (override as { menu_item?: { dietary_type?: string } }).menu_item;
  const dietaryFromOverride = rawMenuItem?.dietary_type
    ? fromApiDietaryType(rawMenuItem.dietary_type)
    : existingItem.dietary;

  return {
    ...existingItem,
    dietary: dietaryFromOverride,
    basePrice:
      override.selling_price != null ? Number(override.selling_price) : existingItem.basePrice,
    status: statusFromOverride,
    orderTypes: mapAllowFlagsToOrderTypes(override),
  };
}
