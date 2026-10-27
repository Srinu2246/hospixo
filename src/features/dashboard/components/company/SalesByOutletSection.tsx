'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableRowsIcon from '@mui/icons-material/TableRows';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import type {
  OutletChartBarItem,
  OutletPerformanceRow,
} from '@/features/dashboard/types/dashboard.types';
import {
  OUTLET_PERFORMANCE_ROWS,
  OUTLET_SALES_CHART_BARS,
} from '@/lib/mocks/dashboard/dashboard.mocks';

const COMPANY_SECTION_CARD_SX = {
  borderRadius: '14px',
  borderColor: (theme: { palette: { mode: string; divider: string } }) =>
    theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0',
  bgcolor: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
  boxShadow: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.06)',
};

export interface SalesByOutletSectionProps {
  rows?: OutletPerformanceRow[];
  chartBars?: OutletChartBarItem[];
  activeTab?: 'total' | 'top10';
  onActiveTabChange?: (tab: 'total' | 'top10') => void;
}

export function SalesByOutletSection({
  rows,
  chartBars,
  activeTab: activeTabProp,
  onActiveTabChange,
}: Readonly<SalesByOutletSectionProps> = {}) {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [localTab, setLocalTab] = useState<'total' | 'top10'>('total');
  const activeTab = activeTabProp ?? localTab;
  const setActiveTab = onActiveTabChange ?? setLocalTab;

  const tableRows = rows ?? OUTLET_PERFORMANCE_ROWS;
  const bars = chartBars ?? OUTLET_SALES_CHART_BARS;

  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        ...COMPANY_SECTION_CARD_SX,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Typography
        sx={{
          fontSize: '0.6875rem',
          fontWeight: 700,
          letterSpacing: '0.06em',
          color: colors.text.secondary,
          textTransform: 'uppercase',
        }}
      >
        SALES BY BRANCHES
      </Typography>

      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 1.5,
          width: '100%',
        }}
      >
        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: '8px',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F1F5F9',
          }}
        >
          {(['total', 'top10'] as const).map((tab) => {
            const isActive = activeTab === tab;
            const label = tab === 'total' ? 'Total Sales' : 'Top 10 Branches';
            return (
              <ButtonBase
                key={tab}
                onClick={() => setActiveTab(tab)}
                sx={{
                  px: 1.75,
                  py: 0.65,
                  borderRadius: '6px',
                  fontSize: '0.75rem',
                  fontWeight: isActive ? 700 : 500,
                  bgcolor: isActive
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                  color: isActive ? 'text.primary' : colors.text.secondary,
                  boxShadow: isActive ? '0 1px 2px rgba(15, 23, 42, 0.08)' : 'none',
                }}
              >
                {label}
              </ButtonBase>
            );
          })}
        </Box>

        <Box
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            p: 0.5,
            borderRadius: '8px',
            border: '1px solid',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : '#E2E8F0',
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F8FAFC',
          }}
        >
          <IconButton
            size="small"
            onClick={() => setViewMode('chart')}
            aria-label="Chart view"
            sx={{
              borderRadius: '6px',
              p: 0.65,
              color: viewMode === 'chart' ? colors.primary.default : colors.text.secondary,
              bgcolor: viewMode === 'chart' ? 'rgba(45, 91, 255, 0.1)' : 'transparent',
            }}
          >
            <BarChartIcon sx={{ fontSize: 18 }} />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setViewMode('table')}
            aria-label="Table view"
            sx={{
              borderRadius: '6px',
              p: 0.65,
              color: viewMode === 'table' ? colors.primary.default : colors.text.secondary,
              bgcolor: viewMode === 'table' ? 'rgba(45, 91, 255, 0.1)' : 'transparent',
            }}
          >
            <TableRowsIcon sx={{ fontSize: 18 }} />
          </IconButton>
        </Box>
      </Box>

      {viewMode === 'chart' ? (
        <Box sx={{ overflowX: 'auto', width: '100%', pt: 1, pb: 0.5 }}>
          {bars.length === 0 ? (
            <Typography
              sx={{
                py: 6,
                textAlign: 'center',
                fontSize: '0.8125rem',
                color: colors.text.secondary,
              }}
            >
              No branch sales for this date range.
            </Typography>
          ) : (
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-end',
                justifyContent: 'space-between',
                height: 240,
                gap: 1.25,
                minWidth: Math.max(bars.length * 56, 320),
                px: { xs: 0.5, sm: 1.5 },
              }}
            >
              {bars.map((bar) => (
                <Box
                  key={bar.label}
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 1,
                    flex: '1 1 0',
                    minWidth: 44,
                    maxWidth: 56,
                    height: '100%',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Box
                    sx={{
                      width: '100%',
                      maxWidth: 48,
                      height: `${bar.heightPercent}%`,
                      minHeight: 8,
                      borderRadius: '6px 6px 0 0',
                      bgcolor: bar.isHighlight
                        ? '#2D5BFF'
                        : (theme) =>
                            theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : '#E2E8F0',
                      transition: 'background-color 0.2s ease',
                    }}
                  />
                  <Typography
                    sx={{
                      fontSize: '0.625rem',
                      color: colors.text.secondary,
                      fontWeight: 600,
                      textAlign: 'center',
                      lineHeight: 1.2,
                      maxWidth: 56,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                    }}
                  >
                    {bar.label}
                  </Typography>
                </Box>
              ))}
            </Box>
          )}
        </Box>
      ) : (
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: 560,
            }}
          >
            <Box component="thead">
              <Box
                component="tr"
                sx={{
                  borderBottom: '1px solid',
                  borderColor: '#E2E8F0',
                }}
              >
                {['Branch', 'Orders', 'Sales', 'Net Sales', 'Tax', 'Discount'].map((heading) => (
                  <Box
                    key={heading}
                    component="th"
                    sx={{
                      py: 1.25,
                      px: 1.5,
                      fontSize: '0.6875rem',
                      fontWeight: 700,
                      color: colors.text.secondary,
                      letterSpacing: '0.04em',
                      textTransform: 'uppercase',
                    }}
                  >
                    {heading}
                  </Box>
                ))}
              </Box>
            </Box>
            <Box component="tbody">
              {tableRows.map((row) => (
                <Box
                  component="tr"
                  key={row.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: 'rgba(226, 232, 240, 0.8)',
                    '&:hover': {
                      bgcolor: 'rgba(248, 250, 252, 0.9)',
                    },
                  }}
                >
                  <Box
                    component="td"
                    sx={{ py: 1.5, px: 1.5, fontSize: '0.8125rem', fontWeight: 700 }}
                  >
                    {row.outletName}
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1.5, px: 1.5, fontSize: '0.8125rem', color: colors.text.secondary }}
                  >
                    {row.orders}
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1.5, px: 1.5, fontSize: '0.8125rem', fontWeight: 600 }}
                  >
                    {row.sales}
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1.5, px: 1.5, fontSize: '0.8125rem', color: colors.text.secondary }}
                  >
                    {row.netSales}
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1.5, px: 1.5, fontSize: '0.8125rem', color: colors.text.secondary }}
                  >
                    {row.tax}
                  </Box>
                  <Box
                    component="td"
                    sx={{ py: 1.5, px: 1.5, fontSize: '0.8125rem', color: colors.text.secondary }}
                  >
                    {row.discount}
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      )}
    </Card>
  );
}
