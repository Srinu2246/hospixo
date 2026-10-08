'use client';

import type { ElementType, ReactNode } from 'react';
import Link from 'next/link';
import {
  Box,
  Button,
  Card,
  Chip,
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import { ArrowRight } from 'lucide-react';

export type EntityTableColumn = Readonly<{
  label: string;
  align?: 'left' | 'center' | 'right';
}>;

export type EntityTableProps = Readonly<{
  columns: readonly EntityTableColumn[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon: ElementType;
  emptyTitle: string;
  emptySubtitle: string;
  children: ReactNode;
}>;

export function EntityTable({
  columns,
  isLoading,
  isEmpty,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptySubtitle,
  children,
}: EntityTableProps) {
  const colSpan = columns.length;

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        overflow: 'hidden',
        width: '100%',
        maxWidth: '100%',
        flexShrink: 0,
      }}
    >
      <TableContainer
        sx={{ width: '100%', maxWidth: '100%', overflowX: 'auto', overflowY: 'visible' }}
      >
        <Table sx={{ width: '100%', minWidth: { xs: 560, md: '100%' } }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={index}
                  align={col.align ?? 'left'}
                  sx={{
                    fontWeight: 700,
                    fontSize: '0.75rem',
                    color: 'text.secondary',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    py: 1,
                    px: 1.5,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 4 }).map((_, index) => (
                <TableRow key={index}>
                  {columns.map((col, cIndex) => (
                    <TableCell key={cIndex} align={col.align ?? 'left'} sx={{ py: 1, px: 1.5 }}>
                      <Skeleton
                        width={cIndex === 0 ? 180 : cIndex === colSpan - 1 ? 110 : 80}
                        height={cIndex === colSpan - 1 ? 32 : 24}
                        sx={col.align === 'center' ? { mx: 'auto' } : undefined}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={colSpan} sx={{ py: 6, textAlign: 'center' }}>
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    <EmptyIcon size={36} style={{ opacity: 0.3 }} />
                    <Typography sx={{ fontWeight: 600, color: 'text.secondary' }}>
                      {emptyTitle}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}
                    >
                      {emptySubtitle}
                    </Typography>
                  </Box>
                </TableCell>
              </TableRow>
            ) : (
              children
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Card>
  );
}

export function EntityStatusChip({ status }: Readonly<{ status: string }>) {
  const isActive = status === 'active';

  return (
    <Chip
      label={status}
      size="small"
      sx={{
        borderRadius: '9999px',
        textTransform: 'capitalize',
        fontWeight: 600,
        fontSize: '0.75rem',
        ...(isActive
          ? {
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(22, 163, 74, 0.1)',
              color: 'success.main',
            }
          : {
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }),
      }}
    />
  );
}

export function EntityDashboardButton({
  href,
  label = 'Dashboard',
}: Readonly<{
  href: string;
  label?: string;
}>) {
  return (
    <Button
      component={Link}
      href={href}
      size="small"
      variant="outlined"
      endIcon={<ArrowRight size={14} />}
      sx={{
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
      }}
    >
      {label}
    </Button>
  );
}

export function EntityIdentityCell({
  icon: Icon,
  name,
  href,
  code,
  badge,
}: Readonly<{
  icon: ElementType;
  name: string;
  href: string;
  code?: string | null;
  badge?: ReactNode;
}>) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
      <Box
        sx={{
          width: 32,
          height: 32,
          borderRadius: '0.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          bgcolor: (theme) =>
            theme.palette.mode === 'dark' ? 'rgba(56, 189, 248, 0.12)' : 'rgba(2, 132, 199, 0.08)',
          color: 'info.main',
          flexShrink: 0,
        }}
      >
        <Icon size={16} />
      </Box>
      <Box sx={{ minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
          <Typography
            component={Link}
            href={href}
            sx={{
              fontWeight: 600,
              fontSize: '0.875rem',
              color: 'text.primary',
              textDecoration: 'none',
              display: 'block',
              '&:hover': { color: 'primary.main', textDecoration: 'underline' },
            }}
          >
            {name}
          </Typography>
          {badge}
        </Box>
        {code ? (
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            Code: {code}
          </Typography>
        ) : null}
      </Box>
    </Box>
  );
}
