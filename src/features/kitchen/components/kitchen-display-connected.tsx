'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import {
  KitchenDisplay,
  defaultKitchenStations,
  type KitchenConnectionStatus,
} from '@/features/kitchen';
import {
  useKitchenOrderStatusMutation,
  useKitchenOrdersQuery,
} from '@/features/kitchen/hooks/use-kitchen-orders';
import { useFloorBranchOutletId } from '@/features/floor-table-setup/hooks/use-floor-branch-outlet';

type KitchenDisplayConnectedProps = Readonly<{
  stations?: typeof defaultKitchenStations;
  connectionStatus?: KitchenConnectionStatus;
  title?: string;
}>;

/** Kitchen board backed by branch kitchen orders API. */
export function KitchenDisplayConnected({
  stations = defaultKitchenStations,
  connectionStatus,
  title,
}: KitchenDisplayConnectedProps) {
  const outletId = useFloorBranchOutletId();
  const { data, isPending, isError, error } = useKitchenOrdersQuery();
  const statusMutation = useKitchenOrderStatusMutation(outletId);
  const orders = data?.orders ?? [];

  const resolvedConnection: KitchenConnectionStatus = connectionStatus ?? {
    printerConnected: true,
    posSyncActive: !isError,
    avgPrepTimeLabel: undefined,
  };

  return (
    <Box>
      {isError ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error instanceof Error ? error.message : 'Unable to load kitchen orders.'}
        </Alert>
      ) : null}
      {!isPending && orders.length === 0 && !isError ? (
        <Alert severity="info" sx={{ mb: 2 }}>
          No kitchen tickets in the queue.
        </Alert>
      ) : null}
      <KitchenDisplay
        orders={orders}
        stations={stations}
        connectionStatus={resolvedConnection}
        title={title}
        onStartPreparing={(orderId) => statusMutation.mutate({ orderId, status: 'preparing' })}
        onRecall={(orderId) => statusMutation.mutate({ orderId, status: 'new' })}
        onMarkReady={(orderId) => statusMutation.mutate({ orderId, status: 'ready' })}
        onServed={(orderId) => statusMutation.mutate({ orderId, status: 'served' })}
      />
    </Box>
  );
}
