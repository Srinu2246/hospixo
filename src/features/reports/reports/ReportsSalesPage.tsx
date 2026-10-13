'use client';

/**
 * Reports sales tab — summary KPIs, trend, order-type and session breakdown, daily table.
 * Data from mocks; layout uses shared report components.
 */

import type { ElementType, ReactNode } from 'react';
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
  UtensilsCrossed,
} from 'lucide-react';

import { TrendChart } from '@/components/shared/ui/TrendChart';
import { MetricCard, type MetricCardAccent } from '@/components/shared/ui/MetricCard';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { SectionHeader } from '@/components/shared/ui/SectionHeader';
import { SessionsTable } from '@/components/shared/ui/SessionsTable';
import {
  MOCK_REPORTS_SALES_BREAKDOWN,
  MOCK_REPORTS_SALES_BREAKDOWN_FOOTER,
  MOCK_REPORTS_SALES_BY_ORDER_TYPE,
  MOCK_REPORTS_SALES_BY_SESSION,
  MOCK_REPORTS_SALES_SUMMARY,
  MOCK_REPORTS_SALES_TREND_CHART,
  reportsSalesCopy,
} from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, ElementType> = {
  'total-sales': IndianRupee,
  'dine-in-sales': UtensilsCrossed,
  'takeaway-sales': ShoppingBag,
};

const ORDER_TYPE_ACCENT: Record<string, MetricCardAccent> = {
  'dine-in': 'info',
  takeaway: 'warning',
};

const ORDER_TYPE_ICON: Record<string, ElementType> = {
  'dine-in': UtensilsCrossed,
  takeaway: ShoppingBag,
};

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

function SalesBreakdownTable() {
  const footer = MOCK_REPORTS_SALES_BREAKDOWN_FOOTER;
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
          {MOCK_REPORTS_SALES_BREAKDOWN.map((row) => (
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
          <TableRow sx={{ bgcolor: 'action.hover' }}>
            <TableCell sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>{footer.date}</TableCell>
            <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
              {footer.dineIn}
            </TableCell>
            <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
              {footer.takeaway}
            </TableCell>
            <TableCell
              align="right"
              sx={{ ...breakdownBodyCellSx, fontWeight: 700, color: 'text.secondary' }}
            >
              {footer.delivery}
            </TableCell>
            <TableCell align="right" sx={{ ...breakdownBodyCellSx, fontWeight: 700 }}>
              {footer.total}
            </TableCell>
          </TableRow>
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

export function ReportsSalesPage() {
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
          <Button
            type="button"
            variant="outlined"
            size="small"
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              fontSize: '0.8125rem',
              borderRadius: '0.5rem',
            }}
          >
            {reportsSalesCopy.dateRangeLabel}
          </Button>
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

      <SalesSectionCard>
        <StatGrid>
          {MOCK_REPORTS_SALES_SUMMARY.map((stat) => (
            <KpiCard
              key={stat.id}
              label={stat.label}
              value={stat.value}
              icon={SUMMARY_ICONS[stat.id] ?? Banknote}
              accent={stat.accent as KpiCardAccent}
              changePercent={'changePercent' in stat ? stat.changePercent : undefined}
              changeLabel={'changeLabel' in stat ? stat.changeLabel : undefined}
              footerText={'footerText' in stat ? stat.footerText : undefined}
              helperText={stat.helperText}
            />
          ))}
        </StatGrid>
        <Typography sx={{ mt: 2, fontSize: '0.75rem', color: 'text.secondary' }}>
          {reportsSalesCopy.netSalesNote}
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
            {reportsSalesCopy.periodLabel}
          </Typography>
          <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
            {reportsSalesCopy.compareLabel}
          </Typography>
        </Box>
        <TrendChart
          title={MOCK_REPORTS_SALES_TREND_CHART.title}
          xLabels={MOCK_REPORTS_SALES_TREND_CHART.xLabels}
          primarySeries={MOCK_REPORTS_SALES_TREND_CHART.primarySeries}
          comparisonSeries={MOCK_REPORTS_SALES_TREND_CHART.comparisonSeries}
          primaryLegendLabel={MOCK_REPORTS_SALES_TREND_CHART.primaryLegendLabel}
          comparisonLegendLabel={MOCK_REPORTS_SALES_TREND_CHART.comparisonLegendLabel}
          highlightedLabel={MOCK_REPORTS_SALES_TREND_CHART.highlightedLabel}
          yAxisStep={MOCK_REPORTS_SALES_TREND_CHART.yAxisStep}
          formatYAxisValue={(value) => `₹${value.toLocaleString('en-IN')}`}
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
          {MOCK_REPORTS_SALES_BY_ORDER_TYPE.map((row) => {
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
                <Typography sx={{ mt: 1, fontSize: '0.8125rem' }}>
                  <Box component="span" sx={{ color: 'success.main', fontWeight: 600 }}>
                    ↑ {row.changePercent}%
                  </Box>
                  <Box component="span" sx={{ color: 'text.secondary' }}>
                    {' vs 14–20 Sep 2026'}
                  </Box>
                </Typography>
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
        <SessionsTable rows={MOCK_REPORTS_SALES_BY_SESSION} />
      </SalesSectionCard>

      <SalesSectionCard>
        <SectionHeader
          title={reportsSalesCopy.breakdownTitle}
          subtitle={reportsSalesCopy.breakdownSubtitle}
        />
        <SalesBreakdownTable />
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
    </Box>
  );
}
