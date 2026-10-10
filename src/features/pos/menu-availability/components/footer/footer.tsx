'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';

type MenuAvailabilityFooterProps = Readonly<{
  changedCount: number;
  eightySixedCount: number;
  onUpdate: () => void;
  isSaving?: boolean;
}>;

export function MenuAvailabilityFooter({
  changedCount,
  eightySixedCount,
  onUpdate,
  isSaving = false,
}: MenuAvailabilityFooterProps) {
  const { footer } = menuAvailabilityCopy;

  return (
    <Box
      component="footer"
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.75rem 1rem',
        p: 2,
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -4px 16px rgba(15, 23, 42, 0.04)',
      }}
    >
      <Typography
        sx={{
          m: 0,
          fontSize: '0.875rem',
          color: 'text.secondary',
        }}
      >
        {footer.changed(changedCount)} — {footer.eightySixed(eightySixedCount)}
      </Typography>
      <Button
        type="button"
        variant="contained"
        disabled={isSaving}
        onClick={onUpdate}
        sx={{
          border: 'none',
          bgcolor: '#2563eb',
          color: '#fff',
          fontSize: '0.875rem',
          fontWeight: 700,
          px: 2.5,
          py: 1,
          borderRadius: 2,
          textTransform: 'none',
          cursor: isSaving ? 'not-allowed' : 'pointer',
          '&:hover': {
            bgcolor: '#1d4ed8',
          },
        }}
      >
        {isSaving ? 'Updating...' : footer.update}
      </Button>
    </Box>
  );
}
