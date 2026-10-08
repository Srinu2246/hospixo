'use client';

import type { ReactNode } from 'react';
import { Box, Button, Typography } from '@mui/material';

export interface CrudPageHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly actionLabel?: string;
  readonly onAction?: () => void;
  readonly actionIcon?: ReactNode;
  readonly startAction?: ReactNode;
}

export function CrudPageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  actionIcon,
  startAction,
}: CrudPageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 2,
        flexWrap: 'wrap',
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        {startAction}
        <Box>
          <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body2" color="text.secondary">
              {subtitle}
            </Typography>
          )}
        </Box>
      </Box>
      {actionLabel && onAction && (
        <Button
          variant="contained"
          startIcon={actionIcon}
          onClick={onAction}
          sx={{
            height: 40,
            borderRadius: '8px',
            textTransform: 'none',
            fontWeight: 600,
            px: 2.5,
          }}
        >
          {actionLabel}
        </Button>
      )}
    </Box>
  );
}
