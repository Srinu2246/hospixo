'use client';

/**
 * Reports sessions tab — summary KPIs and per-session item tables.
 * Data from GET /v1/branches/{branch_id}/reports/sessions.
 */

import { useMemo, useState, type ReactNode } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import {
  CalendarDays,
  Download,
  Moon,
  Sun,
  Sunrise,
  UtensilsCrossed,
  type LucideIcon,
} from 'lucide-react';

import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import { ReportsOverviewDateRange } from '@/features/reports/reports/ReportsOverviewDateRange';
import {
  createDefaultReportsDateRange,
  deriveComparisonRange,
  formatIsoDate,
} from '@/lib/helpers/reportsOverview';
import {
  toReportsSessionsViewModel,
  type ReportsSessionsViewModel,
} from '@/lib/schemas/reports/reports/branchReports';
import { useReportsSessions } from '@/lib/hooks/reports/reports/useBranchReports';
import { reportsSessionsCopy, type ReportsSessionItemRow } from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, LucideIcon> = {
  'best-session': CalendarDays,
  'lowest-session': CalendarDays,
  'top-item': UtensilsCrossed,
  'sessions-covered': CalendarDays,
};

const SESSION_ICONS: Record<string, LucideIcon> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
};

function sessionIconKey(sessionId: string): string {
  if (sessionId.includes('breakfast')) return 'breakfast';
  if (sessionId.includes('lunch')) return 'lunch';
  if (sessionId.includes('dinner')) return 'dinner';
  return sessionId;
}

function SessionItemsTable({
  title,
  rows,
}: Readonly<{ title: string; rows: readonly ReportsSessionItemRow[] }>) {
  return (
    <Box sx={{ minWidth: 0 }}>
      <Typography sx={{ mb: 1.25, fontSize: '0.875rem', fontWeight: 700 }}>{title}</Typography>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '32px 1fr auto auto',
          columnGap: 1.5,
          px: 1.5,
          py: 1,
          borderRadius: '0.5rem 0.5rem 0 0',
          bgcolor: 'action.hover',
        }}
      >
        {['#', 'Item', 'Units sold', 'Sales'].map((label, index) => (
          <Typography
            key={label}
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              textTransform: 'uppercase',
              color: 'text.secondary',
              textAlign: index >= 2 ? 'right' : 'left',
            }}
          >
            {label}
          </Typography>
        ))}
      </Box>
      {rows.length === 0 ? (
        <Typography sx={{ px: 1.5, py: 2, fontSize: '0.8125rem', color: 'text.secondary' }}>
          No items for this list.
        </Typography>
      ) : (
        rows.map((row) => (
          <Box
            key={`${title}-${row.rank}`}
            sx={{
              display: 'grid',
              gridTemplateColumns: '32px 1fr auto auto',
              columnGap: 1.5,
              alignItems: 'center',
              px: 1.5,
              py: 1.25,
              borderBottom: '1px solid',
              borderColor: 'divider',
            }}
          >
            <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {row.rank}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 600 }}>{row.item}</Typography>
            <Typography sx={{ fontSize: '0.8125rem', textAlign: 'right' }}>
              {row.unitsSold}
            </Typography>
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, textAlign: 'right' }}>
              {row.sales}
            </Typography>
          </Box>
        ))
      )}
    </Box>
  );
}

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

function SessionsReportBody({ viewModel }: Readonly<{ viewModel: ReportsSessionsViewModel }>) {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {viewModel.summaryStats.map((stat) => (
          <KpiCard
            key={stat.id}
            label={stat.label}
            value={stat.value}
            icon={SUMMARY_ICONS[stat.id] ?? CalendarDays}
            accent={stat.accent as KpiCardAccent}
            footerContent={
              <Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                  {stat.amount}
                </Typography>
                <Typography sx={{ mt: 0.25, fontSize: '0.75rem', color: 'text.secondary' }}>
                  {stat.helperText}
                </Typography>
              </Box>
            }
          />
        ))}
      </Box>

      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
        {viewModel.coverageNote}
      </Typography>

      {viewModel.sessionBlocks.length === 0 ? (
        <SectionCard>
          <Typography sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
            No meal session rows for this period.
          </Typography>
        </SectionCard>
      ) : (
        viewModel.sessionBlocks.map((session) => {
          const Icon = SESSION_ICONS[sessionIconKey(session.id)] ?? Sun;
          return (
            <SectionCard key={session.id}>
              <Box
                sx={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 2,
                  mb: 2.5,
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '0.5rem',
                      bgcolor: 'action.hover',
                      color: 'info.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Icon size={18} aria-hidden />
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                      {session.name}
                    </Typography>
                    {session.hours !== '—' ? (
                      <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                        {session.hours}
                      </Typography>
                    ) : null}
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
                  <Typography
                    sx={{ fontSize: '0.75rem', color: 'text.secondary', fontWeight: 600 }}
                  >
                    {viewModel.periodLabel}
                  </Typography>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 600 }}
                    >
                      {reportsSessionsCopy.ordersLabel}
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                      {session.orders}
                    </Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography
                      sx={{ fontSize: '0.6875rem', color: 'text.secondary', fontWeight: 600 }}
                    >
                      {reportsSessionsCopy.netSalesLabel}
                    </Typography>
                    <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>
                      {session.netSales}
                    </Typography>
                  </Box>
                </Box>
              </Box>

              <Box
                sx={{
                  display: 'grid',
                  gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                  gap: 3,
                }}
              >
                <SessionItemsTable
                  title={reportsSessionsCopy.topItemsTitle}
                  rows={session.topItems}
                />
                <SessionItemsTable
                  title={reportsSessionsCopy.lowItemsTitle}
                  rows={session.lowItems}
                />
              </Box>
            </SectionCard>
          );
        })
      )}
    </>
  );
}

export function ReportsSessionsPage() {
  const defaultRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultRange.dateTo);

  const comparisonRange = useMemo(
    () => deriveComparisonRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const { data, isLoading, isError, error } = useReportsSessions({
    dateFrom,
    dateTo,
    compareFrom: formatIsoDate(comparisonRange.compareFrom),
    compareTo: formatIsoDate(comparisonRange.compareTo),
    limit: 5,
  });

  const viewModel = useMemo(() => (data ? toReportsSessionsViewModel(data) : undefined), [data]);

  let reportBody: ReactNode;
  if (isLoading) {
    reportBody = <Loading message="Loading sessions report…" />;
  } else if (isError || !viewModel) {
    reportBody = (
      <AlertMessage
        variant="error"
        title="Unable to load sessions report"
        message={
          error instanceof Error ? error.message : 'Try adjusting the date range and refresh.'
        }
      />
    );
  } else {
    reportBody = <SessionsReportBody viewModel={viewModel} />;
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
            {reportsSessionsCopy.title}
          </Typography>
          <Typography
            sx={{ mt: 0.5, fontSize: '0.8125rem', color: 'text.secondary', maxWidth: 560 }}
          >
            {reportsSessionsCopy.subtitle}
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
            {reportsSessionsCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      {reportBody}
    </Box>
  );
}
