'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { readyListPageMeta } from '@/features/pos/config/ready-list';
import { PosOperationsShell } from '@/features/pos/screens/layout/pos-operations-shell';
import { ReadyListHeader } from '@/features/pos/screens/ready-list/ready-list-header';
import { ReadyOrderCard } from '@/features/pos/screens/ready-list/ready-order-card';

import type { ReadyListPageViewModel } from './use-ready-list-page';

export function ReadyListDesktopContent(props: Readonly<ReadyListPageViewModel>) {
  const {
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
  } = props;

  return (
    <PosOperationsShell withPageBg>
      <Box
        component="main"
        sx={{
          width: '100%',
          minHeight: 'calc(100dvh - var(--pos-header-height) - 32px)',
          color: 'var(--pos-text)',
          bgcolor: 'var(--pos-page-bg)',
        }}
      >
        <ReadyListHeader
          query={query}
          onQueryChange={setQuery}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          tabs={tabs}
          activeCount={activeCount}
        />

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
            {loadError ?? readyListPageMeta.loadErrorFallback}
          </Typography>
        ) : null}

        {isLoading ? (
          <Typography color="text.secondary" sx={{ py: 4, textAlign: 'center', fontSize: 14 }}>
            {readyListPageMeta.loadingLabel}
          </Typography>
        ) : null}

        {visibleOrders.length > 0 ? (
          <Box
            component="section"
            aria-label={`${activeTab} ready orders`}
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, minmax(0, 1fr))',
                md: 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            {visibleOrders.map((order) => (
              <ReadyOrderCard
                key={order.id}
                order={order}
                onServe={handleServe}
                isMutating={isMutating}
              />
            ))}
          </Box>
        ) : !isLoading && !isError ? (
          <Stack
            sx={{
              minHeight: 260,
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}
          >
            <Typography component="h2" variant="h6" sx={{ m: 0, fontSize: 18 }}>
              {readyListPageMeta.emptyTitle}
            </Typography>
            <Typography color="text.secondary" sx={{ mt: 0.75, fontSize: 13 }}>
              {readyListPageMeta.emptyDescription}
            </Typography>
          </Stack>
        ) : null}
      </Box>
    </PosOperationsShell>
  );
}
