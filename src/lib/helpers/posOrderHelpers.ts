import { resolveCaptainFlowBase } from '@/lib/helpers/posCaptainFlow';
import type { PosOrderItem } from '@/lib/helpers/posAllOrdersHelpers';
import {
  getMockOrderSettleDetail,
  type OrderSettleDetail,
} from '@/lib/mocks/pos/usePosOrders.mocks';
import type { OrderReviewData } from '@/features/pos/point-of-sale/components/OrderReviewSection';
import {
  INITIAL_CART_ITEMS,
  type CartItem,
  type PosMenuItem,
} from '@/lib/mocks/pos/usePosMenu.mocks';
import type { BranchOrderItem } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import type {
  AddBranchOrderItemLine,
  AddBranchOrderItemsBody,
} from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderItemsSchema';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';

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

/** Map restaurant menu item API rows into the POS card / cart view model. */
export function toPosMenuItem(
  item: MenuItemResponse,
  categoryNameById: Map<string, string>,
): PosMenuItem {
  const primaryImage = item.images.find((image) => image.is_primary) ?? item.images[0];
  const categoryId = String(item.category_id);
  const categoryName = categoryNameById.get(categoryId) ?? 'Menu';

  const sizes =
    item.variants.length > 0
      ? item.variants.map((variant) => ({
          id: String(variant.id),
          name: variant.name,
          price: variant.final_price,
        }))
      : [{ id: `base-${item.id}`, name: 'Regular', price: item.base_price }];

  const addOns = item.modifier_groups.flatMap((group) => {
    const name = group.modifier_group?.name;
    if (!name) return [];
    return [{ id: String(group.id), name, price: 0 }];
  });

  return {
    id: String(item.id),
    name: item.name,
    category: categoryId,
    categorySection: categoryName.toUpperCase(),
    basePrice: item.base_price,
    imageUrl: primaryImage?.url ?? undefined,
    isPopular: item.is_favorite,
    sizes,
    addOns,
    cookingPreferences: ['Mild', 'Medium', 'Spicy'],
  };
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

function resolveVariantId(
  selectedSizeId: string | undefined,
  catalog: MenuItemResponse | undefined,
): number | undefined {
  if (selectedSizeId) {
    const parsed = Number(selectedSizeId);
    if (Number.isFinite(parsed) && parsed > 0) return parsed;
  }
  const defaultVariant =
    catalog?.variants.find((variant) => variant.is_default) ?? catalog?.variants[0];
  return defaultVariant?.id;
}

function resolvePreparationStationId(catalog: MenuItemResponse | undefined): number | undefined {
  const station = catalog?.preparation_stations[0];
  return station?.preparation_station_id ?? station?.preparation_station?.id;
}

function resolveModifierSelections(
  cartItem: CartItem,
  catalog: MenuItemResponse | undefined,
): AddBranchOrderItemLine['modifier_selections'] {
  const selected = cartItem.customization?.selectedAddOns ?? [];
  if (selected.length === 0 || !catalog) return [];

  const selections: AddBranchOrderItemLine['modifier_selections'] = [];
  for (const addOn of selected) {
    const link = catalog.modifier_groups.find(
      (group) => String(group.id) === addOn.id || String(group.modifier_group_id) === addOn.id,
    );
    if (!link) continue;
    selections.push({
      modifier_group_id: link.modifier_group_id,
      modifier_option_ids: [],
    });
  }
  return selections;
}

/**
 * Map new cart lines to POST …/orders/{id}/items body.
 * Skips existing (already-ordered) lines. Uses selected menu id as `branch_menu_id`.
 */
export function buildAddBranchOrderItemsBody(
  branchMenuId: number,
  cartItems: readonly CartItem[],
  catalogById: ReadonlyMap<number, MenuItemResponse>,
): AddBranchOrderItemsBody | null {
  const newLines = cartItems.filter((item) => !item.isExisting);
  if (newLines.length === 0) return null;

  const items: AddBranchOrderItemLine[] = [];
  for (const line of newLines) {
    const menuItemId = Number(line.menuItemId);
    if (!Number.isFinite(menuItemId) || menuItemId <= 0) continue;

    const catalog = catalogById.get(menuItemId);
    const variantId = resolveVariantId(line.customization?.selectedSizes[0]?.id, catalog);
    const stationId = resolvePreparationStationId(catalog);
    const tags = line.customization?.cookingPreference
      ? [line.customization.cookingPreference]
      : [];

    items.push({
      branch_menu_item_id: menuItemId,
      ...(variantId != null ? { menu_item_variant_id: variantId } : {}),
      ...(stationId != null ? { preparation_station_id: stationId } : {}),
      modifier_selections: resolveModifierSelections(line, catalog),
      quantity: line.quantity,
      tags,
    });
  }

  if (items.length === 0) return null;
  return { expected_version: 1, branch_menu_id: branchMenuId, items };
}

/** Map GET order detail line items into order-summary cart rows. */
export function mapBranchOrderItemsToCart(items: readonly BranchOrderItem[]): CartItem[] {
  return items.map((it) => {
    const menuItemId = String(it.menu_item_id ?? it.branch_menu_item_id ?? it.id);
    return {
      cartId: `existing-${it.id}`,
      menuItemId,
      name: it.name,
      basePrice: it.unit_price,
      unitPrice: it.unit_price,
      quantity: it.quantity,
      originalQuantity: it.quantity,
      isExisting: true,
      disableDelete: true,
      imageUrl: EXISTING_ORDER_IMAGE,
      itemBadges: ['Ordered'],
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
