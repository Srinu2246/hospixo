'use client';

import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';

import { CashShiftPage } from '@/features/pos/cash-shift/components/cash-shift-page';
import type { PosCashShiftPayload } from '@/features/pos/api/cash-shift.server';
import { usePosCashShift } from '@/features/pos/hooks/use-cash-shift';

type CashShiftConnectedScreenProps = Readonly<{
  initialData?: PosCashShiftPayload;
}>;

export function CashShiftConnectedScreen({ initialData }: CashShiftConnectedScreenProps) {
  const { data, isPending, isError, error } = usePosCashShift(initialData);

  if (isPending && !data) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress aria-label="Loading cash counter" />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Box sx={{ p: 2 }}>
        <Alert severity="error">
          {error instanceof Error ? error.message : 'Unable to load cash counter.'}
        </Alert>
      </Box>
    );
  }

  return (
    <CashShiftPage
      metrics={data.metrics}
      activeShift={data.activeShift}
      transactions={data.transactions}
      dateFilter={data.dateFilter}
      closePreview={data.closePreview}
      startDraft={data.startDraft}
    />
  );
}
