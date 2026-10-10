'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { posMobileOutlet } from '@/features/pos/config/nav-mobile';
import { usePosDashboard } from '@/features/pos/hooks/use-pos-dashboard';
import { FloorStatus } from '@/features/pos/screens/dashboard/floor-status/floor-status';
import { LiveOrderQueue } from '@/features/pos/screens/dashboard/live-order-queue/live-order-queue';
import { OnlineOrdersPanel } from '@/features/pos/screens/dashboard/online-orders-panel/online-orders-panel';
import { ReadyOrdersPanel } from '@/features/pos/screens/dashboard/ready-orders-panel/ready-orders-panel';
import { RecentTransactions } from '@/features/pos/screens/dashboard/recent-transactions/recent-transactions';
import { ShiftInfoPanel } from '@/features/pos/screens/dashboard/shift-info/shift-info';
import { SummaryCards } from '@/features/pos/screens/dashboard/summary-cards/summary-cards';
import { SystemNotifications } from '@/features/pos/screens/dashboard/system-notifications/system-notifications';

export function PosDashboardContent() {
  const {
    summaryCards,
    liveOrderQueue,
    floorTables,
    floorLegend,
    onlineSummary,
    onlinePlatforms,
    readyOrders,
    recentTransactions,
    notifications,
    shift,
    isLoading,
    isError,
    loadError,
    handleLiveOrderAction,
  } = usePosDashboard();

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
        width: '100%',
        maxWidth: 'var(--pos-content-max)',
        mx: 'auto',
      }}
    >
      {isError && loadError ? <Alert severity="error">{loadError}</Alert> : null}

      {isLoading ? (
        <Stack spacing={1} sx={{ py: 6, alignItems: 'center', justifyContent: 'center' }}>
          <CircularProgress size={28} aria-label="Loading dashboard" />
          <Typography color="text.secondary" variant="body2">
            Loading store operations…
          </Typography>
        </Stack>
      ) : null}

      {!isLoading ? (
        <>
          <SummaryCards cards={summaryCards} />

          <Grid container spacing={1.5} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, xl: 8 }}>
              <LiveOrderQueue orders={liveOrderQueue} onAction={handleLiveOrderAction} />
            </Grid>
            <Grid size={{ xs: 12, xl: 4 }}>
              <FloorStatus tables={floorTables} legend={floorLegend} />
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, md: 4 }}>
              <OnlineOrdersPanel
                totalSales={onlineSummary.totalSales}
                orders={onlineSummary.orders}
                platforms={onlinePlatforms}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <ReadyOrdersPanel orders={readyOrders} />
            </Grid>
            <Grid size={{ xs: 12, md: 4 }}>
              <RecentTransactions transactions={recentTransactions} />
            </Grid>
          </Grid>

          <Grid container spacing={1.5} sx={{ alignItems: 'stretch' }}>
            <Grid size={{ xs: 12, lg: 8 }}>
              <SystemNotifications notifications={notifications} />
            </Grid>
            <Grid size={{ xs: 12, lg: 4 }}>
              <ShiftInfoPanel shift={shift} />
            </Grid>
          </Grid>
        </>
      ) : null}
    </Box>
  );
}

export const posDashboardMobileTitle = 'POS Dashboard';
export const posDashboardMobileSubtitle = posMobileOutlet.name;
