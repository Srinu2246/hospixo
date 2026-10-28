'use client';

import Box from '@mui/material/Box';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { Toast } from '@/components/shared/ui/Toast';
import { getErrorMessage } from '@/lib/helpers/getErrorMessage';
import { useKitchenDisplay, type UseKitchenDisplayOptions } from '@/lib/hooks/kitchen-display';
import { KitchenHeader } from './components/KitchenHeader';
import { KitchenColumn } from './components/KitchenColumn';
import { KitchenFooter } from './components/KitchenFooter';

export interface KitchenDisplayScreenProps extends UseKitchenDisplayOptions {
  className?: string;
}

/**
 * Kitchen Display — REST kitchen-board + branch order-events stream (SSE → WebSocket).
 */
export function KitchenDisplayScreen({
  initialStation,
  branchId,
}: Readonly<KitchenDisplayScreenProps> = {}) {
  const {
    selectedStation,
    setSelectedStation,
    stations,
    newOrders,
    preparingOrders,
    readyOrders,
    stats,
    currentTime,
    isLiveActive,
    liveLabel,
    posSyncStatus,
    soundEnabled,
    handleToggleSound,
    handleStartPreparing,
    handleRecall,
    handleMarkReady,
    handleServe,
    toastMessage,
    clearToast,
    isLoading,
    isError,
    boardError,
  } = useKitchenDisplay({ initialStation, branchId });

  return (
    <Box
      sx={{
        width: '100%',
        minHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: 'transparent',
        boxSizing: 'border-box',
        p: 0,
      }}
    >
      <KitchenHeader
        selectedStation={selectedStation}
        stations={stations}
        onSelectStation={setSelectedStation}
        currentTime={currentTime}
        stats={stats}
        isLiveActive={isLiveActive}
        liveLabel={liveLabel}
        soundEnabled={soundEnabled}
        onToggleSound={handleToggleSound}
      />

      {isLoading &&
      newOrders.length === 0 &&
      preparingOrders.length === 0 &&
      readyOrders.length === 0 ? (
        <Loading sx={{ py: 6 }} />
      ) : isError ? (
        <AlertMessage variant="error" message={getErrorMessage(boardError)} />
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(3, 1fr)',
            },
            gap: { xs: 2.5, md: 3 },
            alignItems: 'start',
            flex: 1,
          }}
        >
          <KitchenColumn
            title="New Orders"
            count={newOrders.length}
            accentColor="#EF4444"
            orders={newOrders}
            onStartPreparing={handleStartPreparing}
          />
          <KitchenColumn
            title="Preparing"
            count={preparingOrders.length}
            accentColor="#F59E0B"
            orders={preparingOrders}
            onRecall={handleRecall}
            onMarkReady={handleMarkReady}
          />
          <KitchenColumn
            title="Ready to Serve"
            count={readyOrders.length}
            accentColor="#10B981"
            orders={readyOrders}
            onServe={handleServe}
          />
        </Box>
      )}

      <KitchenFooter
        printerStatus="Connected"
        posSyncStatus={posSyncStatus}
        avgPrepTime={stats.avgPrepTime}
      />

      <Toast
        open={Boolean(toastMessage)}
        message={toastMessage || ''}
        severity="success"
        onClose={clearToast}
      />
    </Box>
  );
}
