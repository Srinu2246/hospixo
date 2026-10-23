'use client';

/**
 * Cash & Shift entry — GET …/shifts/current.
 * `data: null` → Start New Shift; otherwise active-shift dashboard.
 */

import Box from '@mui/material/Box';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { useCurrentShift } from '@/lib/hooks/pos/point-of-sale/cash-and-shift/useCurrentShift';
import { useSidebarStore } from '@/stores/sidebarStore';

import { CashAndShiftDashboardPage } from './CashAndShiftDashboardPage';
import { CreateNewShiftPage } from './CreateNewShiftPage';

export function CashAndShiftPage() {
  const branchId = useSidebarStore((state) => state.context.branchId);
  const currentShiftQuery = useCurrentShift(branchId);

  if (typeof branchId !== 'number') {
    return (
      <AlertMessage
        variant="warning"
        title="Branch required"
        message="Select a branch before opening Cash & Shift."
      />
    );
  }

  if (currentShiftQuery.isLoading) {
    return <Loading message="Checking current shift..." fullPage={false} />;
  }

  if (currentShiftQuery.isError) {
    return (
      <Box sx={{ p: 2 }}>
        <AlertMessage
          variant="error"
          title="Unable to load current shift"
          message={
            currentShiftQuery.error instanceof Error
              ? currentShiftQuery.error.message
              : 'The current shift request failed.'
          }
        />
      </Box>
    );
  }

  if (currentShiftQuery.data == null) {
    return (
      <CreateNewShiftPage
        onStartShift={() => {
          void currentShiftQuery.refetch();
        }}
      />
    );
  }

  return <CashAndShiftDashboardPage currentShift={currentShiftQuery.data} />;
}
