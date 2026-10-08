'use client';

import type { ReactNode } from 'react';
import Link from 'next/link';
import { Box, Breadcrumbs, Typography } from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

export interface BreadcrumbItem {
  readonly label: string;
  readonly href?: string;
  readonly onClick?: () => void;
}

export interface StickyBreadcrumbBarProps {
  readonly items?: readonly BreadcrumbItem[];
  readonly children?: ReactNode;
}

export function StickyBreadcrumbBar({ items, children }: StickyBreadcrumbBarProps) {
  return (
    <Box
      sx={{
        position: 'sticky',
        top: { xs: -16, md: -24 },
        zIndex: 10,
        mx: { xs: -2, md: -3 },
        mt: { xs: -2, md: -3 },
        mb: 2.5,
        px: { xs: 2, md: 3 },
        py: 1.25,
        bgcolor: 'background.paper',
        borderBottom: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        alignItems: 'center',
      }}
    >
      <Breadcrumbs
        separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />}
        sx={{ fontSize: '0.8125rem' }}
      >
        {children ??
          items?.map((item, index) => {
            const isLast = index === items.length - 1;
            if (isLast) {
              return (
                <Typography
                  key={item.label}
                  sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}
                >
                  {item.label}
                </Typography>
              );
            }
            if (item.href) {
              return (
                <Typography
                  key={item.label}
                  component={Link}
                  href={item.href}
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {item.label}
                </Typography>
              );
            }
            if (item.onClick) {
              return (
                <Typography
                  key={item.label}
                  onClick={item.onClick}
                  sx={{
                    fontSize: '0.8125rem',
                    color: 'text.secondary',
                    cursor: 'pointer',
                    '&:hover': { color: 'primary.main' },
                  }}
                >
                  {item.label}
                </Typography>
              );
            }
            return (
              <Typography key={item.label} sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                {item.label}
              </Typography>
            );
          })}
      </Breadcrumbs>
    </Box>
  );
}
