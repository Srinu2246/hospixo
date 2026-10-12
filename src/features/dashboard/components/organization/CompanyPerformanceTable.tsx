'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import ButtonBase from '@mui/material/ButtonBase';
import BarChartIcon from '@mui/icons-material/BarChart';
import TableRowsIcon from '@mui/icons-material/TableRows';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import { colors } from '@/lib/theme/mui/colors';
import {
  COMPANY_PERFORMANCE_ROWS,
  COMPANY_PERFORMANCE_CHART_BARS,
} from '@/lib/mocks/dashboard/dashboard.mocks';

export function CompanyPerformanceTable() {
  const [viewMode, setViewMode] = useState<'table' | 'chart'>('table');

  return (
    <Card
      variant="outlined"
      padding={3}
      sx={{
        borderRadius: '12px',
        borderColor: (theme) =>
          theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
        bgcolor: (theme) =>
          theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
        boxShadow: 'none',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      {/* Section Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: colors.text.secondary,
              textTransform: 'uppercase',
            }}
          >
            COMPANY PERFORMANCE
          </Typography>

          <ButtonBase
            sx={{
              px: 1.5,
              py: 0.5,
              borderRadius: '6px',
              fontSize: '0.75rem',
              fontWeight: 700,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#F3F4F6',
              color: 'text.primary',
            }}
          >
            Total Sales
          </ButtonBase>
        </Box>

        {/* View Toggle (Chart / Table) & Compare Button */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
            }}
          >
            <IconButton
              size="small"
              onClick={() => setViewMode('chart')}
              sx={{
                borderRadius: '6px',
                p: 0.5,
                color: viewMode === 'chart' ? colors.primary.default : colors.text.secondary,
                bgcolor: viewMode === 'chart' ? 'rgba(27, 89, 248, 0.1)' : 'transparent',
              }}
            >
              <BarChartIcon sx={{ fontSize: 18 }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setViewMode('table')}
              sx={{
                borderRadius: '6px',
                p: 0.5,
                color: viewMode === 'table' ? colors.primary.default : colors.text.secondary,
                bgcolor: viewMode === 'table' ? 'rgba(27, 89, 248, 0.1)' : 'transparent',
              }}
            >
              <TableRowsIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>

          <ActionButton
            variant="outlined"
            size="small"
            sx={{
              fontSize: '0.75rem',
              borderRadius: '8px',
              px: 1.5,
              py: 0.65,
              color: colors.primary.default,
              borderColor: colors.border.default,
            }}
          >
            Compare Companies
          </ActionButton>
        </Box>
      </Box>

      {/* Render Table or Chart */}
      {viewMode === 'table' ? (
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: 700,
            }}
          >
            <Box component="thead">
              <Box
                component="tr"
                sx={{
                  borderBottom: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                }}
              >
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  Company Name
                </Box>
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  Branches
                </Box>
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  Revenue
                </Box>
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  Orders
                </Box>
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  Expenses
                </Box>
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                  }}
                >
                  Profit
                </Box>
                <Box
                  component="th"
                  sx={{
                    py: 1.25,
                    px: 1.5,
                    fontSize: '0.6875rem',
                    fontWeight: 700,
                    color: colors.text.secondary,
                    letterSpacing: '0.04em',
                    textAlign: 'center',
                  }}
                >
                  Status
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {COMPANY_PERFORMANCE_ROWS.map((row) => (
                <Box
                  component="tr"
                  key={row.id}
                  sx={{
                    borderBottom: '1px solid',
                    borderColor: (theme) =>
                      theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                    transition: 'background-color 0.15s ease',
                    '&:hover': {
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark'
                          ? 'rgba(255,255,255,0.02)'
                          : 'rgba(0,0,0,0.015)',
                    },
                  }}
                >
                  <Box
                    component="td"
                    sx={{
                      py: 1.75,
                      px: 1.5,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    {row.companyName}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.75,
                      px: 1.5,
                      fontSize: '0.8125rem',
                      color: colors.text.secondary,
                    }}
                  >
                    {row.branches}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.75,
                      px: 1.5,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: 'text.primary',
                    }}
                  >
                    {row.revenue}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.75,
                      px: 1.5,
                      fontSize: '0.8125rem',
                      color: colors.text.secondary,
                    }}
                  >
                    {row.orders}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.75,
                      px: 1.5,
                      fontSize: '0.8125rem',
                      color: colors.text.secondary,
                    }}
                  >
                    {row.expenses}
                  </Box>
                  <Box
                    component="td"
                    sx={{
                      py: 1.75,
                      px: 1.5,
                      fontSize: '0.8125rem',
                      fontWeight: 700,
                      color: row.isProfitPositive ? '#16A34A' : '#EF4444',
                    }}
                  >
                    {row.profit}
                  </Box>
                  <Box component="td" sx={{ py: 1.75, px: 1.5, textAlign: 'center' }}>
                    <StatusChip
                      label={
                        row.status === 'active'
                          ? 'Active'
                          : row.status === 'warning'
                            ? 'Warning'
                            : 'Inactive'
                      }
                      variantType={
                        row.status === 'active'
                          ? 'success'
                          : row.status === 'warning'
                            ? 'warning'
                            : 'default'
                      }
                      pill
                    />
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>
        </Box>
      ) : (
        /* Bar Chart View matching Image 4 */
        <Box sx={{ width: '100%', pt: 2, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 220,
              gap: 2,
              px: { xs: 1, sm: 4 },
            }}
          >
            {COMPANY_PERFORMANCE_CHART_BARS.map((bar) => (
              <Box
                key={bar.label}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 1.25,
                  flex: 1,
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <Box
                  sx={{
                    width: '100%',
                    maxWidth: 72,
                    height: `${bar.heightPercent}%`,
                    borderRadius: '6px 6px 0 0',
                    bgcolor: bar.isHighlight
                      ? colors.primary.default
                      : (theme) =>
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : '#E5E7EB',
                    transition: 'all 0.25s ease',
                    '&:hover': {
                      bgcolor: bar.isHighlight ? '#1548CA' : '#D1D5DB',
                      transform: 'scaleY(1.02)',
                      transformOrigin: 'bottom',
                    },
                  }}
                />
                <Typography
                  sx={{
                    fontSize: '0.6875rem',
                    color: colors.text.secondary,
                    fontWeight: 600,
                  }}
                >
                  {bar.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      )}
    </Card>
  );
}
