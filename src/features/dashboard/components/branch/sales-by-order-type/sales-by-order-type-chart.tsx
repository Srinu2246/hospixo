'use client';

import { useMemo, useState } from 'react';
import { Box, Card, Typography } from '@mui/material';

import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type {
  BranchDashboardOverview,
  BranchDashboardPeriod,
} from '@/features/dashboard/types/branch-dashboard';
import { formatCurrency } from '@/features/dashboard/lib/format';
import { PeriodSelect } from '@/features/dashboard/components/branch/shared/period-select';

import { OrderTypeHoverCard } from './order-type-hover-card';

type SalesByOrderTypeChartProps = Readonly<{
  rows: BranchDashboardOverview['salesByOrderType'];
  summary: BranchDashboardOverview['salesSummary'];
  period: BranchDashboardPeriod;
  onPeriodChange: (period: BranchDashboardPeriod) => void;
}>;

export function SalesByOrderTypeChart({
  rows,
  summary,
  period,
  onPeriodChange,
}: SalesByOrderTypeChartProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const maxSales = Math.max(...rows.map((row) => row.sales), 1);
  const yAxisLabels = useMemo(() => {
    const top = Math.ceil(maxSales / 1000);
    return [top, Math.round(top * 0.75), Math.round(top * 0.5), Math.round(top * 0.25), 0].map(
      (value) => `${value}k`,
    );
  }, [maxSales]);

  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.5,
          mb: 2,
        }}
      >
        <Box>
          <Typography
            sx={{
              fontSize: '0.6875rem',
              fontWeight: 700,
              letterSpacing: '0.14em',
              textTransform: 'uppercase',
              color: 'text.secondary',
            }}
          >
            {branchDashboardCopy.salesChartTitle}
          </Typography>
          <Box sx={{ display: 'flex', gap: 2, mt: 0.5, fontSize: '0.8125rem' }}>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {branchDashboardCopy.totalOrdersLabel}{' '}
              <Box component="strong" sx={{ color: 'text.primary' }}>
                {summary.totalOrders.toLocaleString('en-IN')}
              </Box>
            </Typography>
            <Typography variant="body2" sx={{ fontSize: '0.8125rem', color: 'text.secondary' }}>
              {branchDashboardCopy.totalSalesLabel}{' '}
              <Box component="strong" sx={{ color: 'text.primary' }}>
                {formatCurrency(summary.totalSales)}
              </Box>
            </Typography>
          </Box>
        </Box>
        <PeriodSelect value={period} onChange={onPeriodChange} ariaLabel="Sales chart period" />
      </Box>

      <Box sx={{ display: 'flex', gap: 2, height: 220, pt: 2, alignItems: 'flex-end' }}>
        {/* Y Axis */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%',
            pb: 3,
            color: 'text.secondary',
            fontSize: '0.6875rem',
            textAlign: 'right',
            minWidth: 28,
          }}
        >
          {yAxisLabels.map((label, index) => (
            <Typography
              key={`${index}-${label}`}
              variant="caption"
              sx={{ fontSize: '0.6875rem', color: 'text.secondary' }}
            >
              {label}
            </Typography>
          ))}
        </Box>

        {/* Plot area */}
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            gridTemplateColumns: `repeat(${rows.length || 1}, minmax(0, 1fr))`,
            alignItems: 'flex-end',
            gap: 2,
            height: '100%',
            pb: 1,
            borderBottom: 1,
            borderColor: 'divider',
          }}
        >
          {rows.map((row, index) => {
            const heightPixels = Math.max((row.sales / maxSales) * 160, 6);
            const isActive = activeIndex === index;

            return (
              <Box
                key={row.id}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  height: '100%',
                  justifyContent: 'flex-end',
                  position: 'relative',
                }}
              >
                <Box
                  component="button"
                  type="button"
                  aria-label={`${row.label} sales details`}
                  onMouseEnter={() => setActiveIndex(index)}
                  onMouseLeave={() => setActiveIndex(null)}
                  onFocus={() => setActiveIndex(index)}
                  onBlur={() => setActiveIndex(null)}
                  sx={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'center',
                    bgcolor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    p: 0,
                    position: 'relative',
                  }}
                >
                  {isActive ? <OrderTypeHoverCard row={row} /> : null}
                  <Box
                    sx={{
                      width: { xs: '60%', sm: '48%' },
                      height: `${heightPixels}px`,
                      bgcolor: row.color,
                      borderRadius: '6px 6px 0 0',
                      transition: 'height 0.3s ease-in-out, opacity 0.15s',
                      opacity: isActive ? 1 : 0.85,
                      '&:hover': {
                        opacity: 1,
                      },
                    }}
                  />
                </Box>
                <Typography
                  variant="caption"
                  sx={{
                    color: 'text.secondary',
                    fontSize: '0.75rem',
                    mt: 1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {row.label}
                </Typography>
              </Box>
            );
          })}
          {rows.length === 0 ? (
            <Box sx={{ gridColumn: '1 / -1', textAlign: 'center', py: 4 }}>
              <Typography variant="caption" sx={{ color: 'text.secondary', fontStyle: 'italic' }}>
                No sales by order type data available.
              </Typography>
            </Box>
          ) : null}
        </Box>
      </Box>
    </Card>
  );
}
