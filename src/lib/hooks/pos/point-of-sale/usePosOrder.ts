'use client';

import { useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import type { FilterBarItem } from '@/components/shared/form-fields/FilterBar';
import { buildInitialCart, createCartLineId, toPosMenuItem } from '@/lib/helpers/posOrderHelpers';
import { useMenuCategories } from '@/lib/hooks/menu/useMenuCategories';
import { useMenuItems } from '@/lib/hooks/menu/useMenuItems';
import {
  INITIAL_CART_ITEMS,
  type CartCustomization,
  type CartItem,
  type PosMenuItem,
} from '@/lib/mocks/pos/usePosMenu.mocks';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';

const ACTIVE_MENU_PARAMS = { status: 'active' as const, page_size: 100 };

export interface UsePosOrderArgs {
  effectiveOrderId: string | null | undefined;
  table: PosTableItem | null | undefined;
  mode: 'takeaway' | 'dine-in' | 'table';
  resolvedTableName: string | null;
  onServeOrder?: (table: PosTableItem, items: CartItem[]) => void;
  onBackToTables?: () => void;
  startInCheckout: boolean;
}

/**
 * Menu catalog + cart for takeaway, dine-in, and tables (shared TakeawayPage).
 */
export function usePosOrder({
  effectiveOrderId,
  table,
  mode,
  resolvedTableName,
  onServeOrder,
  onBackToTables,
  startInCheckout,
}: Readonly<UsePosOrderArgs>) {
  const router = useRouter();
  const pathname = usePathname();

  const categoriesQuery = useMenuCategories(ACTIVE_MENU_PARAMS);
  const itemsQuery = useMenuItems(ACTIVE_MENU_PARAMS);

  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    buildInitialCart(effectiveOrderId, table),
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(startInCheckout);

  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categoriesQuery.data?.items ?? []) {
      map.set(String(category.id), category.name);
    }
    return map;
  }, [categoriesQuery.data?.items]);

  const categoryFilterItems = useMemo<FilterBarItem<string>[]>(
    () => [
      { id: 'all', label: 'ALL' },
      ...(categoriesQuery.data?.items ?? []).map((category) => ({
        id: String(category.id),
        label: category.name.toUpperCase(),
      })),
    ],
    [categoriesQuery.data?.items],
  );

  const menuItems = useMemo(
    () => (itemsQuery.data?.items ?? []).map((item) => toPosMenuItem(item, categoryNameById)),
    [itemsQuery.data?.items, categoryNameById],
  );

  const filteredMenuItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter((item) => {
      if (activeCategory !== 'all' && item.category !== activeCategory) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.categorySection.toLowerCase().includes(query)
      );
    });
  }, [activeCategory, menuItems, searchQuery]);

  const groupedSections = useMemo(() => {
    const sections: Record<string, PosMenuItem[]> = {};
    for (const item of filteredMenuItems) {
      if (!sections[item.categorySection]) {
        sections[item.categorySection] = [];
      }
      sections[item.categorySection].push(item);
    }
    return Object.entries(sections);
  }, [filteredMenuItems]);

  const getItemCartQuantity = (menuItemId: string): number =>
    cartItems
      .filter((ci) => ci.menuItemId === menuItemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);

  const handleAddDefaultItem = (item: PosMenuItem) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (ci) =>
          ci.menuItemId === item.id &&
          (!ci.customization || ci.customization.selectedAddOns.length === 0),
      );

      if (existingIndex > -1) {
        return prev.map((ci, idx) =>
          idx === existingIndex ? { ...ci, quantity: ci.quantity + 1 } : ci,
        );
      }

      const defaultSize = item.sizes[0]?.name ?? 'Regular';
      return [
        ...prev,
        {
          cartId: createCartLineId(),
          menuItemId: item.id,
          name: item.name,
          basePrice: item.basePrice,
          unitPrice: item.basePrice,
          quantity: 1,
          imageUrl: item.imageUrl,
          itemBadges: ['1 Item', defaultSize],
        },
      ];
    });
    setToastMessage(`Added ${item.name} to order`);
  };

  const handleDecrementDefaultItem = (item: PosMenuItem) => {
    setCartItems((prev) => {
      const existing = prev.find((ci) => ci.menuItemId === item.id);
      if (!existing) return prev;
      if (existing.quantity <= 1) {
        return prev.filter((ci) => ci.cartId !== existing.cartId);
      }
      return prev.map((ci) =>
        ci.cartId === existing.cartId ? { ...ci, quantity: ci.quantity - 1 } : ci,
      );
    });
  };

  const handleAddCustomizedItem = (
    item: PosMenuItem,
    customization: CartCustomization,
    quantity: number,
    unitPrice: number,
  ) => {
    const sizeNames = customization.selectedSizes.map((s) => s.name).join(', ');
    const addOnCount = customization.selectedAddOns.length;
    const badges: string[] = [];
    if (sizeNames) badges.push(sizeNames);
    if (addOnCount > 0) badges.push(`+${addOnCount} Add-ons`);
    if (customization.cookingPreference) badges.push(customization.cookingPreference);

    setCartItems((prev) => [
      ...prev,
      {
        cartId: createCartLineId(),
        menuItemId: item.id,
        name: item.name,
        basePrice: item.basePrice,
        unitPrice,
        quantity,
        imageUrl: item.imageUrl,
        customization,
        itemBadges: badges,
      },
    ]);
    setToastMessage(`Added ${quantity}× ${item.name} (Customized) to order`);
  };

  const handleUpdateCartQuantity = (cartId: string, delta: number) => {
    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.cartId !== cartId) return ci;
          const minQty = ci.isExisting || ci.disableDelete ? (ci.originalQuantity ?? 1) : 0;
          const nextQty = ci.quantity + delta;
          if (nextQty < minQty) return ci;
          return nextQty > 0 ? { ...ci, quantity: nextQty } : null;
        })
        .filter((ci): ci is CartItem => ci !== null),
    );
  };

  const handleRemoveCartItem = (cartId: string) => {
    setCartItems((prev) => {
      const target = prev.find((ci) => ci.cartId === cartId);
      if (target?.isExisting || target?.disableDelete) {
        setToastMessage('Previous items cannot be deleted from this order.');
        return prev;
      }
      return prev.filter((ci) => ci.cartId !== cartId);
    });
  };

  const handleProceedCheckout = () => {
    setIsCheckingOut(true);
    const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '/pos/point-of-sale/takeaway';
    if (!cleanPath.endsWith('/checkout')) {
      router.push(`${cleanPath}/checkout`);
    }
  };

  const leaveCheckout = (resetCart: boolean) => {
    setIsCheckingOut(false);
    if (resetCart) setCartItems(INITIAL_CART_ITEMS);

    if (resetCart && onBackToTables) {
      onBackToTables();
      return;
    }

    const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '/pos/point-of-sale/takeaway';
    const parent = cleanPath.replace(/\/(checkout|success|payment-success)$/, '');
    router.push(parent);
  };

  const isSendToKot = mode === 'table';
  const primaryOrderLabel = isSendToKot
    ? 'Send to KOT'
    : `Serve to ${resolvedTableName ?? table?.name ?? 'Table'}`;

  const handleServeItems = () => {
    const targetTable = resolvedTableName ?? table?.name ?? 'Table';
    if (cartItems.length === 0) {
      setToastMessage(
        isSendToKot
          ? 'Please add items from the menu before sending to KOT.'
          : `Please add items from the menu to serve to ${targetTable}.`,
      );
      return;
    }
    const totalQty = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
    setToastMessage(
      isSendToKot
        ? `✓ ${totalQty} item(s) sent to KOT for ${targetTable}!`
        : `✓ ${totalQty} item(s) successfully served to ${targetTable}!`,
    );
    if (table && onServeOrder) {
      onServeOrder(table, cartItems);
    }
  };

  return {
    categoriesQuery,
    itemsQuery,
    searchQuery,
    setSearchQuery,
    activeCategory,
    setActiveCategory,
    viewMode,
    setViewMode,
    categoryFilterItems,
    groupedSections,
    cartItems,
    setCartItems,
    toastMessage,
    setToastMessage,
    isCheckingOut,
    getItemCartQuantity,
    handleAddDefaultItem,
    handleDecrementDefaultItem,
    handleAddCustomizedItem,
    handleUpdateCartQuantity,
    handleRemoveCartItem,
    handleProceedCheckout,
    handleGenerateBill: () => setToastMessage('Bill generated successfully!'),
    leaveCheckout,
    handleServeItems,
    primaryOrderLabel,
  };
}
