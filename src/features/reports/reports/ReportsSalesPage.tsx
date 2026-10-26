'use client';

/**
 * Reports sales tab — summary KPIs, trend, order-type and session breakdown, daily table.
 * Data from GET /v1/branches/{branch_id}/reports/sales.
 */

import { useMemo, useState, type ReactNode } from 'react';
import {
  Box,
  Button,
  Card,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  ArrowUp,
  Banknote,
  Download,
  IndianRupee,
  ShoppingBag,
  Truck,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { TrendChart } from '@/components/shared/ui/TrendChart';
import { MetricCard, type MetricCardAccent } from '@/components/shared/ui/MetricCard';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { SectionHeader } from '@/components/shared/ui/SectionHeader';
import { SessionsTable } from '@/components/shared/ui/SessionsTable';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatInrAmount,
  formatIsoDate,
} from '@/lib/helpers/reportsOverview';
import {
  summarizeReportsSalesBreakdownFooter,
  toReportsSalesViewModel,
  type ReportsSalesViewModel,
} from '@/lib/schemas/reports/reports/branchReports';
import { useReportsSales } from '@/lib/hooks/reports/reports/useBranchReports';
import type { ReportsSalesBreakdownRow } from '@/lib/mocks/reports/reports.mocks';
import { reportsSalesCopy } from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, LucideIcon> = {
  'total-sales': IndianRupee,
  'dine-in-sales': UtensilsCrossed,
  'takeaway-sales': ShoppingBag,
};

const ORDER_TYPE_ACCENT: Record<string, MetricCardAccent> = {
  'dine-in': 'info',
  takeaway: 'warning',
  delivery: 'success',
};

const ORDER_TYPE_ICON: Record<string, LucideIcon> = {
  'dine-in': UtensilsCrossed,
  takeaway: ShoppingBag,
  delivery: Truck,
};

const ORDER_TYPE_FILTER_OPTIONS = [
  { id: '', label: 'All order types' },
  { id: 'dine_in', label: 'Dine-in' },
  { id: 'takeaway', label: 'Takeaway' },
  { id: 'delivery', label: 'Delivery' },
] as const;

const breakdownHeaderCellSx = {
  py: 1.5,
  px: 2,
  fontSize: '0.6875rem',
  fontWeight: 700,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'text.secondary',
  borderColor: 'divider',
} as const;

const breakdownBodyCellSx = {
  py: 1.75,
  px: 2,
  fontSize: '0.8125rem',
  borderColor: 'divider',
} as const;

function SalesBreakdownTable({
  rows,
  footer,
}: Readonly<{
  rows: readonly ReportsSalesBreakdownRow[];
  footer?: ReportsSalesBreakdownRow;
}>) {
  const footerRow =
    rows.length > 0 ? (footer ?? summarizeReportsSalesBreakdownFooter(rows)) : undefined;

  return (
    <TableContainer sx={{ overflowX: 'auto', borderRadius: '0.5rem' }}>
      <Table size="small" sx={{ minWidth: 640 }}>
        <TableHead>
          <TableRow>
            <TableCell sx={breakdownHeaderCellSx}>
              <Typography
                component="span"
                sx={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 0.5,
                  fontSize: 'inherit',
                  fontWeight: 'inherit',
                }}
              >
                Date
                <ArrowUp size={12} aria-hidden />
              </Typography>
            </TableCell>
            {(['Dine-in', 'Takeaway', 'Delivery', 'Total amount'] as const).map((label) => (
              <TableCell key={label} align="right" sx={breakdownHeaderCellSx}>
                {label}
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} sx={{ ...breakdownBodyCellSx, color: 'text.secondary' }}>
                No daily breakdown rows for this period.
              </TableCell>
            </TableRow>
          ) : null}
          {rows.map((row) => (
            <TableRow key={row.id} hover>
              <TableCell sx={breakdownBodyCellSx}>{row.date}</TableCell>
              <TableCell align="right" sx={breakdownBodyCellSx}>
                {row.dineIn}
              </TableCell>
              <TableCell align="right" sx={breakdownBodyCellSx}>
                {row.takeaway}
              </TableCell>
              <TableCell align="right" sx={{ ...breakdownBodyCellSx, color: 'text.secondary' }}>
                {row.delivery}
              </TableCell>
              <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
                {row.total}
              </TableCell>
            </TableRow>
          ))}
          {footerRow ? (
            <TableRow sx={{ bgcolor: 'action.hover' }}>
              <TableCell sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
                {footerRow.date}
              </TableCell>
              <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
                {footerRow.dineIn}
              </TableCell>
              <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
                {footerRow.takeaway}
              </TableCell>
              <TableCell
                align="right"
                sx={{ ...breakdownBodyCellSx, fontWeight: 700, color: 'text.secondary' }}
              >
                {footerRow.delivery}
              </TableCell>
              <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
                {footerRow.total}
              </TableCell>
            </TableRow>
          ) : null}
        </TableBody>
      </Table>
    </TableContainer>
  );
}

function SalesSectionCard({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        p: { xs: 2, sm: 2.5 },
      }}
    >
      {children}
    </Card>
  );
}

function StatGrid({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
        gap: 2,
      }}
    >
      {children}
    </Box>
  );
}

function SalesReportBody({ viewModel }: Readonly<{ viewModel: ReportsSalesViewModel }>) {
  return (
    <>
      <SalesSectionCard>
        <StatGrid>
          {viewModel.summaryStats.map((stat) => (
            <KpiCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={SUMMARY_ICONS[stat.id] ?? Banknote}
              accent={stat.accent as KpiCardAccent}
              changePercent={stat.changePercent}
              changeLabel={stat.changeLabel}
              footerText={stat.footerText}
              helperText={stat.helperText}
            />
          ))}
        </StatGrid>
        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          {viewModel.netSalesNote}
        </Typography>
      </SalesSectionCard>

      <SalesSectionCard>
        <SectionHeader
          title={reportsSalesCopy.trendTitle}
          subtitle={reportsSalesCopy.trendSubtitle}
        />
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'flex-end',
            gap: 2,
            mb: 1.5,
          }}
        >
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {viewModel.periodLabel}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {viewModel.compareLabel}
          </Typography>
        </Box>
        <TrendChart
          title={viewModel.trendChart.title}
          xLabels={viewModel.trendChart.xLabels}
          primarySeries={viewModel.trendChart.primarySeries}
          comparisonSeries={viewModel.trendChart.comparisonSeries}
          primaryLegendLabel={viewModel.trendChart.primaryLegendLabel}
          comparisonLegendLabel={viewModel.trendChart.comparisonLegendLabel}
          highlightedLabel={viewModel.trendChart.highlightedLabel}
          yAxisStep={viewModel.trendChart.yAxisStep}
          formatYAxisValue={(value) => formatInrAmount(value)}
          ariaLabel="Sales trend by business date"
        />
      </SalesSectionCard>

      <SalesSectionCard>
        <SectionHeader
          title={reportsSalesCopy.orderTypeTitle}
          subtitle={reportsSalesCopy.orderTypeSubtitle}
        />
        <Box
          sx={{
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 2,
          }}
        >
          {viewModel.orderTypeRows.map((row) => {
            const Icon = ORDER_TYPE_ICON[row.id] ?? UtensilsCrossed;
            const accent = ORDER_TYPE_ACCENT[row.id] ?? 'info';
            return (
              <Box key={row.id} sx={{ flex: 1, minWidth: 0 }}>
                <MetricCard
                  label={row.label}
                  icon={Icon}
                  sharePercent={row.sharePercent}
                  shareOf="sales"
                  primaryValue={row.amount}
                  secondaryValue={`${row.orders.toLocaleString('en-IN')} orders`}
                  accent={accent}
                />
              </Box>
            );
          })}
        </Box>
      </SalesSectionCard>

      <SalesSectionCard>
        <SectionHeader
          title={reportsSalesCopy.sessionTitle}
          subtitle={reportsSalesCopy.sessionSubtitle}
          actionLabel={reportsSalesCopy.sessionAction}
        />
        {viewModel.sessionRows.length === 0 ? (
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            No meal session sales for this period.
          </Typography>
        ) : (
          <SessionsTable rows={viewModel.sessionRows} />
        )}
      </SalesSectionCard>

      <SalesSectionCard>
        <SectionHeader
          title={reportsSalesCopy.breakdownTitle}
          subtitle={reportsSalesCopy.breakdownSubtitle}
        />
        <SalesBreakdownTable rows={viewModel.breakdownRows} footer={viewModel.breakdownFooter} />
      </SalesSectionCard>

      <SalesSectionCard>
        <Box
          sx={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ maxWidth: 560 }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
              {reportsSalesCopy.ctaTitle}
            </Typography>
            <Typography sx={{ mt: 0.75, fontSize: '0.8125rem', color: 'text.secondary' }}>
              {reportsSalesCopy.ctaBody}
            </Typography>
          </Box>
          <Button
            type="button"
            variant="contained"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '0.5rem', px: 2.5 }}
          >
            {reportsSalesCopy.ctaButton}
          </Button>
        </Box>
      </SalesSectionCard>
    </>
  );
}

export function ReportsSalesPage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);
  const [orderType, setOrderType] = useState('');

  const comparisonRange = useMemo(
    () => deriveComparisonRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const { data, isLoading, isError, error } = useReportsSales({
    dateFrom,
    dateTo,
    compareFrom: formatIsoDate(comparisonRange.compareFrom),
    compareTo: formatIsoDate(comparisonRange.compareTo),
    orderType: orderType || undefined,
  });

  const viewModel = useMemo(() => (data ? toReportsSalesViewModel(data) : undefined), [data]);

  let reportBody: ReactNode;
  if (isLoading) {
    reportBody = <Loading message="Loading sales report…" />;
  } else if (isError || !viewModel) {
    reportBody = (
      <AlertMessage
        variant="error"
        title="Unable to load sales report"
        message={
          error instanceof Error ? error.message : 'Try adjusting the date range and refresh.'
        }
      />
    );
  } else {
    reportBody = <SalesReportBody viewModel={viewModel} />;
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h6"
            sx={{ fontSize: '1.125rem', fontWeight: 700, letterSpacing: '-0.01em' }}
          >
            {reportsSalesCopy.title}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 520 }}
          >
            {reportsSalesCopy.subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <ReportsOverviewDateRange
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
          />
          <Dropdown
            placeholder="Order type"
            value={orderType}
            onChange={setOrderType}
            options={ORDER_TYPE_FILTER_OPTIONS}
            size="small"
            minWidth={168}
          />
          <Button
            type="button"
            variant="outlined"
            size="small"
            startIcon={<Download size={16} />}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '0.5rem',
              color: 'info.main',
            }}
          >
            {reportsSalesCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      {reportBody}
    </Box>
  );
}
