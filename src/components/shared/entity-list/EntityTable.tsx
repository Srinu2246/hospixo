'use client';

import type { ElementType, ReactNode } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import type { SxProps, Theme } from '@mui/material/styles';

import { Loading } from '@/components/shared/ui/Loading';
import { screen } from '@/lib/theme/mui/breakpoints';
import { colors } from '@/lib/theme/mui/colors';

export interface EntityTableColumn {
  label: string;
  align?: 'left' | 'center' | 'right';
}

export interface EntityTableProps {
  columns: readonly EntityTableColumn[];
  isLoading: boolean;
  isEmpty: boolean;
  emptyIcon: ElementType;
  emptyTitle: string;
  emptySubtitle: string;
  /** Table rows. Each row renders one `TableCell` per column. */
  children: ReactNode;
  sx?: SxProps<Theme>;
}

/** Outlined table with a loading state and an empty state. */
export function EntityTable({
  columns,
  isLoading,
  isEmpty,
  emptyIcon: EmptyIcon,
  emptyTitle,
  emptySubtitle,
  children,
  sx,
}: Readonly<EntityTableProps>) {
  return (
    <Card
      variant="outlined"
      sx={[
        {
          borderRadius: '0.75rem',
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: colors.entityList.cardShadow,
          overflow: 'hidden',
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <TableContainer>
        <Table sx={{ minWidth: { [screen.mobile]: 560, [screen.desktop]: '100%' } }}>
          <TableHead sx={{ bgcolor: 'action.hover' }}>
            <TableRow>
              {columns.map((column) => (
                <TableCell
                  key={column.label}
                  align={column.align ?? 'left'}
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
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 4, border: 'none' }}>
                  <Loading fullPage={false} sx={{ minHeight: 160, py: 2 }} />
                </TableCell>
              </TableRow>
            ) : isEmpty ? (
              <TableRow>
                <TableCell colSpan={columns.length} sx={{ py: 6, textAlign: 'center' }}>
                  <Box
                    sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}
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
