'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { readyListPageMeta } from '@/features/pos/config/ready-list';
import {
  PosCompactBody,
  PosCompactHeader,
  PosCompactPage,
} from '@/features/pos/screens/layout/pos-compact-page';
import { PosMobileHeader } from '@/features/pos/screens/layout/pos-mobile-header';
import { PosMobileShell } from '@/features/pos/screens/layout/pos-mobile-shell';
import { ReadyListHeader } from '@/features/pos/screens/ready-list/ready-list-header';
import { ReadyOrderCard } from '@/features/pos/screens/ready-list/ready-order-card';

import type { ReadyListPageViewModel } from './use-ready-list-page';

interface CompactReadyListContentProps extends ReadyListPageViewModel {
  layout: 'mobile' | 'tablet';
}

export function CompactReadyListContent({
  layout,
  activeTab,
  setActiveTab,
  query,
  setQuery,
  visibleOrders,
  handleServe,
  activeCount,
  tabs,
  isLoading,
  isError,
  loadError,
  isMutating,
  mutationError,
  mutationSucceeded,
}: Readonly<CompactReadyListContentProps>) {
  return (
    <PosMobileShell activeNavId="ready" withPageBg>
      <PosCompactPage>
        <PosCompactHeader>
          <PosMobileHeader
            title={readyListPageMeta.title}
            subtitle={readyListPageMeta.mobileSubtitle}
          />
          <ReadyListHeader
            query={query}
            onQueryChange={setQuery}
            activeTab={activeTab}
            onTabChange={setActiveTab}
            tabs={tabs}
            activeCount={activeCount}
            hideTitle
          />
        </PosCompactHeader>

        <PosCompactBody>
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
              {loadError ?? readyListPageMeta.loadErrorFallback}
            </Alert>
          ) : null}
          {isLoading ? (
            <Typography color="text.secondary" sx={{ py: 2, textAlign: 'center', fontSize: 14 }}>
              {readyListPageMeta.loadingLabel}
            </Typography>
          ) : null}

          {visibleOrders.length > 0 ? (
            <Box
              component="section"
              aria-label={`${activeTab} ready orders`}
              sx={{
                display: 'grid',
                gridTemplateColumns: layout === 'tablet' ? 'repeat(2, minmax(0, 1fr))' : '1fr',
                gap: 1.5,
              }}
            >
              {visibleOrders.map((order) => (
                <ReadyOrderCard
                  key={order.id}
                  order={order}
                  onServe={handleServe}
                  isMutating={isMutating}
                  compact
                />
              ))}
            </Box>
          ) : !isLoading && !isError ? (
            <Stack sx={{ py: 4, textAlign: 'center' }}>
              <Typography component="h2" variant="subtitle1">
                {readyListPageMeta.emptyTitle}
              </Typography>
              <Typography color="text.secondary" variant="body2" sx={{ mt: 0.75 }}>
                {readyListPageMeta.emptyDescription}
              </Typography>
            </Stack>
          ) : null}
        </PosCompactBody>
      </PosCompactPage>
    </PosMobileShell>
  );
}
