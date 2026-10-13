'use client';

/** Reports sessions tab — summary KPIs and per-session item tables. */

import type { ElementType, ReactNode } from 'react';
import { Box, Button, Card, Typography } from '@mui/material';
import { CalendarDays, Download, Moon, Sun, Sunrise, UtensilsCrossed } from 'lucide-react';

import { KpiCard, type KpiCardAccent } from '@/components/shared/ui/KpiCard';
import {
  MOCK_REPORTS_SESSION_BLOCKS,
  MOCK_REPORTS_SESSIONS_SUMMARY,
  reportsSessionsCopy,
  type ReportsSessionItemRow,
} from '@/lib/mocks/reports/reports.mocks';

const SUMMARY_ICONS: Record<string, ElementType> = {
  'best-session': CalendarDays,
  'lowest-session': CalendarDays,
  'top-item': UtensilsCrossed,
  'sessions-covered': CalendarDays,
};

const SESSION_ICONS: Record<string, ElementType> = {
  breakfast: Sunrise,
  lunch: Sun,
  dinner: Moon,
};

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
      {rows.map((row) => (
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
      ))}
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

export function ReportsSessionsPage() {
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
            {reportsSessionsCopy.dateRangeLabel}
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
            {reportsSessionsCopy.exportLabel}
          </Button>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
          gap: 2,
        }}
      >
        {MOCK_REPORTS_SESSIONS_SUMMARY.map((stat) => (
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

      {MOCK_REPORTS_SESSION_BLOCKS.map((session) => {
        const Icon = SESSION_ICONS[session.id] ?? Sun;
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
                  <Typography sx={{ fontSize: '1rem', fontWeight: 700 }}>{session.name}</Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {session.hours}
                  </Typography>
                </Box>
              </Box>
              <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 3 }}>
                <Button
                  type="button"
                  variant="outlined"
                  size="small"
                  startIcon={<CalendarDays size={14} />}
                  sx={{
                    textTransform: 'none',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                    borderRadius: '999px',
                  }}
                >
                  {reportsSessionsCopy.periodLabel}
                </Button>
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
      })}
    </Box>
  );
}
