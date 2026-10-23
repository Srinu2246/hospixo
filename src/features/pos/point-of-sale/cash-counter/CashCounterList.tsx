'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Card } from '@/components/shared/ui/Card';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { CashCounter } from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface CashCounterListProps {
  rows: readonly CashCounter[];
  onCreate: () => void;
  onRowClick: (row: CashCounter) => void;
}

/**
 * Cash Counter list — title, create action, and DataGrid of counter records.
 */
export function CashCounterList({ rows, onCreate, onRowClick }: Readonly<CashCounterListProps>) {
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const paginatedRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return rows.slice(start, start + pageSize);
  }, [rows, page]);

  const columns: DataGridColumn<CashCounter>[] = useMemo(
    () => [
      {
        field: 'id',
        headerName: 'id',
        width: 100,
        minWidth: 80,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{row.id}</Typography>
        ),
      },
      {
        field: 'branch_id',
        headerName: 'branch_id',
        width: 160,
        minWidth: 120,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>{row.branch_id}</Typography>
        ),
      },
      {
        field: 'name',
        headerName: 'name',
        width: 200,
        minWidth: 140,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 600, fontSize: '0.9375rem' }}>{row.name}</Typography>
        ),
      },
      {
        field: 'status',
        headerName: 'status',
        width: 140,
        minWidth: 110,
        renderCell: ({ row }) => (
          <StatusChip
            status={row.status}
            label={row.status === 'active' ? 'Active' : 'Inactive'}
            showDot
            size="small"
          />
        ),
      },
      {
        field: 'open_shift_id',
        headerName: 'open_shift_id',
        width: 160,
        minWidth: 120,
        renderCell: ({ row }) => (
          <Typography sx={{ fontWeight: 500, fontSize: '0.9375rem' }}>
            {row.open_shift_id ?? '—'}
          </Typography>
        ),
      },
    ],
    [],
  );

  return (
    <Box
      sx={{
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        boxSizing: 'border-box',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{
          alignItems: { xs: 'flex-start', sm: 'flex-start' },
          justifyContent: 'space-between',
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.5rem', sm: '1.875rem' },
              color: 'text.primary',
              lineHeight: 1.2,
              letterSpacing: '-0.02em',
            }}
          >
            Cash Counters
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9375rem' }}
          >
            View cash counter information for the current branch.
          </Typography>
        </Box>

        <ActionButton
          variant="primary"
          startIcon={<Plus size={18} />}
          onClick={onCreate}
          sx={{
            flexShrink: 0,
            borderRadius: '8px',
            bgcolor: colors.primary.default,
            px: 2.5,
            fontWeight: 600,
            boxShadow: 'none',
            '&:hover': { bgcolor: colors.primary.dark },
          }}
        >
          Create Cash Counter
        </ActionButton>
      </Stack>

      <Card
        title="Cash Counter Records"
        subtitle="Cash registers for the current branch."
        padding={0}
        headerPadding={2.5}
        sx={{ borderRadius: '12px' }}
        footerPadding={2}
        footerDivider
      >
        <DataGrid
          columns={columns}
          rows={paginatedRows}
          totalRows={rows.length}
          pagination
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          paginationEntityName="counters"
          getRowId={(row) => String(row.id)}
          onRowClick={onRowClick}
          emptyTitle="No cash counters"
          emptySubtitle="Create a cash counter for this branch to get started."
          stickyHeader
          height={420}
          rowHeight={56}
          sx={{
            border: 'none',
            borderRadius: 0,
            boxShadow: 'none',
            bgcolor: 'background.paper',
          }}
        />
      </Card>
    </Box>
  );
}
