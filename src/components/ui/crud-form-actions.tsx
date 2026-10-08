'use client';

import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';

export type CrudFormActionsProps = Readonly<{
  onCancel: () => void;
  submitLabel: string;
  isSubmitting?: boolean;
}>;

export function CrudFormActions({
  onCancel,
  submitLabel,
  isSubmitting = false,
}: CrudFormActionsProps) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'flex-end', mt: 1 }}>
      <Button
        variant="outlined"
        onClick={onCancel}
        disabled={isSubmitting}
        sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
      >
        Cancel
      </Button>
      <Button
        type="submit"
        variant="contained"
        disabled={isSubmitting}
        startIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : null}
        sx={{
          height: 40,
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          px: 3,
        }}
      >
        {isSubmitting ? 'Saving...' : submitLabel}
      </Button>
    </Stack>
  );
}
