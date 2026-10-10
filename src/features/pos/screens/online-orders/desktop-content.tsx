'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { OnlineOrderCard } from '@/features/pos/screens/online-orders/online-order-card';
import { OnlineOrdersAlert } from '@/features/pos/screens/online-orders/online-orders-alert';
import { OnlineOrdersFooter } from '@/features/pos/screens/online-orders/online-orders-footer';
import { OnlineOrdersHeader } from '@/features/pos/screens/online-orders/online-orders-header';

import type { OnlineOrdersPageViewModel } from './use-online-orders-page';

export function OnlineOrdersDesktopContent({
  activeChannel,
  setActiveChannel,
  orders,
  pendingCount,
  visibleOrders,
  handleAccept,
  handleReject,
  handleMarkReady,
  isLoading,
  isError,
  loadError,
  isMutating,
  mutationError,
  mutationSucceeded,
  pendingAcceptOrder,
}: Readonly<OnlineOrdersPageViewModel>) {
  return (
    <PosOperationsShell withPageBg>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          minHeight: 'calc(100dvh - var(--pos-header-height))',
          pb: 3,
          bgcolor: 'var(--pos-page-bg)',
        }}
      >
        <OnlineOrdersHeader
          activeChannel={activeChannel}
          onChannelChange={setActiveChannel}
          totalOrdersCount={orders.length}
          pendingCount={pendingCount}
        />
        <OnlineOrdersAlert highlightOrder={pendingAcceptOrder} />

        {mutationError ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {mutationError}
          </Alert>
        ) : null}
        {mutationSucceeded ? (
          <Alert severity="success" sx={{ mb: 2 }}>
            Order updated successfully.
          </Alert>
        ) : null}
        {isError || loadError ? (
          <Typography role="alert" color="error" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
            {loadError ?? 'Unable to load online orders.'}
          </Typography>
        ) : null}

        {isLoading ? (
          <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
            Loading online orders…
          </Typography>
        ) : null}

        <Box
          component="section"
          aria-label="Online order cards"
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            gap: { xs: 2, xl: 2.25 },
            width: '100%',
          }}
        >
          {visibleOrders.map((order) => (
            <OnlineOrderCard
              key={order.id}
              order={order}
              onAccept={handleAccept}
              onReject={handleReject}
              onMarkReady={handleMarkReady}
              isMutating={isMutating}
            />
          ))}
        </Box>

        {!isLoading && !isError && visibleOrders.length === 0 ? (
          <Typography color="text.secondary" sx={{ py: 3, textAlign: 'center', fontSize: 14 }}>
            No orders for this channel.
          </Typography>
        ) : null}

        <OnlineOrdersFooter />
      </Box>
    </PosOperationsShell>
  );
}
