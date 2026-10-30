'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Eye, Plus, Receipt } from 'lucide-react';

import { MenuResponsiveTableShell } from '@/components/features/menu/MenuResponsiveTableShell';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { DataGrid, type DataGridColumn } from '@/components/shared/ui/DataGrid';
import { formatGstEffectiveDate, formatGstPercent } from '@/lib/helpers/menu/gstRateDisplayHelpers';
import { menuDesktopDataGridShellSx } from '@/lib/helpers/menu/menuLayout';
import type { GstRate } from '@/lib/schemas/menu/gstRatesSchema';

import { GstRatesCompactList } from './GstRatesCompactList';

export interface GstRatesTableProps {
  rates: readonly GstRate[];
  page: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (page: number) => void;
  onCreate: () => void;
  onView: (rate: GstRate) => void;
}

/** GST rates list — compact rows below md, DataGrid on desktop. */
export function GstRatesTable({
  rates,
  page,
  pageSize,
  totalRows,
  onPageChange,
  onCreate,
  onView,
}: Readonly<GstRatesTableProps>) {
  const columns = useMemo((): DataGridColumn<GstRate>[] => {
    return [
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
        field: 'cgst_rate',
        headerName: 'CGST',
        minWidth: 90,
        sortable: true,
        renderCell: ({ row }) => formatGstPercent(row.cgst_rate),
      },
      {
        field: 'sgst_rate',
        headerName: 'SGST',
        minWidth: 90,
        sortable: true,
        renderCell: ({ row }) => formatGstPercent(row.sgst_rate),
      },
      {
        field: 'igst_rate',
        headerName: 'IGST',
        minWidth: 90,
        sortable: true,
        renderCell: ({ row }) => formatGstPercent(row.igst_rate),
      },
      {
        field: 'total_rate',
        headerName: 'Total',
        minWidth: 90,
        sortable: true,
        renderCell: ({ row }) => (
          <Typography variant="body2" sx={{ fontWeight: 700 }}>
            {formatGstPercent(row.total_rate)}
          </Typography>
        ),
      },
      {
        field: 'effective_from',
        headerName: 'Effective From',
        minWidth: 130,
        sortable: true,
        renderCell: ({ row }) => formatGstEffectiveDate(row.effective_from),
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
  }, [onView]);

  const compactList = (
    <GstRatesCompactList
      rates={rates}
      page={page}
      pageSize={pageSize}
      totalRows={totalRows}
      onPageChange={onPageChange}
      onCreate={onCreate}
      onView={onView}
    />
  );

  return (
    <MenuResponsiveTableShell
      compact={compactList}
      desktop={
        <Box sx={menuDesktopDataGridShellSx}>
          <DataGrid<GstRate>
            columns={columns}
            rows={rates}
            getRowId={(row) => row.id}
            pagination
            page={page}
            pageSize={pageSize}
            totalRows={totalRows}
            onPageChange={onPageChange}
            paginationEntityName="GST rates"
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
      }
    />
  );
}
