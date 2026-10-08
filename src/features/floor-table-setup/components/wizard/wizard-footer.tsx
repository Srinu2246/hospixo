'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';

import { wizardCopy, wizardFooterNext } from '@/features/floor-table-setup/config';
import type { WizardStepId } from '@/features/floor-table-setup/types/floor-table-setup';

type WizardFooterProps = Readonly<{
  step: WizardStepId;
  onBack: () => void;
  onNext: () => void;
  nextDisabled?: boolean;
  backDisabled?: boolean;
  nextLabel?: string;
  loading?: boolean;
  loadingLabel?: string;
}>;

export function WizardFooter({
  step,
  onBack,
  onNext,
  nextDisabled,
  backDisabled = false,
  nextLabel,
  loading = false,
  loadingLabel,
}: WizardFooterProps) {
  return (
    <Box
      component="footer"
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 2,
        mt: 'auto',
        py: 2,
        px: { xs: 0, sm: 0.5 },
        bgcolor: 'background.default',
        borderTop: 1,
        borderColor: 'divider',
      }}
    >
      <Button variant="outlined" onClick={onBack} disabled={backDisabled || loading}>
        {wizardCopy.back}
      </Button>
      <Button
        variant="contained"
        onClick={onNext}
        disabled={nextDisabled || loading}
        startIcon={loading ? <CircularProgress size={16} color="inherit" aria-hidden /> : undefined}
      >
        {loading && loadingLabel ? loadingLabel : (nextLabel ?? wizardFooterNext[step])}
      </Button>
    </Box>
  );
}
