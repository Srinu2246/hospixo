'use client';

import { useMemo } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';

import { Toast } from '@/components/shared/ui/Toast';
import { MenuOrderSummaryBar } from '@/components/shared/restaurant-menu/MenuOrderSummaryBar';
import { OrderSettle } from '@/features/pos/point-of-sale/all-orders/OrderSettle';
import { buildReviewOrderData, resolvePosTableName } from '@/lib/helpers/posOrderHelpers';
import { usePosOrder } from '@/lib/hooks/pos/point-of-sale/usePosOrder';
import type { CartItem } from '@/lib/mocks/pos/usePosMenu.mocks';
import type { PosTableItem } from '@/lib/schemas/pos/point-of-sale/tables/posTableViewSchema';

import { TakeawayMenuCatalog } from './TakeawayMenuCatalog';
import { TakeawayTopBar } from './TakeawayTopBar';

function menuErrorMessage(itemsError: unknown, categoriesError: unknown): string {
  if (itemsError instanceof Error) return itemsError.message;
  if (categoriesError instanceof Error) return categoriesError.message;
  return 'The menu request failed.';
}

export interface TakeawayPageProps {
  table?: PosTableItem | null;
  mode?: 'takeaway' | 'dine-in' | 'table';
  orderId?: string;
  onBackToTables?: () => void;
  onServeOrder?: (table: PosTableItem, items: CartItem[]) => void;
}

/**
 * POS Take-Away & Dine-In ordering: top bar, menu catalog, order summary, checkout.
 */
export function TakeawayPage({
  table,
  mode = 'takeaway',
  orderId,
  onBackToTables,
  onServeOrder,
}: Readonly<TakeawayPageProps> = {}) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const effectiveOrderId = orderId ?? searchParams?.get('orderId');
  const startInCheckout = Boolean(
    pathname?.endsWith('/checkout') ||
    pathname?.endsWith('/success') ||
    pathname?.endsWith('/payment-success'),
  );

  const resolvedTableName = useMemo(
    () => resolvePosTableName(table, effectiveOrderId, pathname),
    [table, effectiveOrderId, pathname],
  );

  const order = usePosOrder({
    effectiveOrderId,
    table,
    mode,
    resolvedTableName,
    onServeOrder,
    onBackToTables,
    startInCheckout,
  });

  if (order.isCheckingOut) {
    return (
      <OrderSettle
        initialStep="checkout"
        reviewOrderData={buildReviewOrderData(order.cartItems, table)}
        onBack={() => order.leaveCheckout(false)}
        onNewOrder={() => order.leaveCheckout(true)}
      />
    );
  }

  const orderNumber = effectiveOrderId
    ? `#${effectiveOrderId.replace(/^#/, '')}`
    : table
      ? `#00${table.id.replace('t-', '')}`
      : '#0029';

  const orderTypeLabel = resolvedTableName
    ? `${resolvedTableName.toUpperCase()} · DINE-IN`
    : table
      ? `${table.name.toUpperCase()} · DINE-IN`
      : 'COUNTER 01';

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
      <TakeawayTopBar
        table={table}
        mode={mode}
        effectiveOrderId={effectiveOrderId}
        resolvedTableName={resolvedTableName}
        primaryOrderLabel={order.primaryOrderLabel}
        onBackToTables={onBackToTables}
        onServeItems={order.handleServeItems}
        onNewOrder={() => order.setCartItems([])}
      />

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
        <TakeawayMenuCatalog
          searchQuery={order.searchQuery}
          onSearchChange={order.setSearchQuery}
          viewMode={order.viewMode}
          onViewModeChange={order.setViewMode}
          categoryFilterItems={order.categoryFilterItems}
          activeCategory={order.activeCategory}
          onCategoryChange={order.setActiveCategory}
          isLoading={order.categoriesQuery.isLoading || order.itemsQuery.isLoading}
          isError={order.categoriesQuery.isError || order.itemsQuery.isError}
          errorMessage={menuErrorMessage(order.itemsQuery.error, order.categoriesQuery.error)}
          groupedSections={order.groupedSections}
          getItemCartQuantity={order.getItemCartQuantity}
          onAddDefault={order.handleAddDefaultItem}
          onDecrementDefault={order.handleDecrementDefaultItem}
          onAddCustomized={order.handleAddCustomizedItem}
        />

        <Box sx={{ height: '100%', flexShrink: 0 }}>
          <MenuOrderSummaryBar
            items={order.cartItems}
            orderNumber={orderNumber}
            orderTypeLabel={orderTypeLabel}
            discount={0}
            onUpdateQuantity={order.handleUpdateCartQuantity}
            onRemoveItem={order.handleRemoveCartItem}
            onGenerateBill={order.handleGenerateBill}
            onProceedCheckout={order.handleProceedCheckout}
            onServe={resolvedTableName || table ? order.handleServeItems : undefined}
            serveLabel="Send to KOT"
          />
        </Box>
      </Box>

      <Toast
        open={Boolean(order.toastMessage)}
        message={order.toastMessage}
        onClose={() => order.setToastMessage(null)}
      />
    </Box>
  );
}
