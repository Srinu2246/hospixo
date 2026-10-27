'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';

import type { DropdownOption } from '@/components/shared/form-fields/Dropdown';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import {
  buildAddBranchOrderItemLine,
  buildInitialCart,
  createCartLineId,
  mapBranchOrderItemsToCart,
  resolveBranchOrderLineId,
} from '@/lib/helpers/posOrderHelpers';
import { flattenMenuTreeCatalog } from '@/lib/helpers/posMenuTreeHelpers';
import { useBranchMenus } from '@/lib/hooks/menu/menus/menusHooks';
import { usePosBranchMenuTree } from '@/lib/hooks/menu/menus/useMenuTree';
import {
  branchOrderQueryKey,
  useBranchOrder,
} from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrder';
import { useActiveBranchId } from '@/lib/hooks/menu/menus/menusHooks';
import {
  useAddBranchOrderItems,
  useRemoveBranchOrderItem,
  useSubmitBranchOrder,
} from '@/lib/hooks/pos/point-of-sale/all-orders/useBranchOrderItems';
import {
  INITIAL_CART_ITEMS,
  type CartCustomization,
  type CartItem,
  type PosMenuItem,
} from '@/lib/mocks/pos/usePosMenu.mocks';
import { parseBranchOrderDetail } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderDetailSchema';
import { addBranchOrderItemsBodySchema } from '@/lib/schemas/pos/point-of-sale/all-orders/branchOrderItemsSchema';
import { api } from '@/services/api/browserClient';
import ApiUrlsV1 from '@/services/api/ApiUrlsV1';
import type { MenuAssignment } from '@/lib/schemas/menu/menus/menusSchema';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';
import { useToastStore } from '@/stores/toastStore';

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
 * Branch/company menu tree + cart for table, dine-in, and takeaway.
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
  const queryClient = useQueryClient();
  const activeBranchId = useActiveBranchId();

  const branchMenusQuery = useBranchMenus(BRANCH_MENUS_PARAMS);
  const shouldLoadOrder = Boolean(effectiveOrderId) && (!table || table.status !== 'available');
  const orderDetailQuery = useBranchOrder(shouldLoadOrder ? effectiveOrderId : null);
  const addOrderItemsMutation = useAddBranchOrderItems();
  const removeOrderItemMutation = useRemoveBranchOrderItem();
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
  const lastOrderVersionRef = useRef(0);

  const isBranchPosMenuContext = mode === 'table' || mode === 'dine-in' || Boolean(table);

  // Dine-in / table POS: branch-scoped menus only; takeaway may include company catalogue.
  const branchMenuAssignments = useMemo(() => {
    const rows = branchMenusQuery.data?.items ?? [];
    if (!isBranchPosMenuContext) return rows;
    return rows.filter((assignment) => assignment.menu.catalogue_scope === 'branch');
  }, [branchMenusQuery.data, isBranchPosMenuContext]);

  const menuOptions = useMemo<DropdownOption<string>[]>(
    () =>
      branchMenuAssignments.map((assignment) => ({
        id: String(assignment.id),
        label: assignment.menu.name,
      })),
    [branchMenuAssignments],
  );

  const defaultMenuAssignmentId = useMemo(() => {
    if (branchMenuAssignments.length === 0) return '';
    const defaultAssignment =
      branchMenuAssignments.find(
        (row) => row.is_default && row.menu.catalogue_scope === 'branch',
      ) ??
      branchMenuAssignments.find((row) => row.menu.catalogue_scope === 'branch') ??
      branchMenuAssignments.find((row) => row.is_default) ??
      branchMenuAssignments[0];
    return defaultAssignment ? String(defaultAssignment.id) : '';
  }, [branchMenuAssignments]);

  const selectedMenuAssignmentId =
    menuIdOverride != null && menuOptions.some((opt) => opt.id === menuIdOverride)
      ? menuIdOverride
      : defaultMenuAssignmentId;

  const selectedMenuAssignment = useMemo((): MenuAssignment | undefined => {
    const id = Number(selectedMenuAssignmentId);
    if (!Number.isFinite(id) || id <= 0) return undefined;
    return branchMenuAssignments.find((row) => row.id === id);
  }, [branchMenuAssignments, selectedMenuAssignmentId]);

  const menuTreeCategoryFilter = useMemo(() => {
    if (categoryIdOverride == null || categoryIdOverride === 'all') return undefined;
    const parsed = Number(categoryIdOverride);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
  }, [categoryIdOverride]);

  const menuTreeQuery = usePosBranchMenuTree(selectedMenuAssignment, {
    category_id: menuTreeCategoryFilter,
  });

  const {
    categories: treeCategories,
    catalogByPosKey,
    menuItems,
  } = useMemo(() => flattenMenuTreeCatalog(menuTreeQuery.data), [menuTreeQuery.data]);

  const categoryOptions = useMemo<DropdownOption<string>[]>(() => {
    const assigned = treeCategories.map((row) => ({
      id: String(row.categoryId),
      label: row.categoryName,
    }));
    return [{ id: 'all', label: 'All categories' }, ...assigned];
  }, [treeCategories]);

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

  useEffect(() => {
    if (orderDetailQuery.data?.version != null) {
      lastOrderVersionRef.current = orderDetailQuery.data.version;
    }
  }, [orderDetailQuery.data?.version]);

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

  const isLiveBranchOrder =
    (mode === 'table' || mode === 'dine-in' || Boolean(table)) &&
    Boolean(effectiveOrderId) &&
    String(effectiveOrderId) !== 'undefined';

  const resolvedOrderId = effectiveOrderId ? String(effectiveOrderId).replace(/^#/, '') : null;

  const syncCartFromOrderWriteResponse = (
    data: Awaited<ReturnType<typeof addOrderItemsMutation.mutateAsync>>,
  ) => {
    if (data?.order) {
      if (data.order.version != null) {
        lastOrderVersionRef.current = data.order.version;
      }
      if (data.order.items) {
        setCartItems(mapBranchOrderItemsToCart(data.order.items));
        hydratedOrderIdRef.current = resolvedOrderId;
      }
    }
  };

  const removeServerOrderLine = async (orderLineId: number) => {
    if (!resolvedOrderId) {
      throw new Error('Order id is required');
    }
    const expectedVersion = lastOrderVersionRef.current ?? orderDetailQuery.data?.version ?? 0;
    const result = await removeOrderItemMutation.mutateAsync({
      orderId: resolvedOrderId,
      itemId: orderLineId,
      expectedVersion,
    });
    syncCartFromOrderWriteResponse(result);
  };

  const findRemovableDefaultCartLine = (menuItemId: string): CartItem | undefined =>
    cartItems.find(
      (line) =>
        line.menuItemId === menuItemId &&
        !line.disableDelete &&
        (!line.customization || line.customization.selectedAddOns.length === 0),
    );

  const postAddMenuLineToOrder = async (
    item: PosMenuItem,
    customization: CartCustomization | undefined,
    quantity: number,
  ) => {
    if (!isLiveBranchOrder || !resolvedOrderId || !selectedMenuAssignment) {
      return false;
    }

    const catalog = catalogByPosKey.get(item.id);
    if (!catalog) {
      throw new Error('Menu item is not in the loaded menu tree.');
    }

    const line = buildAddBranchOrderItemLine(catalog, quantity, customization);
    if (!line) {
      throw new Error('Invalid menu item');
    }

    const branchMenuId =
      catalog.branchMenuId ??
      menuTreeQuery.data?.assignmentId ??
      catalog.categoryAssignmentId ??
      selectedMenuAssignment.id;
    if (!branchMenuId) {
      throw new Error('Missing branch menu id for this item.');
    }

    const expectedVersion = lastOrderVersionRef.current ?? orderDetailQuery.data?.version ?? 0;
    const body = addBranchOrderItemsBodySchema.parse({
      expected_version: expectedVersion,
      branch_menu_id: branchMenuId,
      items: [line],
    });

    const result = await addOrderItemsMutation.mutateAsync({
      orderId: resolvedOrderId,
      body,
    });
    syncCartFromOrderWriteResponse(result);
    return true;
  };

  const getItemCartQuantity = (menuItemId: string): number =>
    cartItems
      .filter((ci) => ci.menuItemId === menuItemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);

  const handleAddDefaultItem = async (item: PosMenuItem) => {
    const showToast = useToastStore.getState().show;

    if (isLiveBranchOrder) {
      if (!selectedMenuAssignment || !menuTreeQuery.data) {
        const msg = 'Select a menu before adding items.';
        showToast(msg, 'error');
        setToastMessage(msg);
        return;
      }
      if (addOrderItemsMutation.isPending) return;

      try {
        await postAddMenuLineToOrder(item, undefined, 1);
        setToastMessage(`Added ${item.name} to order`);
      } catch (error) {
        const errorMsg = getErrorMessage(error, 'Failed to add item to order.');
        showToast(errorMsg, 'error');
        setToastMessage(errorMsg);
      }
      return;
    }

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

  const handleDecrementDefaultItem = async (item: PosMenuItem) => {
    const showToast = useToastStore.getState().show;
    const existing = findRemovableDefaultCartLine(item.id);

    if (isLiveBranchOrder && existing) {
      if (existing.disableDelete) {
        setToastMessage('Submitted items cannot be removed from here.');
        return;
      }
      const orderLineId = resolveBranchOrderLineId(existing);
      if (!orderLineId) {
        setToastMessage('Unable to remove item — refresh the order and try again.');
        return;
      }
      if (removeOrderItemMutation.isPending || addOrderItemsMutation.isPending) return;

      try {
        const nextQty = existing.quantity - 1;
        await removeServerOrderLine(orderLineId);
        if (nextQty > 0) {
          await postAddMenuLineToOrder(item, undefined, nextQty);
        }
      } catch (error) {
        const errorMsg = getErrorMessage(error, 'Failed to remove item from order.');
        showToast(errorMsg, 'error');
        setToastMessage(errorMsg);
      }
      return;
    }

    setCartItems((prev) => {
      const line = prev.find((ci) => ci.menuItemId === item.id);
      if (!line) return prev;
      if (line.quantity <= 1) {
        return prev.filter((ci) => ci.cartId !== line.cartId);
      }
      return prev.map((ci) =>
        ci.cartId === line.cartId ? { ...ci, quantity: ci.quantity - 1 } : ci,
      );
    });
  };

  const handleAddCustomizedItem = async (
    item: PosMenuItem,
    customization: CartCustomization,
    quantity: number,
    unitPrice: number,
  ) => {
    const showToast = useToastStore.getState().show;

    if (isLiveBranchOrder) {
      if (!selectedMenuAssignment || !menuTreeQuery.data) {
        const msg = 'Select a menu before adding items.';
        showToast(msg, 'error');
        setToastMessage(msg);
        return;
      }
      if (addOrderItemsMutation.isPending) return;

      try {
        await postAddMenuLineToOrder(item, customization, quantity);
        setToastMessage(`Added ${quantity}× ${item.name} to order`);
      } catch (error) {
        const errorMsg = getErrorMessage(error, 'Failed to add item to order.');
        showToast(errorMsg, 'error');
        setToastMessage(errorMsg);
      }
      return;
    }

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

  const handleUpdateCartQuantity = async (cartId: string, delta: number) => {
    const showToast = useToastStore.getState().show;
    const target = cartItems.find((ci) => ci.cartId === cartId);
    if (!target) return;

    const minQty = target.isExisting || target.disableDelete ? (target.originalQuantity ?? 1) : 0;
    const nextQty = target.quantity + delta;
    if (nextQty < minQty) return;

    if (isLiveBranchOrder && delta < 0 && !target.disableDelete) {
      const orderLineId = resolveBranchOrderLineId(target);
      if (orderLineId && !removeOrderItemMutation.isPending && !addOrderItemsMutation.isPending) {
        try {
          await removeServerOrderLine(orderLineId);
          if (nextQty > 0) {
            const menuItem = menuItems.find((row) => row.id === target.menuItemId);
            if (menuItem) {
              await postAddMenuLineToOrder(menuItem, target.customization, nextQty);
            }
          }
        } catch (error) {
          const errorMsg = getErrorMessage(error, 'Failed to update item quantity.');
          showToast(errorMsg, 'error');
          setToastMessage(errorMsg);
        }
        return;
      }
    }

    setCartItems((prev) =>
      prev
        .map((ci) => {
          if (ci.cartId !== cartId) return ci;
          if (nextQty <= 0) return null;
          return { ...ci, quantity: nextQty };
        })
        .filter((ci): ci is CartItem => ci !== null),
    );
  };

  const handleRemoveCartItem = async (cartId: string) => {
    const showToast = useToastStore.getState().show;
    const target = cartItems.find((ci) => ci.cartId === cartId);
    if (!target) return;

    if (target.isExisting || target.disableDelete) {
      setToastMessage('Submitted items cannot be removed from this order.');
      return;
    }

    if (isLiveBranchOrder) {
      const orderLineId = resolveBranchOrderLineId(target);
      if (orderLineId) {
        if (removeOrderItemMutation.isPending || addOrderItemsMutation.isPending) return;
        try {
          await removeServerOrderLine(orderLineId);
        } catch (error) {
          const errorMsg = getErrorMessage(error, 'Failed to remove item from order.');
          showToast(errorMsg, 'error');
          setToastMessage(errorMsg);
        }
        return;
      }
    }

    setCartItems((prev) => prev.filter((ci) => ci.cartId !== cartId));
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

  const handleServeItems = async () => {
    const showToast = useToastStore.getState().show;
    const targetTable = resolvedTableName ?? table?.name ?? 'Table';
    const draftCartLines = cartItems.filter((ci) => !ci.isExisting);
    if (isSendToKot && cartItems.length === 0) {
      const emptyMsg = 'Please add items from the menu before sending to KOT.';
      showToast(emptyMsg, 'error');
      setToastMessage(emptyMsg);
      return;
    }
    if (!isSendToKot && cartItems.length === 0) {
      const emptyMsg = `Please add items from the menu to serve to ${targetTable}.`;
      showToast(emptyMsg, 'error');
      setToastMessage(emptyMsg);
      return;
    }

    const orderId = effectiveOrderId ? String(effectiveOrderId).replace(/^#/, '') : null;
    const hasOrderId = Boolean(orderId) && orderId !== 'undefined';

    // Live KOT path: POST …/orders/{order_id}/submit only (fires server draft lines).
    if (isSendToKot && hasOrderId) {
      setIsSendingKot(true);
      try {
        let expectedVersion = orderDetailQuery.data?.version ?? 0;
        if (typeof activeBranchId === 'number') {
          try {
            const freshPayload = await api.get(
              ApiUrlsV1.pos.pointOfSale.allOrders.detail(activeBranchId, orderId!),
            );
            const fresh = parseBranchOrderDetail(freshPayload);
            if (fresh.version != null) {
              expectedVersion = fresh.version;
            }
            await queryClient.invalidateQueries({
              queryKey: branchOrderQueryKey(activeBranchId, orderId),
            });
          } catch {
            // Keep last known version when refresh fails.
          }
        }

        const idempotencyKey =
          typeof crypto !== 'undefined' && 'randomUUID' in crypto
            ? crypto.randomUUID()
            : `${orderId}-${Date.now()}`;

        const submitResult = await submitOrderMutation.mutateAsync({
          orderId: orderId!,
          expectedVersion,
          idempotencyKey,
        });

        const submittedCount =
          submitResult?.submitted_item_count ??
          draftCartLines.reduce((acc, ci) => acc + ci.quantity, 0);

        if (submitResult?.order?.items?.length) {
          setCartItems(mapBranchOrderItemsToCart(submitResult.order.items));
        } else {
          setCartItems((prev) =>
            prev.map((ci) =>
              ci.isExisting
                ? ci
                : {
                    ...ci,
                    isExisting: true,
                    disableDelete: true,
                    originalQuantity: ci.quantity,
                    itemBadges: ['Submitted'],
                  },
            ),
          );
        }

        const kotSuffix = submitResult?.kot_number ? ` (KOT ${submitResult.kot_number})` : '';
        const successMsg = `✓ ${submittedCount} item(s) sent to KOT for ${targetTable}${kotSuffix}!`;
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
    branchMenusQuery.isLoading || (Boolean(selectedMenuAssignment) && menuTreeQuery.isLoading);

  const isMenuError = branchMenusQuery.isError || menuTreeQuery.isError;

  return {
    branchMenusQuery,
    menuTreeQuery,
    orderDetailQuery,
    searchQuery,
    setSearchQuery,
    selectedMenuId: selectedMenuAssignmentId,
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
    isAddingToOrder: addOrderItemsMutation.isPending,
    isRemovingFromOrder: removeOrderItemMutation.isPending,
    primaryOrderLabel,
  };
}
