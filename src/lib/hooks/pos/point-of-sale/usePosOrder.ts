'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  buildAddBranchOrderItemsBody,
  buildInitialCart,
  createCartLineId,
  mapBranchOrderItemsToCart,
  toPosMenuItem,
} from '@/lib/helpers/posOrderHelpers';
import { useBranchMenus, useMenuCategoryAssignments } from '@/lib/hooks/menu/menus/menusHooks';
import { useMenuCategories } from '@/lib/hooks/menu/useMenuCategories';
import { useMenuItems } from '@/lib/hooks/menu/useMenuItems';
import { useBranchOrder } from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrder';
import {
  useAddBranchOrderItems,
  useSubmitBranchOrder,
} from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrderItems';
import {
  INITIAL_CART_ITEMS,
  type CartCustomization,
  type CartItem,
  type PosMenuItem,
} from '@/lib/mocks/pos/usePosMenu.mocks';
import type { MenuItemResponse } from '@/lib/schemas/menu/menuItemsSchema';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import { useToastStore } from '@/stores/toastStore';

/** Same list params as Menus / MenuSessionDetailPage in the sidebar. */
const ACTIVE_MENU_PARAMS = { status: 'active' as const, page: 1, page_size: 100 };
const BRANCH_MENUS_PARAMS = { status: 'active' as const, page: 1, page_size: 50 };

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
 * Reuses existing menus hooks only — same as MenusPage + MenuSessionDetailPage.
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

  // MenusPage: GET /v1/restaurant/branches/{branch_id}/menus
  const branchMenusQuery = useBranchMenus(BRANCH_MENUS_PARAMS);
  // MenuSessionDetailPage: categories + items + category-assignments for the selected menu
  const categoriesQuery = useMenuCategories(ACTIVE_MENU_PARAMS);
  const itemsQuery = useMenuItems(ACTIVE_MENU_PARAMS);
  const shouldLoadOrder = Boolean(effectiveOrderId) && (!table || table.status !== 'available');
  const orderDetailQuery = useBranchOrder(shouldLoadOrder ? effectiveOrderId : null);
  const addOrderItemsMutation = useAddBranchOrderItems();
  const submitOrderMutation = useSubmitBranchOrder();

  const [searchQuery, setSearchQuery] = useState('');
  /** User pick; falls back to default branch menu when unset/invalid. */
  const [menuIdOverride, setMenuIdOverride] = useState<string | null>(null);
  /** User pick; falls back to `all` when unset/invalid for the active menu. */
  const [categoryIdOverride, setCategoryIdOverride] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [cartItems, setCartItems] = useState<CartItem[]>(() =>
    buildInitialCart(effectiveOrderId, table),
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(startInCheckout);
  const [isSendingKot, setIsSendingKot] = useState(false);

  const hydratedOrderIdRef = useRef<string | null>(null);

  // Dine-in / POS ordering: only branch-scoped menus (not company catalogue).
  const branchMenus = useMemo(
    () =>
      (branchMenusQuery.data?.items ?? []).filter(
        (assignment) => assignment.menu.catalogue_scope === 'branch',
      ),
    [branchMenusQuery.data],
  );

  const menuOptions = useMemo<DropdownOption<string>[]>(
    () =>
      branchMenus.map((assignment) => ({
        id: String(assignment.menu_id ?? assignment.id),
        label: assignment.menu.name,
      })),
    [branchMenus],
  );

  const defaultMenuId = useMemo(() => {
    if (menuOptions.length === 0) return '';
    const defaultAssignment = branchMenus.find((row) => row.is_default) ?? branchMenus[0];
    return defaultAssignment ? String(defaultAssignment.menu_id ?? defaultAssignment.id) : '';
  }, [branchMenus, menuOptions]);

  const selectedMenuId =
    menuIdOverride != null && menuOptions.some((opt) => opt.id === menuIdOverride)
      ? menuIdOverride
      : defaultMenuId;

  const selectedMenuIdNumber = useMemo(() => {
    const n = Number(selectedMenuId);
    return Number.isFinite(n) && n > 0 ? n : undefined;
  }, [selectedMenuId]);

  // MenuSessionDetailPage: GET /v1/restaurant/menus/{menu_id}/category-assignments
  const assignmentsQuery = useMenuCategoryAssignments(selectedMenuIdNumber, {
    page: 1,
    page_size: 100,
  });

  const categories = useMemo(
    () => categoriesQuery.data?.items ?? [],
    [categoriesQuery.data?.items],
  );
  const categoryAssignments = useMemo(
    () => assignmentsQuery.data?.items ?? [],
    [assignmentsQuery.data?.items],
  );

  const assignedCategoryIds = useMemo(
    () => categoryAssignments.map((row) => row.category_id),
    [categoryAssignments],
  );

  // Same name map as MenuSessionDetailPage (catalogue + assignment.category).
  const categoryNameById = useMemo(() => {
    const map = new Map<string, string>();
    for (const category of categories) {
      map.set(String(category.id), category.name);
    }
    for (const assignment of categoryAssignments) {
      if (assignment.category?.name) {
        map.set(String(assignment.category_id), assignment.category.name);
      }
    }
    return map;
  }, [categories, categoryAssignments]);

  const categoryOptions = useMemo<DropdownOption<string>[]>(() => {
    const assigned = assignedCategoryIds.map((categoryId) => ({
      id: String(categoryId),
      label: categoryNameById.get(String(categoryId)) ?? `Category #${categoryId}`,
    }));
    return [{ id: 'all', label: 'All categories' }, ...assigned];
  }, [assignedCategoryIds, categoryNameById]);

  const selectedCategoryId =
    categoryIdOverride != null && categoryOptions.some((opt) => opt.id === categoryIdOverride)
      ? categoryIdOverride
      : 'all';

  const handleMenuChange = (menuId: string) => {
    setMenuIdOverride(menuId);
    setCategoryIdOverride('all');
  };

  // Available tables stay empty; occupied / other statuses hydrate once from GET order detail.
  useEffect(() => {
    if (table?.status === 'available') {
      hydratedOrderIdRef.current = null;
      queueMicrotask(() => setCartItems([]));
      return;
    }

    const orderKey = effectiveOrderId ? String(effectiveOrderId) : null;
    if (!orderKey || !orderDetailQuery.data) return;
    if (hydratedOrderIdRef.current === orderKey) return;

    hydratedOrderIdRef.current = orderKey;
    const nextCart = mapBranchOrderItemsToCart(orderDetailQuery.data.items);
    queueMicrotask(() => setCartItems(nextCart));
  }, [table?.status, effectiveOrderId, orderDetailQuery.data]);

  const assignedCategorySet = useMemo(() => new Set(assignedCategoryIds), [assignedCategoryIds]);

  // Branch-scoped items only, in categories assigned to the selected menu.
  const menuItems = useMemo(
    () =>
      (itemsQuery.data?.items ?? [])
        .filter((item) => item.catalogue_scope === 'branch')
        .filter((item) => assignedCategorySet.has(item.category_id))
        .map((item) => toPosMenuItem(item, categoryNameById)),
    [assignedCategorySet, categoryNameById, itemsQuery.data?.items],
  );

  const filteredMenuItems = useMemo(() => {
    const query = searchQuery.toLowerCase().trim();
    return menuItems.filter((item) => {
      if (selectedCategoryId !== 'all' && item.category !== selectedCategoryId) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.categorySection.toLowerCase().includes(query)
      );
    });
  }, [menuItems, searchQuery, selectedCategoryId]);

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

  const isSendToKot = mode === 'table' || mode === 'dine-in' || Boolean(table);
  const primaryOrderLabel = isSendToKot
    ? 'Send to KOT'
    : `Serve to ${resolvedTableName ?? table?.name ?? 'Table'}`;

  const catalogById = useMemo(() => {
    const map = new Map<number, MenuItemResponse>();
    for (const item of itemsQuery.data?.items ?? []) {
      map.set(item.id, item);
    }
    return map;
  }, [itemsQuery.data?.items]);

  const handleServeItems = async () => {
    const showToast = useToastStore.getState().show;
    const targetTable = resolvedTableName ?? table?.name ?? 'Table';
    if (cartItems.length === 0) {
      const emptyMsg = isSendToKot
        ? 'Please add items from the menu before sending to KOT.'
        : `Please add items from the menu to serve to ${targetTable}.`;
      showToast(emptyMsg, 'error');
      setToastMessage(emptyMsg);
      return;
    }

    const orderId = effectiveOrderId ? String(effectiveOrderId).replace(/^#/, '') : null;
    const hasOrderId = Boolean(orderId) && orderId !== 'undefined';

    // Live KOT path: POST …/items then POST …/submit
    if (isSendToKot && hasOrderId) {
      if (!selectedMenuIdNumber) {
        const msg = 'Select a menu before sending to KOT.';
        showToast(msg, 'error');
        setToastMessage(msg);
        return;
      }

      const body = buildAddBranchOrderItemsBody(selectedMenuIdNumber, cartItems, catalogById);

      setIsSendingKot(true);
      try {
        if (body) {
          await addOrderItemsMutation.mutateAsync({ orderId: orderId!, body });
        }
        await submitOrderMutation.mutateAsync(orderId!);

        const totalQty = cartItems
          .filter((ci) => !ci.isExisting)
          .reduce((acc, ci) => acc + ci.quantity, 0);
        // Mark newly sent lines as existing so a second tap only re-submits.
        setCartItems((prev) =>
          prev.map((ci) =>
            ci.isExisting
              ? ci
              : {
                  ...ci,
                  isExisting: true,
                  disableDelete: true,
                  originalQuantity: ci.quantity,
                },
          ),
        );
        const successMsg = `✓ ${totalQty > 0 ? totalQty : cartItems.reduce((a, c) => a + c.quantity, 0)} item(s) sent to KOT for ${targetTable}!`;
        showToast(successMsg, 'success');
        setToastMessage(successMsg);
        if (table && onServeOrder) {
          onServeOrder(table, cartItems);
        }
      } catch (error) {
        const errorMsg = getErrorMessage(error, 'Failed to send items to KOT.');
        // AppShell toast (silent API calls skip browserClient toasts).
        showToast(errorMsg, 'error');
        setToastMessage(errorMsg);
      } finally {
        setIsSendingKot(false);
      }
      return;
    }

    if (isSendToKot && !hasOrderId) {
      const msg = 'Open an order before sending to KOT.';
      showToast(msg, 'error');
      setToastMessage(msg);
      return;
    }

    const totalQty = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);
    const successMsg = `✓ ${totalQty} item(s) successfully served to ${targetTable}!`;
    showToast(successMsg, 'success');
    setToastMessage(successMsg);
    if (table && onServeOrder) {
      onServeOrder(table, cartItems);
    }
  };

  const isMenuLoading =
    branchMenusQuery.isLoading ||
    categoriesQuery.isLoading ||
    (Boolean(selectedMenuIdNumber) && assignmentsQuery.isLoading) ||
    itemsQuery.isLoading;

  const isMenuError =
    branchMenusQuery.isError ||
    categoriesQuery.isError ||
    assignmentsQuery.isError ||
    itemsQuery.isError;

  return {
    branchMenusQuery,
    categoriesQuery,
    assignmentsQuery,
    itemsQuery,
    orderDetailQuery,
    searchQuery,
    setSearchQuery,
    selectedMenuId,
    setSelectedMenuId: handleMenuChange,
    selectedCategoryId,
    setSelectedCategoryId: setCategoryIdOverride,
    menuOptions,
    categoryOptions,
    viewMode,
    setViewMode,
    isMenuLoading,
    isMenuError,
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
    isSendingKot,
    primaryOrderLabel,
  };
}
