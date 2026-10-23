'use client';

/**
 * Reports finance tab — payments collections, tender mix, and coverage notes.
 * Data from GET /v1/branches/{branch_id}/reports/payments.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { AlertCircle, Download, IndianRupee, Receipt, Wallet, type LucideIcon } from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { TrendChart } from '@/components/shared/ui/TrendChart';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatIsoDate,
} from '@/lib/helpers/reportsOverview';
import { useReportsPayments } from '@/lib/hooks/reports/reports/useBranchReports';
import {
  toReportsPaymentsViewModel,
  type ReportsPaymentsViewModel,
} from '@/lib/schemas/reports/reports/branchReports';
import { reportsFinanceCopy } from '@/lib/mocks/reports/reports.mocks';

const KPI_ICONS: Record<string, LucideIcon> = {
  'net-collections': Wallet,
  'tips-collected': IndianRupee,
  'transaction-count': Receipt,
  'previous-period': Wallet,
  'avg-collection': IndianRupee,
};

function SectionCard({ children }: Readonly<{ children: ReactNode }>) {
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

function FinanceSummary({ viewModel }: Readonly<{ viewModel: ReportsPaymentsViewModel }>) {
  const headline = viewModel.kpis.slice(0, 2);
  const supporting = viewModel.kpis.slice(2);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.4fr 1fr' }, gap: 2 }}>
        {headline.map((stat) => (
          <KpiCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={KPI_ICONS[stat.id] ?? Wallet}
            accent={stat.accent as KpiCardAccent}
            changePercent={stat.changePercent}
            changeLabel={stat.changeLabel}
            helperText={stat.helperText}
          />
        ))}
      </Box>
      <Box
        sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 2 }}
      >
        {supporting.map((stat) => (
          <KpiCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={KPI_ICONS[stat.id] ?? Wallet}
            accent={stat.accent as KpiCardAccent}
            helperText={stat.helperText}
          />
        ))}
      </Box>
    </Box>
  );
}

function CollectionsAndTender({ viewModel }: Readonly<{ viewModel: ReportsPaymentsViewModel }>) {
  return (
    <Box
      sx={{
        display: 'grid',
        gridTemplateColumns: { xs: '1fr', lg: '1.4fr 1fr' },
        gap: 2,
      }}
    >
      <SectionCard>
        <Typography sx={{ mb: 1.5, fontSize: '1rem', fontWeight: 700 }}>
          {reportsFinanceCopy.trendTitle}
        </Typography>
        <TrendChart
          title={viewModel.collectionsTrend.title}
          xLabels={viewModel.collectionsTrend.xLabels}
          primarySeries={viewModel.collectionsTrend.primarySeries}
          comparisonSeries={[]}
          primaryLegendLabel={viewModel.periodLabel}
          comparisonLegendLabel=""
          yAxisStep={viewModel.collectionsTrend.yAxisStep}
          formatYAxisValue={(value) => `₹${(value / 1000).toLocaleString('en-IN')}k`}
          ariaLabel="Daily net collections"
          height={180}
        />
        <Typography sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          {viewModel.coverageNote}
        </Typography>
      </SectionCard>

      <SectionCard>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
          <Wallet size={16} aria-hidden />
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
            {reportsFinanceCopy.tenderTitle}
          </Typography>
        </Box>
        <Typography sx={{ mb: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
          {reportsFinanceCopy.tenderSubtitle}
        </Typography>
        <Typography sx={{ fontSize: '1.75rem', fontWeight: 700, letterSpacing: '-0.02em' }}>
          {viewModel.tender.total}
        </Typography>
        {viewModel.tender.rows.length > 0 ? (
          <>
            <Box sx={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', my: 2 }}>
              {viewModel.tender.rows.map((row) => (
                <Box key={row.id} sx={{ width: `${row.share}%`, bgcolor: row.color }} />
              ))}
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {viewModel.tender.rows.map((row) => (
                <Box
                  key={row.id}
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 1,
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: row.color }} />
                    <Typography sx={{ fontSize: '0.8125rem' }}>{row.label}</Typography>
                  </Box>
                  <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>
                    {row.amount}
                  </Typography>
                </Box>
              ))}
            </Box>
          </>
        ) : (
          <Typography sx={{ mt: 2, fontSize: '0.8125rem', color: 'text.secondary' }}>
            No tender collections in this range.
          </Typography>
        )}
      </SectionCard>
    </Box>
  );
}

function CoverageNotes({ viewModel }: Readonly<{ viewModel: ReportsPaymentsViewModel }>) {
  if (viewModel.showCashReconciliation) {
    return null;
  }

  return (
    <SectionCard>
      <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
        {reportsFinanceCopy.reconciliationTitle}
      </Typography>
      <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
        {reportsFinanceCopy.reconciliationSubtitle}
      </Typography>
      <Typography sx={{ mt: 2, fontSize: '0.875rem', color: 'text.secondary' }}>
        {viewModel.reconciliationNote}
      </Typography>
    </SectionCard>
  );
}

function NeedsAttention({ viewModel }: Readonly<{ viewModel: ReportsPaymentsViewModel }>) {
  if (viewModel.attentionItems.length === 0) {
    return null;
  }

  return (
    <SectionCard>
      <Typography sx={{ mb: 1.5, fontSize: '1rem', fontWeight: 700 }}>
        {reportsFinanceCopy.attentionTitle}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {viewModel.attentionItems.map((item) => (
          <Box key={item.id} sx={{ display: 'flex', alignItems: 'flex-start', gap: 1.25 }}>
            <AlertCircle size={16} aria-hidden />
            <Box>
              <Typography sx={{ fontSize: '0.875rem', fontWeight: 700 }}>{item.title}</Typography>
              <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
                {item.detail}
              </Typography>
            </Box>
          </Box>
        ))}
      </Box>
    </SectionCard>
  );
}

function FinanceReportBody({ viewModel }: Readonly<{ viewModel: ReportsPaymentsViewModel }>) {
  return (
    <>
      <FinanceSummary viewModel={viewModel} />
      <CollectionsAndTender viewModel={viewModel} />
      <CoverageNotes viewModel={viewModel} />
      <NeedsAttention viewModel={viewModel} />
    </>
  );
}

export function ReportsFinancePage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);

  const comparisonRange = useMemo(
    () => deriveComparisonRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const { data, isLoading, isError, error } = useReportsPayments({
    dateFrom,
    dateTo,
    compareFrom: formatIsoDate(comparisonRange.compareFrom),
    compareTo: formatIsoDate(comparisonRange.compareTo),
  });

  const viewModel = useMemo(() => (data ? toReportsPaymentsViewModel(data) : undefined), [data]);

  let reportBody: ReactNode;
  if (isLoading) {
    reportBody = <Loading message="Loading payments report…" />;
  } else if (isError || !viewModel) {
    reportBody = (
      <AlertMessage
        variant="error"
        title="Unable to load payments report"
        message={
          error instanceof Error ? error.message : 'Try adjusting the date range and refresh.'
        }
      />
    );
  } else {
    reportBody = <FinanceReportBody viewModel={viewModel} />;
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
          <Typography variant="h6" sx={{ fontSize: '1.125rem', fontWeight: 700 }}>
            {reportsFinanceCopy.title}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 640 }}
          >
            {reportsFinanceCopy.subtitle}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1.5 }}>
          <ReportsOverviewDateRange
            dateFrom={dateFrom}
            dateTo={dateTo}
            onDateFromChange={setDateFrom}
            onDateToChange={setDateTo}
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
            {reportsFinanceCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      {reportBody}
    </Box>
  );
}
