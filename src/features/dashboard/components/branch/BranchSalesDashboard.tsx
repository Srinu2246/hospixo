'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
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
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';

import { Card } from '@/components/shared/ui/Card';
import { Modal } from '@/components/shared/ui/Modal';
import { CalendarPicker } from '@/components/shared/form-fields/CalendarPicker';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { colors } from '@/lib/theme/mui/colors';
import { useToastStore } from '@/stores/toastStore';
import { DateRangeOption, PeriodOption } from '@/features/dashboard/types/dashboard.types';
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
  MOCK_DATE_RANGE_OPTIONS,
  MOCK_PERIOD_OPTIONS,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { DashboardStatCard } from '../shared/DashboardStatCard';
import { QuickHelpCard } from '../shared/QuickHelpCard';

export interface BranchSalesDashboardProps {
  onExportClick?: () => void;
}

export function BranchSalesDashboard({ onExportClick }: Readonly<BranchSalesDashboardProps> = {}) {
  const [selectedDateRange, setSelectedDateRange] = useState<string>(
    BRANCH_SALES_SUMMARY.dateRange,
  );
  const [dateMenuAnchor, setDateMenuAnchor] = useState<HTMLElement | null>(null);
  const [customDialogOpen, setCustomDialogOpen] = useState(false);
  const [customStartDate, setCustomStartDate] = useState<Date>(
    BRANCH_SALES_SUMMARY.defaultStartDate,
  );
  const [customEndDate, setCustomEndDate] = useState<Date>(BRANCH_SALES_SUMMARY.defaultEndDate);

  const [chartPeriod, setChartPeriod] = useState<PeriodOption>(PeriodOption.TODAY);
  const [chartMenuAnchor, setChartMenuAnchor] = useState<HTMLElement | null>(null);

  const [onlinePeriod, setOnlinePeriod] = useState<PeriodOption>(PeriodOption.TODAY);
  const [onlineMenuAnchor, setOnlineMenuAnchor] = useState<HTMLElement | null>(null);

  const [expensesPeriod, setExpensesPeriod] = useState<PeriodOption>(PeriodOption.TODAY);
  const [expensesMenuAnchor, setExpensesMenuAnchor] = useState<HTMLElement | null>(null);

  const handleExport = () => {
    if (onExportClick) {
      onExportClick();
    } else {
      useToastStore.getState().show('Exporting sales statistics data to CSV/Excel...', 'info');
    }
  };

  const handleRefresh = () => {
    useToastStore.getState().show('Refreshing branch dashboard data...', 'info');
  };

  const handleDateSelect = (option: DateRangeOption) => {
    setDateMenuAnchor(null);
    if (option === DateRangeOption.CUSTOM_RANGE) {
      setCustomDialogOpen(true);
      return;
    }
    setSelectedDateRange(option);
    useToastStore.getState().show(`Filtered sales statistics for ${option}`, 'info');
  };

  const handleApplyCustomDate = () => {
    if (customStartDate && customEndDate) {
      const formatDate = (date: Date) =>
        date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
      const formatted = `${formatDate(customStartDate)} to ${formatDate(customEndDate)}`;
      setSelectedDateRange(formatted);
      useToastStore.getState().show(`Filtered sales statistics for ${formatted}`, 'success');
    }
    setCustomDialogOpen(false);
  };

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2.5, sm: 3, md: 3.5 },
        width: '100%',
        pb: 4,
      }}
    >
      {/* 1. Sub-section Header: Sales Statistics with Date & Refresh/Export Button */}
      {/* Appears first up to 1050px (order: 1); sub-header below stats on desktop > 1050px (order: 2) */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 2,
          pt: 0.5,
          order: 1,
          '@media (min-width: 1051px)': {
            order: 2,
          },
        }}
      >
        <Typography
          variant="h5"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.25rem', sm: '1.375rem' },
            color: 'text.primary',
            letterSpacing: '-0.015em',
          }}
        >
          Sales Statistics
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          {/* Working Date Selection Button */}
          <ButtonBase
            onClick={(e) => setDateMenuAnchor(e.currentTarget)}
            sx={{
              px: { xs: 1.25, sm: 1.75 },
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
              transition: 'border-color 0.15s ease',
              '&:hover': {
                borderColor: colors.primary.default,
              },
            }}
          >
            <CalendarMonthOutlinedIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
            {selectedDateRange}
            <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
          </ButtonBase>

          {/* Date Options Menu */}
          <Menu
            anchorEl={dateMenuAnchor}
            open={Boolean(dateMenuAnchor)}
            onClose={() => setDateMenuAnchor(null)}
            slotProps={{
              paper: {
                sx: {
                  borderRadius: '10px',
                  minWidth: 230,
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                },
              },
            }}
          >
            {MOCK_DATE_RANGE_OPTIONS.map((range) => (
              <MenuItem
                key={range}
                selected={range === selectedDateRange}
                onClick={() => handleDateSelect(range)}
                sx={{ fontSize: '0.8125rem' }}
              >
                {range}
              </MenuItem>
            ))}
          </Menu>

          {/* Custom Date Range Picker Modal */}
          <Modal
            open={customDialogOpen}
            onClose={() => setCustomDialogOpen(false)}
            title="Select Custom Date Range"
            width={400}
            height="auto"
            footer={
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5, width: '100%' }}>
                <ActionButton
                  variant="outlined"
                  size="small"
                  onClick={() => setCustomDialogOpen(false)}
                >
                  Cancel
                </ActionButton>
                <ActionButton variant="primary" size="small" onClick={handleApplyCustomDate}>
                  Apply
                </ActionButton>
              </Box>
            }
          >
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, py: 1 }}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}
                >
                  Start Date
                </Typography>
                <CalendarPicker
                  value={customStartDate}
                  onChange={(date) => setCustomStartDate(date)}
                  minWidth="100%"
                />
              </Box>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                <Typography
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary' }}
                >
                  End Date
                </Typography>
                <CalendarPicker
                  value={customEndDate}
                  onChange={(date) => setCustomEndDate(date)}
                  minWidth="100%"
                />
              </Box>
            </Box>
          </Modal>

          {/* Export Data Button - visible on all responsive devices up to 1050px (mobile + tablet) */}
          <ButtonBase
            onClick={handleExport}
            sx={{
              display: 'inline-flex',
              '@media (min-width: 1051px)': {
                display: 'none',
              },
              px: { xs: 1.25, sm: 1.75 },
              py: 0.85,
              borderRadius: '8px',
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(79, 70, 229, 0.2)' : '#EEF2FF',
              color: '#4F46E5',
              fontSize: '0.8125rem',
              fontWeight: 600,
              alignItems: 'center',
              gap: 0.75,
              border: '1px solid',
              borderColor: (theme) =>
                theme.palette.mode === 'dark' ? 'rgba(79, 70, 229, 0.3)' : '#E0E7FF',
              transition: 'background-color 0.15s ease',
              '&:hover': {
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(79, 70, 229, 0.3)' : '#E0E7FF',
              },
            }}
          >
            <DescriptionOutlinedIcon sx={{ fontSize: 18, color: '#4F46E5' }} />
            Export Data
          </ButtonBase>

          {/* Refresh Button - visible above 1050px on desktop */}
          <ButtonBase
            onClick={handleRefresh}
            sx={{
              display: 'none',
              '@media (min-width: 1051px)': {
                display: 'inline-flex',
              },
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

      {/* 2. Top 4 Stat Cards */}
      {/* 2x2 grid up to 1050px; 4 columns on desktop above 1050px */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(2, 1fr)' },
          gap: { xs: 1.5, sm: 2, md: 2.5 },
          order: 2,
          '@media (min-width: 1051px)': {
            gridTemplateColumns: 'repeat(4, 1fr)',
            order: 1,
          },
        }}
      >
        {BRANCH_STAT_CARDS.map((stat) => (
          <DashboardStatCard key={stat.id} stat={stat} />
        ))}
      </Box>

      {/* 3. Middle Row: 3 Visual Analysis Cards */}
      {/* Desktop > 1050px: 3 cards in 1 row (1.2fr 1fr 1fr) */}
      {/* Tablet & <= 1050px: Card 1 spans full width, Card 2 and Card 3 are 2 columns side-by-side */}
      {/* Mobile: All 3 cards stacked (1 column) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)' },
          gap: { xs: 2, sm: 2.5 },
          order: 3,
          '@media (min-width: 1051px)': {
            gridTemplateColumns: '1.2fr 1fr 1fr',
          },
        }}
      >
        {/* Card 1: Channel Orders Chart (Sales) */}
        <Card
          variant="outlined"
          padding={3}
          sx={{
            gridColumn: { xs: '1 / -1', sm: '1 / -1' },
            '@media (min-width: 1051px)': {
              gridColumn: 'auto',
            },
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
                onClick={(e) => setChartMenuAnchor(e.currentTarget)}
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
                {chartPeriod}
                <KeyboardArrowDownIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
              </ButtonBase>
              <Menu
                anchorEl={chartMenuAnchor}
                open={Boolean(chartMenuAnchor)}
                onClose={() => setChartMenuAnchor(null)}
                slotProps={{ paper: { sx: { borderRadius: '8px', minWidth: 140 } } }}
              >
                {MOCK_PERIOD_OPTIONS.map((p) => (
                  <MenuItem
                    key={p}
                    selected={p === chartPeriod}
                    onClick={() => {
                      setChartPeriod(p);
                      setChartMenuAnchor(null);
                    }}
                    sx={{ fontSize: '0.75rem' }}
                  >
                    {p}
                  </MenuItem>
                ))}
              </Menu>
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
              onClick={(e) => setOnlineMenuAnchor(e.currentTarget)}
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
              {onlinePeriod}
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
            </ButtonBase>
            <Menu
              anchorEl={onlineMenuAnchor}
              open={Boolean(onlineMenuAnchor)}
              onClose={() => setOnlineMenuAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: '8px', minWidth: 140 } } }}
            >
              {MOCK_PERIOD_OPTIONS.map((p) => (
                <MenuItem
                  key={p}
                  selected={p === onlinePeriod}
                  onClick={() => {
                    setOnlinePeriod(p);
                    setOnlineMenuAnchor(null);
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {p}
                </MenuItem>
              ))}
            </Menu>
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

      {/* 4. Channel Summary Cards (Dine In, Take Away, Delivery) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)', md: 'repeat(3, 1fr)' },
          gap: { xs: 2, sm: 2.5 },
          order: 4,
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
              gap: 1.25,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    width: 32,
                    height: 32,
                    borderRadius: '8px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? `${channel.color}26` : channel.bgColor,
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
                <Typography
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.primary',
                  }}
                >
                  {channel.title}
                </Typography>
              </Box>
              <MoreHorizIcon
                sx={{
                  display: 'block',
                  fontSize: 18,
                  color: colors.text.secondary,
                }}
              />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '1.25rem', sm: '1.5rem' },
                fontWeight: 700,
                color: 'text.primary',
              }}
            >
              {channel.amount}
            </Typography>
            <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
              {channel.orders}
            </Typography>
          </Card>
        ))}
      </Box>

      {/* 5. Bottom Row: Today's Expenses + Leakage + Quick Help */}
      {/* Desktop: 3 columns (1fr 1fr 1fr) */}
      {/* Tablet: 2 columns (Left: Expenses spanning 2 rows, Right: Leakage and Quick Help stacked) */}
      {/* Mobile: 1 column stacked */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
          gap: { xs: 2, sm: 2.5 },
          alignItems: 'start',
          order: 5,
          '@media (min-width: 1051px)': {
            gridTemplateColumns: '1fr 1fr 1fr',
          },
        }}
      >
        {/* Branch Expenses */}
        <Card
          variant="outlined"
          padding={3}
          sx={{
            gridColumn: { xs: '1', sm: '1' },
            gridRow: { xs: 'auto', sm: '1 / span 2' },
            '@media (min-width: 1051px)': {
              gridColumn: 'auto',
              gridRow: 'auto',
            },
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
              onClick={(e) => setExpensesMenuAnchor(e.currentTarget)}
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
              {expensesPeriod}
              <KeyboardArrowDownIcon sx={{ fontSize: 16, color: colors.text.secondary }} />
            </ButtonBase>
            <Menu
              anchorEl={expensesMenuAnchor}
              open={Boolean(expensesMenuAnchor)}
              onClose={() => setExpensesMenuAnchor(null)}
              slotProps={{ paper: { sx: { borderRadius: '8px', minWidth: 140 } } }}
            >
              {MOCK_PERIOD_OPTIONS.map((p) => (
                <MenuItem
                  key={p}
                  selected={p === expensesPeriod}
                  onClick={() => {
                    setExpensesPeriod(p);
                    setExpensesMenuAnchor(null);
                  }}
                  sx={{ fontSize: '0.75rem' }}
                >
                  {p}
                </MenuItem>
              ))}
            </Menu>
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
            gridColumn: { xs: '1', sm: '2' },
            gridRow: { xs: 'auto', sm: '1' },
            '@media (min-width: 1051px)': {
              gridColumn: 'auto',
              gridRow: 'auto',
            },
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
        <Box
          sx={{
            gridColumn: { xs: '1', sm: '2' },
            gridRow: { xs: 'auto', sm: '2' },
            height: '100%',
            '@media (min-width: 1051px)': {
              gridColumn: 'auto',
              gridRow: 'auto',
            },
          }}
        >
          <QuickHelpCard
            idLabel="Outlet ID: 63284"
            showPocBadge
            statusText="Online"
            description="Your dedicated account manager for all operational support and billing queries. Reach out anytime during working hours."
            availableHours="Available 10:00 AM – 07:00 PM"
          />
        </Box>
      </Box>
    </Box>
  );
}
