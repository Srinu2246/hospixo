'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { onlineOrdersPageMeta } from '@/features/pos/config/online-orders';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { OnlineOrderCard } from '@/features/pos/screens/online-orders/online-order-card';
import { OnlineOrdersAlert } from '@/features/pos/screens/online-orders/online-orders-alert';
import { OnlineOrdersFooter } from '@/features/pos/screens/online-orders/online-orders-footer';
import { OnlineOrdersHeader } from '@/features/pos/screens/online-orders/online-orders-header';

import type { OnlineOrdersPageViewModel } from './use-online-orders-page';

interface CompactOnlineOrdersContentProps extends OnlineOrdersPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactOnlineOrdersContent({
  layout,
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
}: Readonly<CompactOnlineOrdersContentProps>) {
  return (
    <PosMobileShell activeNavId="orders" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader
            title={onlineOrdersPageMeta.title}
            subtitle={onlineOrdersPageMeta.subtitle}
          />
          <OnlineOrdersHeader
            activeChannel={activeChannel}
            onChannelChange={setActiveChannel}
            totalOrdersCount={orders.length}
            pendingCount={pendingCount}
            hideTitle
          />
        </PosCompactHeader>

        <PosCompactBody>
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
            <Alert severity="error" sx={{ mb: 2 }}>
              {loadError ?? 'Unable to load online orders.'}
            </Alert>
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
              gridTemplateColumns: layout === 'tablet' ? 'repeat(2, minmax(0, 1fr))' : '1fr',
              gap: 1.5,
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
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
              No orders for this channel.
            </Typography>
          ) : null}

          <OnlineOrdersFooter />
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
