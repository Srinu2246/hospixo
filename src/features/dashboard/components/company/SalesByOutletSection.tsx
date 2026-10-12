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
import { colors } from '@/lib/theme/mui/colors';
import {
  OUTLET_PERFORMANCE_ROWS,
  OUTLET_SALES_CHART_BARS,
} from '@/lib/mocks/dashboard/dashboard.mocks';

export function SalesByOutletSection() {
  const [viewMode, setViewMode] = useState<'chart' | 'table'>('chart');
  const [activeTab, setActiveTab] = useState<'total' | 'top10'>('total');

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
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            sx={{
              fontSize: '0.75rem',
              fontWeight: 700,
              letterSpacing: '0.04em',
              color: colors.text.secondary,
              textTransform: 'uppercase',
            }}
          >
            SALES BY OUTLET
          </Typography>

          {/* Sub-tabs */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              p: 0.5,
              borderRadius: '6px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.04)' : '#F3F4F6',
            }}
          >
            <ButtonBase
              onClick={() => setActiveTab('total')}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: activeTab === 'total' ? 700 : 500,
                bgcolor:
                  activeTab === 'total'
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                color: activeTab === 'total' ? 'text.primary' : colors.text.secondary,
                boxShadow: activeTab === 'total' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Total Sales
            </ButtonBase>

            <ButtonBase
              onClick={() => setActiveTab('top10')}
              sx={{
                px: 1.5,
                py: 0.5,
                borderRadius: '4px',
                fontSize: '0.75rem',
                fontWeight: activeTab === 'top10' ? 700 : 500,
                bgcolor:
                  activeTab === 'top10'
                    ? (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF')
                    : 'transparent',
                color: activeTab === 'top10' ? 'text.primary' : colors.text.secondary,
                boxShadow: activeTab === 'top10' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              }}
            >
              Top 10 Branches
            </ButtonBase>
          </Box>
        </Box>

        {/* View Switcher & Action */}
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
            Compare Branches
          </ActionButton>
        </Box>
      </Box>

      {/* Render Chart or Table */}
      {viewMode === 'chart' ? (
        <Box sx={{ width: '100%', pt: 2, pb: 1 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              height: 220,
              gap: 1.5,
              px: { xs: 0, sm: 2 },
            }}
          >
            {OUTLET_SALES_CHART_BARS.map((bar) => (
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
                    maxWidth: 54,
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
                    fontSize: '0.625rem',
                    color: colors.text.secondary,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {bar.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Box>
      ) : (
        /* Table View matching Image 5 */
        <Box sx={{ overflowX: 'auto', width: '100%' }}>
          <Box
            component="table"
            sx={{
              width: '100%',
              borderCollapse: 'collapse',
              textAlign: 'left',
              minWidth: 640,
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
                    textTransform: 'uppercase',
                  }}
                >
                  Outlet
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
                    textTransform: 'uppercase',
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
                    textTransform: 'uppercase',
                  }}
                >
                  Sales
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
                    textTransform: 'uppercase',
                  }}
                >
                  Net Sales
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
                    textTransform: 'uppercase',
                  }}
                >
                  Tax
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
                    textTransform: 'uppercase',
                  }}
                >
                  Discount
                </Box>
              </Box>
            </Box>

            <Box component="tbody">
              {OUTLET_PERFORMANCE_ROWS.map((row) => (
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
                    {row.outletName}
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
                      fontWeight: 600,
                      color: 'text.primary',
                    }}
                  >
                    {row.sales}
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
                    {row.netSales}
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
                    {row.tax}
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
