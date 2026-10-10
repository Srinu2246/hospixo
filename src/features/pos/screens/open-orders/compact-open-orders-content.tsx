'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import {
  openOrdersPageMeta,
  openOrdersPillFilters,
  type OpenOrderType,
} from '@/features/pos/config/open-orders';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactHeaderChrome,
  PosCompactPage,
  PosCompactSearch,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { CompactOpenOrderCard } from '@/features/pos/screens/open-orders/compact-open-order-card';
import { OpenOrdersFooter } from '@/features/pos/screens/open-orders/open-orders-footer';

import type { OpenOrdersPageViewModel } from './use-open-orders-page';

interface CompactOpenOrdersContentProps extends OpenOrdersPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactOpenOrdersContent({
  layout,
  activeType,
  setActiveType,
  searchQuery,
  setSearchQuery,
  visibleOrders,
  footerSummary,
  page,
  totalPages,
  setPage,
  handleAddItems,
  handleSettleBill,
  isLoading,
  isError,
  loadError,
}: Readonly<CompactOpenOrdersContentProps>) {
  const mobileFilters = openOrdersPillFilters.filter((f) =>
    ['all', 'dineIn', 'takeaway', 'delivery'].includes(f.id),
  );

  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader title={openOrdersPageMeta.title} subtitle="Live active tickets" />
          <PosCompactHeaderChrome>
            <Stack
              component="div"
              direction="row"
              role="tablist"
              aria-label="Order type filters"
              sx={{ flexWrap: 'wrap', gap: 1 }}
            >
              {mobileFilters.map((filter) => {
                const active = filter.id === activeType;
                return (
                  <Button
                    key={filter.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setActiveType(filter.id as OpenOrderType)}
                    variant={active ? 'contained' : 'outlined'}
                    sx={{
                      minHeight: 32,
                      px: 1.75,
                      borderRadius: 999,
                      borderColor: active ? 'var(--pos-primary)' : 'var(--pos-border-strong)',
                      bgcolor: active ? 'var(--pos-primary)' : 'var(--pos-surface)',
                      color: active ? '#fff' : 'text.secondary',
                      fontSize: 12,
                      fontWeight: 600,
                      textTransform: 'none',
                    }}
                  >
                    {filter.label}
                  </Button>
                );
              })}
            </Stack>
          </PosCompactHeaderChrome>
        </PosCompactHeader>

        <PosCompactBody>
          <PosCompactSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder={openOrdersPageMeta.searchPlaceholder}
          />

          {isError || loadError ? (
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError ?? 'Unable to load orders.'}
            </Alert>
          ) : null}
          {isLoading ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
              Loading orders…
            </Typography>
          ) : null}

          {visibleOrders.length > 0 ? (
            <Box
              component="section"
              aria-label="Open orders"
              sx={{
                display: 'grid',
                gridTemplateColumns: layout === 'tablet' ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                gap: 1.5,
              }}
            >
              {visibleOrders.map((order) => (
                <CompactOpenOrderCard
                  key={order.id}
                  order={order}
                  onAddItems={handleAddItems}
                  onSettleBill={handleSettleBill}
                />
              ))}
            </Box>
          ) : !isLoading && !isError ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
              No open orders match your filters.
            </Typography>
          ) : null}

          <OpenOrdersFooter
            summaryText={footerSummary}
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
