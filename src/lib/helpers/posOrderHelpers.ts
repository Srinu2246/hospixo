import { resolveCaptainFlowBase } from '@/lib/helpers/posCaptainFlow';
import type { PosOrderItem } from '@/lib/helpers/posAllOrdersHelpers';
import {
  getMockOrderSettleDetail,
  type OrderSettleDetail,
} from '@/lib/mocks/pos/usePosOrders.mocks';
import type { OrderReviewData } from '@/features/pos/point-of-sale/components/OrderReviewSection';
import {
  INITIAL_CART_ITEMS,
  type CartCustomization,
  type CartItem,
} from '@/lib/mocks/pos/usePosMenu.mocks';
import type { BranchOrderItem } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import type { AddBranchOrderItemLine } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderItemsSchema';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import type { PosMenuCatalogRow } from '@/lib/schemas/menu/menus/menuTreeSchema';

const EXISTING_ORDER_IMAGE =
  'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80';

/**
 * Shared helpers for takeaway, dine-in, and tables ordering (same TakeawayPage).
 */

/** Table route segment for dine-in navigation (API table id or reference label). */
export function resolvePosOrderTableId(order: PosOrderItem): string | null {
  if (order.tableId != null) return String(order.tableId);
  if (order.tableName) return order.tableName;
  const tableMatch = order.reference.match(/Table\s*(T\d+|[A-Za-z0-9_-]+)/i);
  if (!tableMatch?.[1]) return null;
  const raw = tableMatch[1];
  return raw.toLowerCase().replace(/^t(\d+)$/, 't-$1');
}

/** Add-items navigation from open orders / captain all-orders. */
export function buildPosAddItemsPath(pathname: string, order: PosOrderItem): string {
  const normalizedPath = pathname.replace(/\/+$/, '') || '/pos/point-of-sale/all-orders';
  const isCaptain = normalizedPath.includes('captain-flow');
  const baseFlow = isCaptain
    ? resolveCaptainFlowBase(normalizedPath)
    : normalizedPath.replace(/\/all-orders(\/.*)?$/, '') || '/pos/point-of-sale';

  const orderId = String(order.orderApiId);
  const tableId = resolvePosOrderTableId(order);

  if (order.type === 'dine-in' && tableId) {
    const tableSegment = encodeURIComponent(tableId);
    if (isCaptain) {
      return `${baseFlow}/order-menu?orderId=${encodeURIComponent(orderId)}&tableId=${tableSegment}`;
    }
    return `${baseFlow}/dine-in/${tableSegment}?orderId=${encodeURIComponent(orderId)}`;
  }

  if (isCaptain) {
    return `${baseFlow}/order-menu?orderId=${encodeURIComponent(orderId)}`;
  }

  return `${baseFlow}/takeaway?orderId=${encodeURIComponent(orderId)}`;
}

/** Settle flow URL for an open order (preserves branch / tenant prefix). */
export function buildPosSettleOrderPath(pathname: string, order: PosOrderItem): string {
  const basePath = pathname.replace(/\/+$/, '') || '/pos/point-of-sale/all-orders';
  return `${basePath}/${encodeURIComponent(String(order.orderApiId))}`;
}

/** Strip settle step suffixes (`/checkout`, `/success`) from the current URL. */
export function resolvePosOrderSettleBasePath(pathname: string): string {
  const trimmed = pathname.replace(/\/+$/, '');
  return trimmed.replace(/\/(checkout|success|payment-success)$/, '') || trimmed;
}

export function buildPosSettleCheckoutPath(pathname: string): string {
  return `${resolvePosOrderSettleBasePath(pathname)}/checkout`;
}

export function buildPosSettleSuccessPath(pathname: string): string {
  return `${resolvePosOrderSettleBasePath(pathname)}/success`;
}

export function createCartLineId(): string {
  return `cart-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;
}

/**
 * Seed cart before order-detail fetch resolves.
 * Dine-in / table: always empty (available stays empty; occupied hydrates from GET order).
 * Takeaway with no order id: demo cart.
 */
export function buildInitialCart(
  effectiveOrderId: string | null | undefined,
  table: PosTableItem | null | undefined,
): CartItem[] {
  if (table) return [];
  if (effectiveOrderId) return [];
  return INITIAL_CART_ITEMS;
}

function resolveCatalogVariantId(
  selectedSizeId: string | undefined,
  catalog: PosMenuCatalogRow,
): number | undefined {
  if (selectedSizeId) {
    const parsed = Number(selectedSizeId);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const defaultVariant =
    catalog.variants.find((variant) => variant.isDefault) ?? catalog.variants[0];
  return defaultVariant?.variantId;
}

function resolveCatalogModifierSelections(
  customization: CartCustomization | undefined,
  catalog: PosMenuCatalogRow,
): AddBranchOrderItemLine['modifier_selections'] {
  const selected = customization?.selectedAddOns ?? [];
  if (selected.length === 0) return [];

  const optionToGroup = new Map<number, number>();
  for (const group of catalog.modifierGroups) {
    for (const option of group.options) {
      optionToGroup.set(option.optionId, group.modifierGroupId);
    }
  }

  const grouped = new Map<number, number[]>();
  for (const addOn of selected) {
    const optionId = Number(addOn.id);
    if (Number.isFinite(optionId) && optionId > 0 && optionToGroup.has(optionId)) {
      const groupId = optionToGroup.get(optionId)!;
      const list = grouped.get(groupId) ?? [];
      list.push(optionId);
      grouped.set(groupId, list);
      continue;
    }
    const groupId = Number(addOn.id);
    if (Number.isFinite(groupId) && groupId > 0) {
      grouped.set(groupId, grouped.get(groupId) ?? []);
    }
  }

  return [...grouped.entries()].map(([modifier_group_id, modifier_option_ids]) => ({
    modifier_group_id,
    modifier_option_ids,
  }));
}

/** Build one POST …/items line from a menu-tree catalog row (+ optional customization). */
export function buildAddBranchOrderItemLine(
  catalog: PosMenuCatalogRow,
  quantity: number,
  customization?: CartCustomization,
): AddBranchOrderItemLine | null {
  if (quantity <= 0) return null;

  const branchMenuItemId = catalog.itemOverrideId ?? catalog.branchMenuItemId;
  if (!Number.isFinite(branchMenuItemId) || branchMenuItemId <= 0) return null;

  const variantId = resolveCatalogVariantId(customization?.selectedSizes[0]?.id, catalog);
  const stationId = catalog.preparationStationId;
  const tags = customization?.cookingPreference ? [customization.cookingPreference] : [];

  return {
    branch_menu_item_id: branchMenuItemId,
    ...(variantId != null ? { menu_item_variant_id: variantId } : {}),
    ...(stationId != null ? { preparation_station_id: stationId } : {}),
    modifier_selections: resolveCatalogModifierSelections(customization, catalog),
    quantity,
    tags,
  };
}

/** True when the line was already fired to kitchen (not editable/removable). */
export function isBranchOrderLineSubmitted(item: {
  item_status?: string;
  status?: string;
}): boolean {
  const raw = (item.item_status ?? item.status ?? 'draft').trim().toLowerCase();
  return raw !== 'draft' && raw.length > 0;
}

/** Branch order line id from a cart row (server-backed lines). */
export function resolveBranchOrderLineId(cartItem: CartItem): number | undefined {
  if (cartItem.orderLineId != null && cartItem.orderLineId > 0) {
    return cartItem.orderLineId;
  }
  const match = /^existing-(\d+)$/.exec(cartItem.cartId);
  if (!match) return undefined;
  const parsed = Number(match[1]);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
}

/** Map GET / submit order line items into order-summary cart rows. */
export function mapBranchOrderItemsToCart(items: readonly BranchOrderItem[]): CartItem[] {
  return items.map((it) => {
    const menuItemId = String(it.menu_item_id ?? it.branch_menu_item_id ?? it.id);
    const submitted = isBranchOrderLineSubmitted(it);
    const kotLabel = it.kot_number?.trim();
    return {
      cartId: `existing-${it.id}`,
      orderLineId: it.id,
      menuItemId,
      name: it.name,
      basePrice: it.unit_price,
      unitPrice: it.unit_price,
      quantity: it.quantity,
      originalQuantity: it.quantity,
      isExisting: submitted,
      disableDelete: submitted,
      imageUrl: EXISTING_ORDER_IMAGE,
      itemBadges: kotLabel ? [`KOT ${kotLabel}`] : submitted ? ['Submitted'] : ['Draft'],
    };
  });
}

/** Resolve table label from table prop, order detail, or route path. */
export function resolvePosTableName(
  table: PosTableItem | null | undefined,
  effectiveOrderId: string | null | undefined,
  pathname: string | null,
): string | null {
  if (table?.name) return table.name;

  if (effectiveOrderId) {
    const detail = getMockOrderSettleDetail(effectiveOrderId);
    if (detail?.reference && detail.reference.toLowerCase().includes('table')) {
      return detail.reference;
    }
  }

  const match = pathname?.match(/\/(?:tables|dine-in)\/([^/?]+)/i);
  if (!match?.[1]) return null;

  const id = match[1];
  const numMatch = id.match(/\d+/);
  return numMatch ? `Table ${numMatch[0]}` : `Table ${id.toUpperCase()}`;
}

/** Build OrderSettle review payload from the current cart. */
export function buildReviewOrderData(
  cartItems: readonly CartItem[],
  table: PosTableItem | null | undefined,
) {
  const subtotal = cartItems.reduce((sum, ci) => sum + ci.unitPrice * ci.quantity, 0);
  const serviceCharge = Math.round(subtotal * 0.02 * 100) / 100;
  const tax = Math.round(subtotal * 0.05 * 100) / 100;
  const platformFee = 25;
  const discountAmount = Math.min(subtotal, 87);
  const grandTotal = Math.max(0, subtotal - discountAmount + platformFee + serviceCharge + tax);

  return {
    orderNumber: table ? `#00${table.id.replace('t-', '')}` : '#0039',
    table: table ? table.name : 'Table 01',
    items: cartItems.map((ci) => ({
      id: ci.cartId,
      name: ci.name,
      quantity: ci.quantity,
      unitPrice: ci.unitPrice,
      totalPrice: ci.unitPrice * ci.quantity,
      imageUrl: ci.imageUrl,
    })),
    subtotal,
    discounts: [
      { id: 'disc-1', label: 'Item Discount (5%)', amount: 37.0 },
      { id: 'disc-2', label: 'Coupon (WELCOME50)', tag: 'WELCOME50', amount: 50.0 },
    ],
    platformFee,
    serviceChargeRate: 0.02,
    serviceChargeAmount: serviceCharge,
    taxRate: 0.05,
    taxAmount: tax,
    total: grandTotal,
  };
}

const FIGMA_ORDER_1024_COUPON = 640;

/** Captain order review card payload from settle detail (Figma #1024 coupon line). */
export function mapSettleDetailToReviewOrder(detail: OrderSettleDetail): OrderReviewData {
  const clean = detail.orderNumber.replace(/^#/, '').toLowerCase();
  const is1024 = clean === '1024' || detail.id.includes('1024');
  const couponAmount = is1024 ? FIGMA_ORDER_1024_COUPON : 0;

  return {
    orderNumber: detail.orderNumber,
    table: detail.reference,
    items: detail.items.map((it) => ({
      id: it.id,
      name: it.name,
      quantity: it.quantity,
      unitPrice: it.unitPrice,
      totalPrice: it.totalPrice,
    })),
    subtotal: detail.subtotal,
    discounts:
      couponAmount > 0 ? [{ id: 'coupon-figma', label: 'Coupon', amount: couponAmount }] : [],
    platformFee: 0,
    serviceChargeRate: 0,
    serviceChargeAmount: 0,
    taxRate: detail.taxRate,
    taxAmount: detail.taxAmount,
    total: detail.grandTotal,
  };
}
