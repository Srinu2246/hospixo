'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { OpenOrdersFilters } from '@/features/pos/screens/open-orders/open-orders-filters';
import { OpenOrdersFooter } from '@/features/pos/screens/open-orders/open-orders-footer';
import { OpenOrdersHeader } from '@/features/pos/screens/open-orders/open-orders-header';
import { OpenOrdersTable } from '@/features/pos/screens/open-orders/open-orders-table';

import type { OpenOrdersPageViewModel } from './use-open-orders-page';

export function OpenOrdersDesktopContent({
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
}: Readonly<OpenOrdersPageViewModel>) {
  function handleTypeChange(type: OpenOrderType) {
    setActiveType(type);
  }

  return (
    <PosOperationsShell withPageBg>
      <Box sx={{ width: '100%', pb: 3, bgcolor: 'var(--pos-page-bg)' }}>
        <OpenOrdersHeader
          activeType={activeType}
          searchQuery={searchQuery}
          onTypeChange={handleTypeChange}
          onSearchChange={setSearchQuery}
        />

        <OpenOrdersFilters activeType={activeType} onChange={handleTypeChange} />

        {isError || loadError ? (
          <Typography role="alert" color="error" sx={{ mt: 2, textAlign: 'center', fontSize: 14 }}>
            {loadError ?? 'Unable to load orders.'}
          </Typography>
        ) : null}

        {isLoading ? (
          <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center', fontSize: 14 }}>
            Loading orders…
          </Typography>
        ) : null}

        <OpenOrdersTable
          orders={visibleOrders}
          onAddItems={handleAddItems}
          onSettleBill={handleSettleBill}
        />

        {!isLoading && !isError && visibleOrders.length === 0 ? (
          <Typography color="text.secondary" sx={{ mt: 2, textAlign: 'center', fontSize: 14 }}>
            No open orders match your filters.
          </Typography>
        ) : null}

        <OpenOrdersFooter
          summaryText={footerSummary}
          page={page}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </Box>
    </PosOperationsShell>
  );
}
