'use client';

import type { MouseEvent } from 'react';
import Button from '@mui/material/Button';
import type { SxProps, Theme } from '@mui/material/styles';
import { ArrowRight } from 'lucide-react';

export interface EntityDashboardButtonProps {
  onClick: () => void;
  label?: string;
  sx?: SxProps<Theme>;
}

/** Row action that opens the entity dashboard without triggering the row click. */
export function EntityDashboardButton({
  onClick,
  label = 'Dashboard',
  sx,
}: Readonly<EntityDashboardButtonProps>) {
  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClick();
  };

  return (
    <Button
      size="small"
      variant="outlined"
      endIcon={<ArrowRight size={14} />}
      onClick={handleClick}
      sx={[
        {
          borderRadius: '0.5rem',
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.8125rem',
          borderColor: 'divider',
          color: 'text.primary',
          '&:hover': {
            borderColor: 'primary.main',
            bgcolor: 'action.hover',
            color: 'primary.main',
          },
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      {label}
    </Button>
  );
}
