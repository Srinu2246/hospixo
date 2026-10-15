'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Eye, Plus, Receipt } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import type { GstRate } from '@/lib/schemas/menu/gstRatesSchema';

export interface GstRatesTableProps {
  rates: readonly GstRate[];
  onCreate: () => void;
  onView: (rate: GstRate) => void;
}

function formatPercent(value: number): string {
  return `${value}%`;
}

function formatEffectiveDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function GstRatesTable({ rates, onCreate, onView }: Readonly<GstRatesTableProps>) {
  const columns: DataGridColumn<GstRate>[] = [
    {
      field: 'code',
      headerName: 'GST Code',
      minWidth: 120,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {row.code}
        </Typography>
      ),
    },
    {
      field: 'name',
      headerName: 'Slab Name',
      minWidth: 160,
      sortable: true,
    },
    {
      field: 'cgst',
      headerName: 'CGST',
      minWidth: 90,
      sortable: true,
      renderCell: ({ row }) => formatPercent(row.cgst),
    },
    {
      field: 'sgst',
      headerName: 'SGST',
      minWidth: 90,
      sortable: true,
      renderCell: ({ row }) => formatPercent(row.sgst),
    },
    {
      field: 'igst',
      headerName: 'IGST',
      minWidth: 90,
      sortable: true,
      renderCell: ({ row }) => formatPercent(row.igst),
    },
    {
      field: 'total',
      headerName: 'Total',
      minWidth: 90,
      sortable: true,
      renderCell: ({ row }) => (
        <Typography variant="body2" sx={{ fontWeight: 700 }}>
          {formatPercent(row.total)}
        </Typography>
      ),
    },
    {
      field: 'effectiveFrom',
      headerName: 'Effective From',
      minWidth: 130,
      sortable: true,
      renderCell: ({ row }) => formatEffectiveDate(row.effectiveFrom),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 120,
      align: 'right',
      headerAlign: 'right',
      sortable: false,
      renderCell: ({ row }) => (
        <ActionButton
          variant="outlined"
          size="small"
          startIcon={<Eye size={14} />}
          onClick={(event) => {
            event.stopPropagation();
            onView(row);
          }}
          sx={{
            color: 'primary.main',
            borderColor: 'primary.light',
            bgcolor: 'transparent',
            '&:hover': {
              borderColor: 'primary.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          View
        </ActionButton>
      ),
    },
  ];

  return (
    <Box
      sx={{
        flex: 1,
        minHeight: 0,
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: '12px',
        overflow: 'hidden',
        border: (theme) => `1px solid ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <DataGrid<GstRate>
        columns={columns}
        rows={rates}
        getRowId={(row) => row.id}
        stickyHeader
        height="100%"
        rowHeight={64}
        emptyIcon={Receipt}
        emptyTitle="No GST rates yet"
        emptySubtitle="Create your first GST slab to start mapping tax rates to menu items and billing."
        emptyAction={
          <ActionButton startIcon={<Plus size={16} />} onClick={onCreate}>
            Create GST Rate
          </ActionButton>
        }
        ariaLabel="GST rates"
        sx={{
          border: 'none',
          borderRadius: 0,
          boxShadow: 'none',
          height: '100%',
          flex: 1,
          minHeight: 0,
        }}
      />
    </Box>
  );
}
