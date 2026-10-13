'use client';

import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import WarningAmberOutlinedIcon from '@mui/icons-material/WarningAmberOutlined';

import ButtonBase from '@mui/material/ButtonBase';
import CalendarMonthOutlinedIcon from '@mui/icons-material/CalendarMonthOutlined';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import {
  BRANCH_STAT_CARDS,
  BRANCH_EXPENSES,
  BRANCH_SALES_SUMMARY,
  BRANCH_SALES_CHART_Y_AXIS,
  BRANCH_SALES_CHART_LEGEND,
  BRANCH_PAYMENT_MODES,
  BRANCH_ONLINE_ORDERS_STATS,
  BRANCH_ONLINE_AGGREGATORS,
  BRANCH_LEAKAGE_STATS,
  BRANCH_CHANNEL_CARDS,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { QuickHelpCard } from '../shared/QuickHelpCard';

export function BranchSalesDashboard() {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3.5, width: '100%', pb: 4 }}>
      {/* 1. Top 4 Stat Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: 'repeat(4, 1fr)' },
          gap: 2.5,
        }}
      >
        {BRANCH_STAT_CARDS.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      {/* 2. Sub-section Header: Sales Statistics with Date & Refresh Button */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          pt: 0.5,
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.25rem',
            color: 'text.primary',
            letterSpacing: '-0.015em',
          }}
        >
          Sales Statistics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <ButtonBase
            sx={{
              px: 1.75,
              py: 0.85,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
              color: 'text.primary',
              fontSize: '0.8125rem',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: 1,
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
            {BRANCH_SALES_SUMMARY.dateRange}
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
          </ButtonBase>

          <ButtonBase
            sx={{
              p: 0.85,
              borderRadius: '8px',
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
              color: colors.text.secondary,
              transition: 'all 0.15s ease',
              '&:hover': {
                borderColor: colors.primary.default,
                color: colors.primary.default,
              },
            }}
          >
            <RefreshIcon sx={{ fontSize: 20 }} />
          </ButtonBase>
        </Box>
      </Box>

      {/* 3. Middle Row: 3 Visual Analysis Cards */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Card 1: Channel Orders Chart */}
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
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 1,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1B59F8' }} />
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                Sales
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-end',
                  lineHeight: 1.25,
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                  Total Orders{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {BRANCH_SALES_SUMMARY.totalOrders}
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                  Total Sales{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {BRANCH_SALES_SUMMARY.totalSales}
                  </Box>
                </Typography>
              </Box>

              <ButtonBase
                sx={{
                  px: 1,
                  py: 0.35,
                  borderRadius: '6px',
                  border: '1px solid',
                  borderColor: (theme) =>
                    theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'text.primary',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                }}
              >
                Today
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
              </ButtonBase>
            </Box>
          </Box>

          {/* Bar Chart with Y-Axis and Horizontal grid lines */}
          <Box sx={{ display: 'flex', gap: 1.5, height: 175, pt: 1, alignItems: 'stretch' }}>
            {/* Y-Axis Labels */}
            <Box
              sx={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                py: 0.5,
                textAlign: 'right',
                width: 32,
              }}
            >
              {BRANCH_SALES_CHART_Y_AXIS.map((label) => (
                <Typography
                  key={label}
                  sx={{ fontSize: '0.6875rem', color: colors.text.secondary, fontWeight: 500 }}
                >
                  {label}
                </Typography>
              ))}
            </Box>

            {/* Bars with subtle horizontal lines */}
            <Box sx={{ flex: 1, position: 'relative', height: '100%' }}>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  pointerEvents: 'none',
                }}
              >
                {[0, 1, 2, 3].map((i) => (
                  <Box
                    key={i}
                    sx={{
                      width: '100%',
                      height: '1px',
                      bgcolor: (theme) =>
                        theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
                    }}
                  />
                ))}
              </Box>

              <Box
                sx={{
                  position: 'relative',
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-around',
                  height: '100%',
                  zIndex: 1,
                  px: 1,
                }}
              >
                {/* Dine In Bar */}
                <Box
                  sx={{
                    width: '24%',
                    height: '82%',
                    borderRadius: '4px 4px 0 0',
                    bgcolor: '#BFDBFE',
                  }}
                />

                {/* Take Away Bar */}
                <Box
                  sx={{
                    width: '24%',
                    height: '38%',
                    borderRadius: '4px 4px 0 0',
                    bgcolor: '#34D399',
                  }}
                />

                {/* Delivery Bar */}
                <Box
                  sx={{
                    width: '24%',
                    height: '56%',
                    borderRadius: '4px 4px 0 0',
                    bgcolor: '#FB7185',
                  }}
                />
              </Box>
            </Box>
          </Box>

          {/* Bottom Legend */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 2.5,
              pt: 0.5,
            }}
          >
            {BRANCH_SALES_CHART_LEGEND.map((item) => (
              <Box key={item.label} sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                <Box sx={{ width: 10, height: 10, borderRadius: '2px', bgcolor: item.color }} />
                <Typography
                  sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}
                >
                  {item.label}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Card 2: Payment Modes Breakdown */}
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
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '6px',
                  bgcolor: 'rgba(27, 89, 248, 0.1)',
                  color: '#1B59F8',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TrendingUpIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography
                sx={{ fontSize: '0.8125rem', color: colors.text.secondary, fontWeight: 600 }}
              >
                Total Sales
              </Typography>
            </Box>
            <Typography
              sx={{ fontSize: '1.625rem', fontWeight: 700, color: 'text.primary', mt: 0.25 }}
            >
              ₹887,260
            </Typography>
          </Box>

          {/* Segmented Bar */}
          <Box
            sx={{
              display: 'flex',
              width: '100%',
              height: 10,
              borderRadius: '5px',
              overflow: 'hidden',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F3F4F6',
            }}
          >
            <Box sx={{ width: '18%', height: '100%', bgcolor: '#3B82F6' }} />
            <Box sx={{ width: '8%', height: '100%', bgcolor: '#8B5CF6' }} />
            <Box sx={{ width: '6%', height: '100%', bgcolor: '#10B981' }} />
            <Box sx={{ width: '68%', height: '100%', bgcolor: '#F59E0B' }} />
          </Box>

          {/* Payment Mode Rows */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {BRANCH_PAYMENT_MODES.map((p) => (
              <Box
                key={p.label}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.8125rem',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                  <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary }}>
                    {p.label}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                  {p.amount}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>

        {/* Card 3: Online Orders Aggregators */}
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
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
              Online orders
            </Typography>
            <ButtonBase
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Today
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
            </ButtonBase>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                Total Online Sales
              </Typography>
              <Typography
                sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary', mt: 0.5 }}
              >
                {BRANCH_ONLINE_ORDERS_STATS.totalOnlineSales}
              </Typography>
            </Box>
            <Box>
              <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                Orders
              </Typography>
              <Typography
                sx={{ fontSize: '1.25rem', fontWeight: 700, color: 'text.primary', mt: 0.5 }}
              >
                {BRANCH_ONLINE_ORDERS_STATS.orders}
              </Typography>
            </Box>
          </Box>

          {/* Aggregator Platforms List */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                px: 0.75,
                py: 0.25,
              }}
            >
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: colors.text.secondary,
                  letterSpacing: '0.04em',
                }}
              >
                PLATFORM
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.6875rem',
                  fontWeight: 700,
                  color: colors.text.secondary,
                  letterSpacing: '0.04em',
                }}
              >
                ORDERS
              </Typography>
            </Box>
            {BRANCH_ONLINE_AGGREGATORS.map((agg) => (
              <Box
                key={agg.name}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 0.75,
                  borderRadius: '6px',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Box
                    sx={{
                      width: 20,
                      height: 20,
                      borderRadius: '4px',
                      bgcolor: agg.iconColor,
                      color: '#FFFFFF',
                      fontSize: '0.625rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {agg.name[0]}
                  </Box>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.primary' }}
                  >
                    {agg.name}
                  </Typography>
                </Box>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                  {agg.orders}
                </Typography>
              </Box>
            ))}
          </Box>
        </Card>
      </Box>

      {/* 3. Channel Summary Cards (Dine In, Take Away, Delivery) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        {BRANCH_CHANNEL_CARDS.map((channel) => (
          <Card
            key={channel.title}
            variant="outlined"
            padding={2.5}
            sx={{
              borderRadius: '12px',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
              boxShadow: 'none',
              display: 'flex',
              flexDirection: 'column',
              gap: 1.5,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? `${channel.color}26` : channel.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {channel.icon === 'dine-in' && (
                    <RestaurantIcon sx={{ fontSize: 18, color: channel.color }} />
                  )}
                  {channel.icon === 'take-away' && (
                    <TakeoutDiningIcon sx={{ fontSize: 18, color: channel.color }} />
                  )}
                  {channel.icon === 'delivery' && (
                    <DeliveryDiningIcon sx={{ fontSize: 18, color: channel.color }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                  {channel.title}
                </Typography>
              </Box>
              <MoreHorizIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
            </Box>
            <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
              {channel.amount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
              {channel.orders}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* 4. Bottom Row: Today's Expenses + Leakage + Quick Help */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', md: '1fr 1fr 1fr' },
          gap: 2.5,
        }}
      >
        {/* Branch Expenses */}
        <Card
          variant="outlined"
          padding={3}
          sx={{
            borderRadius: '16px',
            borderColor: (theme) =>
              theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
            bgcolor: (theme) =>
              theme.palette.mode === 'dark' ? colors.surface.dark : colors.surface.default,
            boxShadow: 'none',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: 2,
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography
              sx={{
                fontSize: '0.6875rem',
                fontWeight: 700,
                letterSpacing: '0.04em',
                color: colors.text.secondary,
                textTransform: 'uppercase',
              }}
            >
              TODAY&apos;S EXPENSES
            </Typography>
            <ButtonBase
              sx={{
                px: 1,
                py: 0.35,
                borderRadius: '6px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: 'text.primary',
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
              }}
            >
              Today
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
            </ButtonBase>
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'flex-start',
              justifyContent: 'space-between',
              mt: 0.5,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography sx={{ fontSize: '1.5rem', fontWeight: 700, color: 'text.primary' }}>
                ₹9,580
              </Typography>
              <Typography sx={{ fontSize: '0.6875rem', color: colors.text.secondary }}>
                Expense categories tracked
              </Typography>
            </Box>
            <Typography sx={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 700 }}>
              ↑ 6.2% vs yesterday
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            {BRANCH_EXPENSES.map((item) => (
              <Box
                key={item.category}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.75rem',
                }}
              >
                <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                  {item.category}
                </Typography>
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'text.primary' }}>
                  {item.amount}
                </Typography>
              </Box>
            ))}
          </Box>

          <Box
            sx={{
              pt: 1.5,
              borderTop: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
              Total Expenses
            </Typography>
            <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
              ₹1,30,000
            </Typography>
          </Box>
        </Card>

        {/* Leakage Tracker */}
        <Card
          variant="outlined"
          padding={3}
          sx={{
            borderRadius: '16px',
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
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <WarningAmberOutlinedIcon sx={{ fontSize: 18, color: '#EA580C' }} />
            <Typography sx={{ fontSize: '0.875rem', fontWeight: 700, color: 'text.primary' }}>
              Leakage
            </Typography>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              sx={{ fontSize: '0.625rem', fontWeight: 700, color: colors.text.secondary }}
            >
              KOTS
            </Typography>
            <Box
              sx={{
                p: 1.25,
                borderRadius: '8px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 1.5,
                textAlign: 'left',
              }}
            >
              <Box>
                <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
                  Cancelled:{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {BRANCH_LEAKAGE_STATS.kots.cancelled}
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary, mt: 0.5 }}>
                  Not used in bills:{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {BRANCH_LEAKAGE_STATS.kots.notUsedInBills}
                  </Box>
                </Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
                  Modified:{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {BRANCH_LEAKAGE_STATS.kots.modified}
                  </Box>
                </Typography>
                <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary, mt: 0.5 }}>
                  Shifted:{' '}
                  <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                    {BRANCH_LEAKAGE_STATS.kots.shifted}
                  </Box>
                </Typography>
              </Box>
            </Box>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <Typography
              sx={{ fontSize: '0.625rem', fontWeight: 700, color: colors.text.secondary }}
            >
              BILLS
            </Typography>
            <Box
              sx={{
                p: 1.25,
                borderRadius: '8px',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.02)' : '#F9FAFB',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: 1.5,
                textAlign: 'left',
              }}
            >
              <Box>
                <Box sx={{ mb: 0.75 }}>
                  <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
                    Modified
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}
                  >
                    {BRANCH_LEAKAGE_STATS.bills.modified}
                  </Typography>
                </Box>
                <Box>
                  <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
                    Waived off
                  </Typography>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}
                  >
                    {BRANCH_LEAKAGE_STATS.bills.waivedOff}
                  </Typography>
                </Box>
              </Box>
              <Box>
                <Typography sx={{ fontSize: '0.625rem', color: colors.text.secondary }}>
                  Re-printed
                </Typography>
                <Typography sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}>
                  {BRANCH_LEAKAGE_STATS.bills.reprinted}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Card>

        {/* Quick Help */}
        <QuickHelpCard
          idLabel="Outlet ID: 63284"
          showPocBadge
          statusText="Online"
          description="Your dedicated account manager for all operational support and billing queries. Reach out anytime during working hours."
          availableHours="Available 10:00 AM – 07:00 PM"
        />
      </Box>
    </Box>
  );
}
