'use client';

import Button from '@mui/material/Button';

type StatusToggleButtonProps = {
  isActive: boolean;
  disabled?: boolean;
  resourceLabel: string;
  onClick: () => void;
};

export function StatusToggleButton({
  isActive,
  disabled = false,
  resourceLabel,
  onClick,
}: StatusToggleButtonProps) {
  const label = isActive ? 'Deactivate' : 'Activate';

  return (
    <Button
      type="button"
      size="small"
      variant="outlined"
      disabled={disabled}
      title={label}
      aria-label={`${label} ${resourceLabel}`}
      onClick={(event) => {
        event.stopPropagation();
        onClick();
      }}
      sx={{
        textTransform: 'none',
        fontSize: '0.75rem',
        fontWeight: 600,
        py: 0.25,
        px: 1.25,
        minWidth: 0,
        borderRadius: 1,
        borderColor: isActive ? 'warning.main' : 'success.main',
        color: isActive ? 'warning.dark' : 'success.dark',
        bgcolor: isActive ? 'rgba(237, 108, 2, 0.08)' : 'rgba(46, 125, 50, 0.08)',
        '&:hover': {
          bgcolor: isActive ? 'rgba(237, 108, 2, 0.16)' : 'rgba(46, 125, 50, 0.16)',
          borderColor: isActive ? 'warning.dark' : 'success.dark',
        },
      }}
    >
      {label}
    </Button>
  );
}
