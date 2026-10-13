'use client';

/** Reports finance tab — collections, tender mix, cash reconciliation, and attention items. */

import type { ElementType, ReactNode } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { AlertCircle, CalendarDays, Download, IndianRupee, Scale, Wallet } from 'lucide-react';

import { TrendChart } from '@/components/shared/ui/TrendChart';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import {
  MOCK_REPORTS_FINANCE_ATTENTION,
  MOCK_REPORTS_FINANCE_COLLECTIONS_TREND,
  MOCK_REPORTS_FINANCE_PAGE_KPIS,
  MOCK_REPORTS_FINANCE_RECONCILIATION,
  MOCK_REPORTS_FINANCE_TENDER,
  reportsFinanceCopy,
} from '@/lib/mocks/reports/reports.mocks';

const KPI_ICONS: Record<string, ElementType> = {
  'net-collections': Wallet,
  'cash-variance': Scale,
  'net-sales': IndianRupee,
  'recipe-cost': Wallet,
  contribution: IndianRupee,
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

function FinanceSummary() {
  const headline = MOCK_REPORTS_FINANCE_PAGE_KPIS.slice(0, 2);
  const supporting = MOCK_REPORTS_FINANCE_PAGE_KPIS.slice(2);

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
            changePercent={'changePercent' in stat ? stat.changePercent : undefined}
            changeLabel={'changeLabel' in stat ? stat.changeLabel : undefined}
            helperText={'helperText' in stat ? stat.helperText : undefined}
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
            helperText={'helperText' in stat ? stat.helperText : undefined}
          />
        ))}
      </Box>
    </Box>
  );
}

function CollectionsAndTender() {
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
          title={MOCK_REPORTS_FINANCE_COLLECTIONS_TREND.title}
          xLabels={MOCK_REPORTS_FINANCE_COLLECTIONS_TREND.xLabels}
          primarySeries={MOCK_REPORTS_FINANCE_COLLECTIONS_TREND.primarySeries}
          comparisonSeries={[]}
          primaryLegendLabel=""
          comparisonLegendLabel=""
          yAxisStep={MOCK_REPORTS_FINANCE_COLLECTIONS_TREND.yAxisStep}
          formatYAxisValue={(value) => `₹${(value / 1000).toLocaleString('en-IN')}k`}
          ariaLabel="Daily net collections"
          height={180}
        />
        <Typography sx={{ mt: 1, fontSize: '0.75rem', color: 'text.secondary' }}>
          {reportsFinanceCopy.trendCaption}
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
          {MOCK_REPORTS_FINANCE_TENDER.total}
        </Typography>
        <Box sx={{ display: 'flex', height: 10, borderRadius: 999, overflow: 'hidden', my: 2 }}>
          {MOCK_REPORTS_FINANCE_TENDER.rows.map((row) => (
            <Box key={row.id} sx={{ width: `${row.share}%`, bgcolor: row.color }} />
          ))}
        </Box>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
          {MOCK_REPORTS_FINANCE_TENDER.rows.map((row) => (
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
              <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700 }}>{row.amount}</Typography>
            </Box>
          ))}
        </Box>
      </SectionCard>
    </Box>
  );
}

function CashReconciliation() {
  return (
    <SectionCard>
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          mb: 2,
        }}
      >
        <Box>
          <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
            {reportsFinanceCopy.reconciliationTitle}
          </Typography>
          <Typography sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary' }}>
            {reportsFinanceCopy.reconciliationSubtitle}
          </Typography>
        </Box>
        <Button
          type="button"
          variant="outlined"
          size="small"
          startIcon={<CalendarDays size={14} />}
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: '0.5rem' }}
        >
          {reportsFinanceCopy.reconciliationDate}
        </Button>
      </Box>
      <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700 }}>
        {reportsFinanceCopy.shiftTitle}
      </Typography>
      <Typography sx={{ mt: 0.25, mb: 2, fontSize: '0.8125rem', color: 'text.secondary' }}>
        {reportsFinanceCopy.shiftMeta}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column' }}>
        {MOCK_REPORTS_FINANCE_RECONCILIATION.map((row) => (
          <Box
            key={row.id}
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              py: 1.25,
              borderTop: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: '0.875rem', color: 'text.secondary' }}>
              {row.label}
            </Typography>
            <Typography
              sx={{
                fontSize: '0.875rem',
                fontWeight: 700,
                color: row.value.startsWith('−') ? 'error.main' : 'text.primary',
              }}
            >
              {row.value}
            </Typography>
          </Box>
        ))}
      </Box>
      <Typography sx={{ mt: 1.5, fontSize: '0.75rem', color: 'text.secondary' }}>
        {reportsFinanceCopy.reconciliationNote}
      </Typography>
    </SectionCard>
  );
}

function NeedsAttention() {
  return (
    <SectionCard>
      <Typography sx={{ mb: 1.5, fontSize: '1rem', fontWeight: 700 }}>
        {reportsFinanceCopy.attentionTitle}
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
        {MOCK_REPORTS_FINANCE_ATTENTION.map((item) => (
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

export function ReportsFinancePage() {
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
            {reportsFinanceCopy.dateRangeLabel}
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
            {reportsFinanceCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      <FinanceSummary />
      <CollectionsAndTender />
      <CashReconciliation />
      <NeedsAttention />
    </Box>
  );
}
