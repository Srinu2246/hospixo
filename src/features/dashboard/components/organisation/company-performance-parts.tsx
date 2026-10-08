'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Box,
  Chip,
  Pagination,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import type {
  OrganisationCompanyChartPoint,
  OrganisationCompanyPerformanceRow,
  OrganisationCompanyStatus,
  OrganisationPerformanceMetricId,
} from '@/features/dashboard/types/organisation-dashboard';

import { CompanyPerformanceHoverCard } from './company-performance-hover-card';

const statusColorMap: Record<OrganisationCompanyStatus, 'success' | 'warning' | 'default'> = {
  active: 'success',
  warning: 'warning',
  inactive: 'default',
};

type CompanyPerformanceChartProps = Readonly<{
  series: readonly OrganisationCompanyChartPoint[];
  rowsById: ReadonlyMap<string, OrganisationCompanyPerformanceRow>;
  maxValue: number;
  metricLabel: string;
  metric: OrganisationPerformanceMetricId;
}>;

function formatChartMetricValue(value: number, metric: OrganisationPerformanceMetricId): string {
  if (metric === 'orders') {
    return value.toLocaleString('en-IN');
  }

  return formatCurrency(value);
}

export function CompanyPerformanceChart({
  series,
  rowsById,
  maxValue,
  metricLabel,
  metric,
}: CompanyPerformanceChartProps) {
  const router = useRouter();
  if (series.length === 0) {
    return (
      <Box sx={{ py: 6, textAlign: 'center' }}>
        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
          No company performance data available.
        </Typography>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: `repeat(${series.length}, minmax(0, 1fr))`,
        alignItems: 'flex-end',
        gap: { xs: 1, sm: 2 },
        minHeight: 240,
        height: 260,
        pt: 6,
        pb: 1,
        overflow: 'visible',
      }}
    >
      {series.map((point, index) => {
        const heightPercent = Math.max(10, Math.round((point.value / maxValue) * 100));
        const row = rowsById.get(point.id);
        const placement =
          series.length <= 1 || index === 0
            ? 'start'
            : index === series.length - 1
              ? 'end'
              : index === 1
                ? 'start'
                : index === series.length - 2
                  ? 'end'
                  : 'center';

        return (
          <Box
            key={point.id}
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              height: '100%',
              justifyContent: 'flex-end',
              position: 'relative',
              overflow: 'visible',
              '&:hover .hover-card': {
                display: 'block',
              },
            }}
          >
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'center',
                position: 'relative',
                overflow: 'visible',
              }}
            >
              <Box
                onClick={() => {
                  if (row?.href) router.push(row.href);
                }}
                sx={{
                  width: { xs: '60%', sm: '48%' },
                  height: `${heightPercent}%`,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark'
                      ? 'rgba(56, 189, 248, 0.2)'
                      : 'rgba(14, 165, 233, 0.18)',
                  borderRadius: '6px 6px 0 0',
                  transition: 'height 0.3s ease-in-out, background-color 0.15s',
                  cursor: row?.href ? 'pointer' : 'default',
                  '&:hover': {
                    bgcolor: 'info.main',
                  },
                }}
              />
              {row ? (
                <Box className="hover-card" sx={{ display: 'none', position: 'static' }}>
                  <CompanyPerformanceHoverCard
                    row={row}
                    metricLabel={metricLabel}
                    metricValue={formatChartMetricValue(point.value, metric)}
                    placement={placement}
                  />
                </Box>
              ) : null}
            </Box>
            <Typography
              variant="caption"
              title={point.label}
              sx={{
                color: 'text.secondary',
                fontSize: '0.75rem',
                mt: 1,
                textAlign: 'center',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                width: '100%',
                display: 'block',
              }}
            >
              {point.label}
            </Typography>
          </Box>
        );
      })}
    </Box>
  );
}

type CompanyPerformanceTableProps = Readonly<{
  rows: readonly OrganisationCompanyPerformanceRow[];
}>;

export function CompanyPerformanceTable({ rows }: CompanyPerformanceTableProps) {
  const router = useRouter();

  return (
    <TableContainer sx={{ borderRadius: '0.5rem', border: 1, borderColor: 'divider', mt: 2 }}>
      <Table size="small">
        <TableHead sx={{ bgcolor: 'action.hover' }}>
          <TableRow>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.companyName}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.branches}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.revenue}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.orders}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.expenses}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.profit}
            </TableCell>
            <TableCell sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
              {organisationDashboardCopy.tableHeaders.status}
            </TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row) => (
            <TableRow
              key={row.id}
              hover
              onClick={() => {
                if (row.href) router.push(row.href);
              }}
              sx={{
                cursor: row.href ? 'pointer' : 'default',
                transition: 'background-color 0.15s ease',
              }}
            >
              <TableCell sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>
                {row.href ? (
                  <Link
                    href={row.href}
                    style={{
                      color: 'inherit',
                      textDecoration: 'none',
                    }}
                  >
                    <Box
                      component="span"
                      sx={{ '&:hover': { textDecoration: 'underline', color: 'primary.main' } }}
                    >
                      {row.companyName}
                    </Box>
                  </Link>
                ) : (
                  row.companyName
                )}
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem' }}>{row.branches}</TableCell>
              <TableCell sx={{ fontSize: '0.8125rem' }}>{formatCurrency(row.revenue)}</TableCell>
              <TableCell sx={{ fontSize: '0.8125rem' }}>
                {row.orders.toLocaleString('en-IN')}
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem' }}>{formatCurrency(row.expenses)}</TableCell>
              <TableCell
                sx={{
                  fontSize: '0.8125rem',
                  fontWeight: 600,
                  color: row.profit >= 0 ? 'success.main' : 'error.main',
                }}
              >
                {formatCurrency(row.profit)}
              </TableCell>
              <TableCell sx={{ fontSize: '0.8125rem' }}>
                <Chip
                  size="small"
                  label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
                  color={statusColorMap[row.status]}
                  variant="outlined"
                  sx={{ fontSize: '0.75rem', height: 22 }}
                />
              </TableCell>
            </TableRow>
          ))}
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={7} sx={{ textAlign: 'center', py: 3, color: 'text.secondary' }}>
                No companies found.
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

type CompanyPerformancePaginationProps = Readonly<{
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}>;

export function CompanyPerformancePagination({
  currentPage,
  totalPages,
  onPageChange,
}: CompanyPerformancePaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
      <Pagination
        count={totalPages}
        page={currentPage}
        onChange={(_, page) => onPageChange(page)}
        color="primary"
        size="small"
      />
    </Box>
  );
}
