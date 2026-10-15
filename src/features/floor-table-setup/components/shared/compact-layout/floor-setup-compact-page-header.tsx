'use client';

import type { ReactNode } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

type FloorSetupCompactPageHeaderProps = Readonly<{
  title: string;
  subtitle?: string;
  action?: ReactNode;
}>;

export function FloorSetupCompactPageHeader({
  title,
  subtitle,
  action,
}: FloorSetupCompactPageHeaderProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 1.5,
        width: '100%',
      }}
    >
      <Box sx={{ minWidth: 0, flex: 1 }}>
        <Typography
          variant="h6"
          component="h1"
          sx={{ fontWeight: 700, lineHeight: 1.3, minWidth: 0 }}
        >
          {title}
        </Typography>
        {subtitle ? (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            {subtitle}
          </Typography>
        ) : null}
      </Box>
      {action ? <Box sx={{ flexShrink: 0 }}>{action}</Box> : null}
    </Box>
  );
}
