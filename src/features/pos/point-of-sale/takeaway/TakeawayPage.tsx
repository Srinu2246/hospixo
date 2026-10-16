'use client';

import { useState, useMemo } from 'react';
import { createCartLineId } from '@/lib/helpers/cartId';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';
import {
  ChevronDown,
  ChevronLeft,
  SlidersHorizontal,
  Plus,
  LayoutGrid,
  LayoutList,
  Utensils,
} from 'lucide-react';

import { Toast } from '@/components/shared/ui/Toast';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { OrderSettle } from '@/features/pos/point-of-sale/all-orders/OrderSettle';
import type { OrderReviewData } from '@/features/pos/point-of-sale/components/OrderReviewSection';

import { FilterBar, type FilterBarItem } from '@/components/shared/form-fields/FilterBar';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { MenuItemCard } from '@/components/shared/restaurant-menu/MenuItemCard';
import { MenuOrderSummaryBar } from '@/components/shared/restaurant-menu/MenuOrderSummaryBar';
import { colors } from '@/lib/theme/mui/colors';
import type { PosTableItem } from '@/lib/mocks/pos/usePosTables.mocks';
import { getMockOrderSettleDetail } from '@/lib/mocks/pos/usePosOrders.mocks';
import {
  MOCK_MENU_ITEMS,
  INITIAL_CART_ITEMS,
  type MenuCategory,
  type PosMenuItem,
  type CartItem,
  type CartCustomization,
} from '@/lib/mocks/pos/usePosMenu.mocks';

const CATEGORY_FILTER_ITEMS: readonly FilterBarItem<MenuCategory>[] = [
  { id: 'all', label: 'ALL' },
  { id: 'starters', label: 'STARTERS' },
  { id: 'mains', label: 'MAINS' },
  { id: 'desserts', label: 'DESSERTS' },
  { id: 'beverages', label: 'BEVERAGES' },
];

export interface TakeawayPageProps {
  table?: PosTableItem | null;
  mode?: 'takeaway' | 'dine-in' | 'table';
  orderId?: string;
  onBackToTables?: () => void;
  onServeOrder?: (table: PosTableItem, items: CartItem[]) => void;
}

/**
 * TakeawayPage Component
 *
 * Full-screen POS Take-Away & Dine-In Table Ordering page featuring:
 * 1. Top bar with Table/Counter info, date, filters, and back to tables action.
 * 2. Left panel menu catalog with FilterBar, SearchBar, and expanding PosMenuItemCards.
 * 3. Right panel fixed full-height PosOrderSummaryBar with live cart calculations.
 * 4. Seamless in-place checkout flow via OrderSettle.
 * Exclusively uses theme tokens from `@/lib/theme/mui/colors`.
 */
export function TakeawayPage({
  table,
  mode = 'takeaway',
  orderId,
  onBackToTables,
  onServeOrder,
}: Readonly<TakeawayPageProps> = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const effectiveOrderId = orderId ?? searchParams?.get('orderId');

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<MenuCategory>('all');
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    if (effectiveOrderId) {
      const orderDetail = getMockOrderSettleDetail(effectiveOrderId);
      if (orderDetail && orderDetail.items.length > 0) {
        return orderDetail.items.map((it) => ({
          cartId: `existing-${it.id}`,
          menuItemId: it.id,
          name: it.name,
          basePrice: it.unitPrice,
          unitPrice: it.unitPrice,
          quantity: it.quantity,
          originalQuantity: it.quantity,
          isExisting: true,
          disableDelete: true,
          imageUrl:
            'https://images.unsplash.com/photo-1612874742237-6526221588e3?auto=format&fit=crop&w=160&q=80',
          itemBadges: ['Ordered'],
        }));
      }
    }
    if (table && table.status === 'available') {
      return [];
    }
    if (table && (table.status === 'occupied' || table.status === 'billing')) {
      return INITIAL_CART_ITEMS.map((ci) => ({
        ...ci,
        isExisting: true,
        disableDelete: true,
        originalQuantity: ci.quantity,
        itemBadges: [...(ci.itemBadges ?? []), 'Ordered'],
      }));
    }
    return INITIAL_CART_ITEMS;
  });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const isCheckoutRoute = Boolean(
    pathname?.endsWith('/checkout') ||
    pathname?.endsWith('/success') ||
    pathname?.endsWith('/payment-success'),
  );
  const [isCheckingOut, setIsCheckingOut] = useState(isCheckoutRoute);

  // Compute resolved table name/number (e.g. "Table 4" or "Table T4")
  const resolvedTableName = useMemo(() => {
    if (table?.name) return table.name;
    if (effectiveOrderId) {
      const detail = getMockOrderSettleDetail(effectiveOrderId);
      if (detail?.reference && detail.reference.toLowerCase().includes('table')) {
        return detail.reference;
      }
    }
    const match = pathname?.match(/\/(?:tables|dine-in)\/([^/?]+)/i);
    if (match?.[1]) {
      const id = match[1];
      const numMatch = id.match(/\d+/);
      return numMatch ? `Table ${numMatch[0]}` : `Table ${id.toUpperCase()}`;
    }
    return null;
  }, [table, effectiveOrderId, pathname]);

  // Filter items according to search text and selected category
  const filteredMenuItems = useMemo(() => {
    return MOCK_MENU_ITEMS.filter((item) => {
      // Category filter
      if (activeCategory !== 'all' && item.category !== activeCategory) {
        return false;
      }
      // Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const matchesName = item.name.toLowerCase().includes(query);
        const matchesCategory = item.categorySection.toLowerCase().includes(query);
        return matchesName || matchesCategory;
      }
      return true;
    });
  }, [activeCategory, searchQuery]);

  // Group items by category section for display (e.g. BIRYANI'S, STARTERS, etc.)
  const groupedSections = useMemo(() => {
    const sections: Record<string, PosMenuItem[]> = {};
    filteredMenuItems.forEach((item) => {
      if (!sections[item.categorySection]) {
        sections[item.categorySection] = [];
      }
      sections[item.categorySection].push(item);
    });
    return Object.entries(sections);
  }, [filteredMenuItems]);

  // Get current quantity of a specific item in the cart (for quick counter on card)
  const getItemCartQuantity = (menuItemId: string): number => {
    return cartItems
      .filter((ci) => ci.menuItemId === menuItemId)
      .reduce((sum, ci) => sum + ci.quantity, 0);
  };

  // 1. Direct Add Default Item (when clicking "+ Add" button directly without customization)
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
      const newItem: CartItem = {
        cartId: createCartLineId(),
        menuItemId: item.id,
        name: item.name,
        basePrice: item.basePrice,
        unitPrice: item.basePrice,
        quantity: 1,
        imageUrl: item.imageUrl,
        itemBadges: ['1 Item', defaultSize],
      };
      return [...prev, newItem];
    });

    setToastMessage(`Added ${item.name} to order`);
  };

  // Decrement default item
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

  // 2. Add Customized Item (from expanded drawer)
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

  // Cart quantity update
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

  // Cart remove item
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

  // Checkout trigger
  const handleProceedCheckout = () => {
    setIsCheckingOut(true);
    const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '/pos/point-of-sale/takeaway';
    if (!cleanPath.endsWith('/checkout')) {
      router.push(`${cleanPath}/checkout`);
    }
  };

  const handleGenerateBill = () => {
    setToastMessage('Bill generated successfully!');
  };

  const isSendToKot = mode === 'table';
  const primaryOrderLabel = isSendToKot
    ? 'Send to KOT'
    : `Serve to ${resolvedTableName ?? table?.name ?? 'Table'}`;

  // Serve items (dine-in) or send ticket to kitchen (tables flow)
  const handleServeItems = () => {
    const targetTable = resolvedTableName ?? table?.name ?? 'Table';
    if (cartItems.length === 0) {
      setToastMessage(
        isSendToKot
          ? `Please add items from the menu before sending to KOT.`
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

  // Render in-place checkout flow when proceeding to checkout
  if (isCheckingOut) {
    const subtotal = cartItems.reduce((sum, ci) => sum + ci.unitPrice * ci.quantity, 0);
    const serviceCharge = Math.round(subtotal * 0.02 * 100) / 100;
    const tax = Math.round(subtotal * 0.05 * 100) / 100;
    const platformFee = 25;
    const discountAmount = Math.min(subtotal, 87);
    const grandTotal = Math.max(0, subtotal - discountAmount + platformFee + serviceCharge + tax);

    const reviewOrderData: OrderReviewData = {
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

    return (
      <OrderSettle
        initialStep="checkout"
        reviewOrderData={reviewOrderData}
        onBack={() => {
          setIsCheckingOut(false);
          const cleanPath = pathname ? pathname.replace(/\/+$/, '') : '/pos/point-of-sale/takeaway';
          const parent = cleanPath.replace(/\/(checkout|success|payment-success)$/, '');
          router.push(parent);
        }}
        onNewOrder={() => {
          setIsCheckingOut(false);
          setCartItems(INITIAL_CART_ITEMS);
          if (onBackToTables) {
            onBackToTables();
          } else {
            const cleanPath = pathname
              ? pathname.replace(/\/+$/, '')
              : '/pos/point-of-sale/takeaway';
            const parent = cleanPath.replace(/\/(checkout|success|payment-success)$/, '');
            router.push(parent);
          }
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'background.default',
        overflow: 'hidden',
      }}
    >
      {/* ------------------------------------------------------------- */}
      {/* 1. Top Bar: Table/Take-Away Meta, Filters, New Order Button    */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flexShrink: 0,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          px: { xs: 2, sm: 3 },
          py: 1.5,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
        }}
      >
        {/* Left: Back to Tables + Title + Table / Counter Meta */}
        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          {onBackToTables && (
            <ButtonBase
              onClick={onBackToTables}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: 'divider',
                bgcolor: 'background.paper',
                display: 'flex',
                alignItems: 'center',
                gap: 0.75,
                color: 'text.primary',
                fontWeight: 700,
                fontSize: '0.8125rem',
                transition: 'all 0.15s ease-in-out',
                '&:hover': {
                  bgcolor: 'action.hover',
                  borderColor: 'primary.main',
                },
              }}
            >
              <ChevronLeft size={16} strokeWidth={2.5} />
              Tables
            </ButtonBase>
          )}

          <Typography
            sx={{
              fontSize: { xs: '1.25rem', sm: '1.375rem' },
              fontWeight: 800,
              color: 'text.primary',
              letterSpacing: '-0.02em',
            }}
          >
            {table
              ? `${table.name} · Dine-In`
              : effectiveOrderId
                ? `Order #${effectiveOrderId.replace(/^#/, '')}`
                : 'Take-Away'}
          </Typography>

          {effectiveOrderId && (
            <Box
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: '6px',
                bgcolor: 'action.hover',
                color: 'primary.main',
                fontSize: '0.75rem',
                fontWeight: 700,
                border: '1px solid',
                borderColor: 'divider',
              }}
            >
              Adding Items to Order
            </Box>
          )}

          {table ? (
            <>
              {/* Table Status Chip */}
              <StatusChip
                status={table.status}
                label={table.status.toUpperCase()}
                size="small"
                showDot
              />

              {/* Floor Badge */}
              <Box
                sx={{
                  px: 1.25,
                  py: 0.5,
                  borderRadius: '8px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                  border: '1px solid',
                  borderColor: 'divider',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: 'text.secondary',
                }}
              >
                {table.floorId?.replace('-', ' ').toUpperCase() ?? 'GROUND FLOOR'}
              </Box>

              {/* Guests Count */}
              {table.guests !== undefined && (
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  <GroupOutlinedIcon sx={{ fontSize: 15 }} />
                  {table.guests} Guests
                </Box>
              )}

              {/* Waiter Name */}
              {table.waiter && (
                <Box
                  sx={{
                    px: 1.25,
                    py: 0.5,
                    borderRadius: '8px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? 'action.hover' : colors.surface.muted,
                    border: '1px solid',
                    borderColor: 'divider',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    color: 'text.secondary',
                  }}
                >
                  <PersonOutlineOutlinedIcon sx={{ fontSize: 15 }} />
                  {table.waiter}
                </Box>
              )}
            </>
          ) : (
            <>
              {/* Counter Dropdown Trigger */}
              <ButtonBase
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                Counter 01 <ChevronDown size={14} />
              </ButtonBase>

              {/* Section / Token Picker */}
              <ButtonBase
                sx={{
                  px: 1.5,
                  py: 0.75,
                  borderRadius: '8px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1,
                  color: 'text.primary',
                  fontWeight: 600,
                  fontSize: '0.8125rem',
                  '&:hover': { bgcolor: 'action.hover' },
                }}
              >
                Token A <ChevronDown size={14} />
              </ButtonBase>

              {/* Token / Order Info */}
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}>
                Token No : 12
              </Typography>

              {/* Date Indicator */}
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                Oct 24, 2024
              </Typography>
            </>
          )}
        </Stack>

        {/* Right: Quick Actions */}
        <Stack direction="row" spacing={1.25} sx={{ alignItems: 'center' }}>
          <IconButton
            size="small"
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: '8px',
              color: 'text.primary',
              p: 0.85,
              '&:hover': { bgcolor: 'action.hover' },
            }}
          >
            <SlidersHorizontal size={18} />
          </IconButton>

          {/* Tables flow: Send to KOT. Dine-in: Serve to table. */}
          {(resolvedTableName || table) && (
            <ActionButton
              variant="primary"
              size="medium"
              startIcon={<Utensils size={16} />}
              onClick={handleServeItems}
              sx={{
                bgcolor: colors.success.default,
                color: colors.white.default,
                fontWeight: 700,
                fontSize: '0.8125rem',
                borderRadius: '8px',
                height: 38,
                px: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: colors.success.dark },
              }}
            >
              {primaryOrderLabel}
            </ActionButton>
          )}

          {/* For counter takeaway without table, show + New Order */}
          {!table && !resolvedTableName && mode === 'takeaway' && (
            <ActionButton
              variant="primary"
              size="medium"
              startIcon={<Plus size={16} />}
              onClick={() => setCartItems([])}
              sx={{
                bgcolor: colors.primary.default,
                color: colors.white.default,
                fontWeight: 700,
                fontSize: '0.8125rem',
                borderRadius: '8px',
                height: 38,
                px: 2,
                boxShadow: 'none',
                '&:hover': { bgcolor: colors.primary.dark },
              }}
            >
              + New Order
            </ActionButton>
          )}
        </Stack>
      </Box>

      {/* ------------------------------------------------------------- */}
      {/* 2. Main Two-Column Canvas (Menu Catalog + Fixed Bill Bar)      */}
      {/* ------------------------------------------------------------- */}
      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          pt: { xs: 1.5, sm: 2.5 },
          pb: 0,
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          gap: 2.5,
          overflow: 'hidden',
        }}
      >
        {/* Left Column: Menu Catalog Panel */}
        <Box
          sx={{
            flex: 1,
            minWidth: 0,
            height: '100%',
            bgcolor: 'background.paper',
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            p: { xs: 2, sm: 2.5 },
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.05)',
          }}
        >
          {/* Menu Top Bar: Menu title + SearchBar + View Mode */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              mb: 2,
              flexShrink: 0,
              flexWrap: 'wrap',
            }}
          >
            <Typography
              sx={{
                fontSize: '1.125rem',
                fontWeight: 800,
                color: 'text.primary',
                letterSpacing: '-0.01em',
              }}
            >
              Menu
            </Typography>

            {/* Global SearchBar */}
            <Box sx={{ flex: 1, minWidth: 220 }}>
              <SearchBar
                value={searchQuery}
                onChange={(val: string) => setSearchQuery(val)}
                onClear={() => setSearchQuery('')}
                placeholder="Search items, ingredients..."
                fullWidth
                showClear
                sx={{
                  height: 40,
                }}
              />
            </Box>

            {/* View Mode Toggle Buttons */}
            <Stack direction="row" spacing={0.75} sx={{ flexShrink: 0 }}>
              <IconButton
                size="small"
                onClick={() => setViewMode('list')}
                aria-label="List view"
                sx={{
                  border: '1px solid',
                  borderColor: viewMode === 'list' ? 'primary.main' : 'divider',
                  borderRadius: '8px',
                  bgcolor: viewMode === 'list' ? 'primary.main' : 'transparent',
                  color: viewMode === 'list' ? colors.white.default : 'text.secondary',
                  p: 0.75,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: viewMode === 'list' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <LayoutList size={18} />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                sx={{
                  border: '1px solid',
                  borderColor: viewMode === 'grid' ? 'primary.main' : 'divider',
                  borderRadius: '8px',
                  bgcolor: viewMode === 'grid' ? 'primary.main' : 'transparent',
                  color: viewMode === 'grid' ? colors.white.default : 'text.secondary',
                  p: 0.75,
                  transition: 'all 0.15s ease-in-out',
                  '&:hover': {
                    bgcolor: viewMode === 'grid' ? 'primary.dark' : 'action.hover',
                  },
                }}
              >
                <LayoutGrid size={18} />
              </IconButton>
            </Stack>
          </Box>

          {/* Category FilterBar */}
          <Box sx={{ mb: 2.5, flexShrink: 0 }}>
            <FilterBar<MenuCategory>
              items={CATEGORY_FILTER_ITEMS}
              value={activeCategory}
              onChange={(cat) => setActiveCategory(cat)}
              size="small"
            />
          </Box>

          {/* Scrollable Menu Items List */}
          <Box
            sx={{
              flex: 1,
              minHeight: 0,
              overflowY: 'auto',
              pr: 1,
              scrollbarWidth: 'thin',
              scrollbarColor: (theme) =>
                theme.palette.mode === 'dark'
                  ? 'rgba(255, 255, 255, 0.15) transparent'
                  : `${colors.border.default} transparent`,
              '&::-webkit-scrollbar': {
                width: 5,
              },
              '&::-webkit-scrollbar-track': {
                background: 'transparent',
              },
              '&::-webkit-scrollbar-thumb': {
                background: (theme) =>
                  theme.palette.mode === 'dark'
                    ? 'rgba(255, 255, 255, 0.15)'
                    : colors.border.default,
                borderRadius: 3,
                '&:hover': {
                  background: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255, 255, 255, 0.25)' : colors.gray.light,
                },
              },
            }}
          >
            {groupedSections.length === 0 ? (
              <Box
                sx={{
                  py: 8,
                  textAlign: 'center',
                  color: 'text.secondary',
                }}
              >
                <Typography sx={{ fontWeight: 600 }}>No menu items found</Typography>
                <Typography sx={{ fontSize: '0.8125rem' }}>
                  Try adjusting your search query or category filter
                </Typography>
              </Box>
            ) : (
              <Stack spacing={3}>
                {groupedSections.map(([sectionName, items]) => (
                  <Box key={sectionName}>
                    {/* Section Header */}
                    <Typography
                      sx={{
                        fontSize: '0.8125rem',
                        fontWeight: 800,
                        color: 'text.secondary',
                        letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        mb: 1.5,
                      }}
                    >
                      {sectionName}
                    </Typography>

                    {/* Items Rendering: List or Grid */}
                    {viewMode === 'list' ? (
                      <Stack spacing={1.5}>
                        {items.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            viewMode="list"
                            quantityInCart={getItemCartQuantity(item.id)}
                            onAddDefault={() => handleAddDefaultItem(item)}
                            onDecrementDefault={() => handleDecrementDefaultItem(item)}
                            onAddCustomized={(customization, qty, unitPrice) =>
                              handleAddCustomizedItem(item, customization, qty, unitPrice)
                            }
                          />
                        ))}
                      </Stack>
                    ) : (
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: {
                            xs: '1fr',
                            sm: 'repeat(2, 1fr)',
                            md: 'repeat(2, 1fr)',
                            lg: 'repeat(3, 1fr)',
                            xl: 'repeat(4, 1fr)',
                          },
                          gap: 2,
                        }}
                      >
                        {items.map((item) => (
                          <MenuItemCard
                            key={item.id}
                            item={item}
                            viewMode="grid"
                            quantityInCart={getItemCartQuantity(item.id)}
                            onAddDefault={() => handleAddDefaultItem(item)}
                            onDecrementDefault={() => handleDecrementDefaultItem(item)}
                            onAddCustomized={(customization, qty, unitPrice) =>
                              handleAddCustomizedItem(item, customization, qty, unitPrice)
                            }
                          />
                        ))}
                      </Box>
                    )}
                  </Box>
                ))}
              </Stack>
            )}
          </Box>
        </Box>

        {/* Right Column: Fixed Full-Height MenuOrderSummaryBar */}
        <Box sx={{ height: '100%', flexShrink: 0 }}>
          <MenuOrderSummaryBar
            items={cartItems}
            orderNumber={
              effectiveOrderId
                ? `#${effectiveOrderId.replace(/^#/, '')}`
                : table
                  ? `#00${table.id.replace('t-', '')}`
                  : '#0029'
            }
            orderTypeLabel={
              resolvedTableName
                ? `${resolvedTableName.toUpperCase()} · DINE-IN`
                : table
                  ? `${table.name.toUpperCase()} · DINE-IN`
                  : 'COUNTER 01'
            }
            discount={0}
            onUpdateQuantity={handleUpdateCartQuantity}
            onRemoveItem={handleRemoveCartItem}
            onGenerateBill={handleGenerateBill}
            onProceedCheckout={handleProceedCheckout}
            onServe={resolvedTableName || table ? handleServeItems : undefined}
            serveLabel={'Send to KOT'}
          />
        </Box>
      </Box>

      {/* Global Top-Center Toast Feedback */}
      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage}
        onClose={() => setToastMessage(null)}
      />
    </Box>
  );
}
