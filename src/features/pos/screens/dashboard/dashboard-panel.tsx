'use client';

import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import type { ReactNode } from 'react';

type DashboardPanelProps = Readonly<{
  title: string;
  titleId: string;
  headerAction?: ReactNode;
  children: ReactNode;
}>;

export function DashboardPanel({ title, titleId, headerAction, children }: DashboardPanelProps) {
  return (
    <Paper
      component="section"
      aria-labelledby={titleId}
      elevation={0}
      sx={{
        height: '100%',
        p: 2,
        border: '1px solid var(--pos-border)',
        borderRadius: 'var(--pos-radius-md)',
        bgcolor: 'var(--pos-surface)',
        boxShadow: 'var(--pos-shadow-card)',
      }}
    >
      <Typography
        component="header"
        id={titleId}
        variant="subtitle1"
        fontWeight={700}
        sx={{
          mb: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          color: 'var(--pos-text)',
          fontSize: 15,
        }}
      >
        <span>{title}</span>
        {headerAction}
      </Typography>
      {children}
    </Paper>
  );
}
