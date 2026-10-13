'use client';

import {
  Box,
  Chip,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tooltip,
  Typography,
} from '@mui/material';
import { Eye, FileText } from 'lucide-react';

export type RecentOrderTypeVariant = 'dine-in' | 'takeaway' | 'delivery';

export type RecentOrderTableRow = Readonly<{
  id: string;
  orderNo: string;
  orderType: string;
  orderTypeVariant?: RecentOrderTypeVariant;
  captain: string;
  qty: number;
  amount: string;
  grandTotal: string;
  grandTotalMeta?: string;
  created: string;
  status: 'successful' | 'cancelled';
}>;

export type RecentOrdersTableProps = Readonly<{
  rows: readonly RecentOrderTableRow[];
  footerText?: string;
  onViewOrder?: (row: RecentOrderTableRow) => void;
  onPrintOrder?: (row: RecentOrderTableRow) => void;
}>;

const headerCellSx = {
  py: 1.5,
  px: 2,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  whiteSpace: 'nowrap',
  borderColor: 'divider',
} as const;

const bodyCellSx = {
  py: 1.75,
  px: 2,
  fontSize: '0.8125rem',
  borderColor: 'divider',
  verticalAlign: 'middle',
} as const;

const orderTypeChipSx: Record<RecentOrderTypeVariant, object> = {
  'dine-in': { bgcolor: 'rgba(14, 165, 233, 0.12)', color: 'info.dark' },
  takeaway: { bgcolor: 'rgba(99, 102, 241, 0.12)', color: 'secondary.dark' },
  delivery: { bgcolor: 'rgba(99, 102, 241, 0.1)', color: 'secondary.dark' },
};

function OrderTypeChip({
  label,
  variant,
}: Readonly<{ label: string; variant?: RecentOrderTypeVariant }>) {
  const tone = variant ? orderTypeChipSx[variant] : orderTypeChipSx['dine-in'];
  return (
    <Chip
      label={label}
      size="small"
      sx={{
        height: 24,
        fontSize: '0.75rem',
        fontWeight: 600,
        borderRadius: '0.375rem',
        ...tone,
      }}
    />
  );
}

function StatusChip({ status }: Readonly<{ status: RecentOrderTableRow['status'] }>) {
  const isSuccess = status === 'successful';
  return (
    <Chip
      label={isSuccess ? 'Successful' : 'Cancelled'}
      size="small"
      sx={{
        height: 24,
        fontSize: '0.75rem',
        fontWeight: 600,
        bgcolor: isSuccess ? 'rgba(34, 197, 94, 0.12)' : 'rgba(239, 68, 68, 0.12)',
        color: isSuccess ? 'success.dark' : 'error.dark',
      }}
    />
  );
}

export function RecentOrdersTable({
  rows,
  footerText,
  onViewOrder,
  onPrintOrder,
}: RecentOrdersTableProps) {
  return (
    <Box>
      <TableContainer sx={{ overflowX: 'auto', borderRadius: '0.5rem' }}>
        <Table size="small" sx={{ minWidth: 960 }}>
          <TableHead>
            <TableRow>
              {[
                'Order No',
                'Order Type',
                'Captain',
                'Qty',
                'Amount (₹)',
                'Grand Total (₹)',
                'Created',
                'Status',
                'Actions',
              ].map((label) => (
                <TableCell key={label} sx={headerCellSx}>
                  {label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id} hover sx={{ '&:last-child td': { borderBottom: 0 } }}>
                <TableCell sx={{ ...bodyCellSx, fontWeight: 700 }}>{row.orderNo}</TableCell>
                <TableCell sx={bodyCellSx}>
                  <OrderTypeChip label={row.orderType} variant={row.orderTypeVariant} />
                </TableCell>
                <TableCell sx={bodyCellSx}>{row.captain}</TableCell>
                <TableCell sx={bodyCellSx}>{row.qty}</TableCell>
                <TableCell sx={bodyCellSx}>{row.amount}</TableCell>
                <TableCell sx={bodyCellSx}>
                  <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem' }}>
                    {row.grandTotal}
                  </Typography>
                  {row.grandTotalMeta ? (
                    <Typography sx={{ fontSize: '0.6875rem', color: 'text.secondary', mt: 0.25 }}>
                      {row.grandTotalMeta}
                    </Typography>
                  ) : null}
                </TableCell>
                <TableCell sx={{ ...bodyCellSx, whiteSpace: 'nowrap' }}>{row.created}</TableCell>
                <TableCell sx={bodyCellSx}>
                  <StatusChip status={row.status} />
                </TableCell>
                <TableCell sx={bodyCellSx}>
                  <Stack direction="row" spacing={0.5}>
                    <Tooltip title="View order">
                      <IconButton
                        size="small"
                        aria-label={`View ${row.orderNo}`}
                        onClick={() => onViewOrder?.(row)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '0.375rem',
                        }}
                      >
                        <Eye size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Print receipt">
                      <IconButton
                        size="small"
                        aria-label={`Print ${row.orderNo}`}
                        onClick={() => onPrintOrder?.(row)}
                        sx={{
                          border: '1px solid',
                          borderColor: 'divider',
                          borderRadius: '0.375rem',
                        }}
                      >
                        <FileText size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      {footerText ? (
        <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          {footerText}
        </Typography>
      ) : null}
    </Box>
  );
}
