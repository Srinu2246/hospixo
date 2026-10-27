'use client';

import React, { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import TakeoutDiningIcon from '@mui/icons-material/TakeoutDining';
import DeliveryDiningIcon from '@mui/icons-material/DeliveryDining';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import ScheduleOutlinedIcon from '@mui/icons-material/ScheduleOutlined';

import { Card } from '@/components/shared/ui/Card';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { AlertMessage } from '@/components/shared/ui/AlertMessage';
import { Loading } from '@/components/shared/ui/Loading';
import { colors } from '@/lib/theme/mui/colors';
import { useBranchDashboard } from '@/lib/hooks/dashboard/useBranchDashboard';
import { useSidebarStore } from '@/stores/sidebarStore';
import { useToastStore } from '@/stores/toastStore';
import { DateRangeOption, PeriodOption } from '@/features/dashboard/enums';
import { dateRangeDatesFromOption } from '@/lib/helpers/dashboardDateRangeHelpers';
import { createDefaultReportsDateRange, formatIsoDate } from '@/lib/helpers/reportsOverview';
import {
  BRANCH_STAT_CARDS,
  BRANCH_PAYMENT_MODES,
  BRANCH_CHANNEL_CARDS,
  MOCK_PERIOD_OPTIONS,
} from '@/lib/mocks/dashboard/dashboard.mocks';
import { DashboardDateRangeDropdown } from '../shared/DashboardDateRangeDropdown';
import { DashboardStatCard } from '../shared/DashboardStatCard';

export interface BranchSalesDashboardProps {
  onExportClick?: () => void;
}

interface BranchPeriodSelectorProps {
  value: PeriodOption;
  onChange: (value: PeriodOption) => void;
}

function BranchPeriodSelector({ value, onChange }: Readonly<BranchPeriodSelectorProps>) {
  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  return (
    <>
      <ButtonBase
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{
          px: 1.25,
          py: 0.5,
          borderRadius: '8px',
          border: '1px solid',
          borderColor: (theme) =>
            theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
          bgcolor: (theme) => (theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF'),
          fontSize: '0.8125rem',
          fontWeight: 600,
          color: 'text.primary',
          display: 'flex',
          alignItems: 'center',
          gap: 0.5,
        }}
      >
        {value}
        <KeyboardArrowDownIcon sx={{ fontSize: 18, color: colors.text.secondary }} />
      </ButtonBase>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { borderRadius: '8px', minWidth: 140 } } }}
      >
        {MOCK_PERIOD_OPTIONS.map((p) => (
          <MenuItem
            key={p}
            selected={p === value}
            onClick={() => {
              onChange(p);
              setAnchorEl(null);
            }}
            sx={{ fontSize: '0.8125rem' }}
          >
            {p}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
}

function BranchSectionHeader({
  title,
  dateFrom,
  dateTo,
  activeDatePreset,
  onDateRangeChange,
  onDatePresetSelect,
  trailing,
}: Readonly<{
  title: string;
  dateFrom: Date;
  dateTo: Date;
  activeDatePreset: DateRangeOption | null;
  onDateRangeChange: (range: { dateFrom: Date; dateTo: Date }) => void;
  onDatePresetSelect: (preset: DateRangeOption) => void;
  trailing: React.ReactNode;
}>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: 2,
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
        {title}
      </Typography>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <DashboardDateRangeDropdown
          dateFrom={dateFrom}
          dateTo={dateTo}
          activeDatePreset={activeDatePreset}
          onDateRangeChange={onDateRangeChange}
          onDatePresetSelect={onDatePresetSelect}
        />
        {trailing}
      </Box>
    </Box>
  );
}

const cardSurfaceSx = {
  borderRadius: '12px',
  borderColor: (theme: { palette: { mode: string; divider: string } }) =>
    theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
  bgcolor: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
  boxShadow: (theme: { palette: { mode: string } }) =>
    theme.palette.mode === 'dark' ? 'none' : '0 1px 3px rgba(15, 23, 42, 0.06)',
};

export function BranchSalesDashboard({ onExportClick }: Readonly<BranchSalesDashboardProps> = {}) {
  const defaultDateRange = useMemo(() => createDefaultReportsDateRange(), []);
  const [dateFrom, setDateFrom] = useState(defaultDateRange.dateFrom);
  const [dateTo, setDateTo] = useState(defaultDateRange.dateTo);
  const [activeDatePreset, setActiveDatePreset] = useState<DateRangeOption | null>(
    DateRangeOption.LAST_7_DAYS,
  );

  const handleBranchDateRangeChange = (range: { dateFrom: Date; dateTo: Date }) => {
    setDateFrom(range.dateFrom);
    setDateTo(range.dateTo);
    setActiveDatePreset(DateRangeOption.CUSTOM_RANGE);
  };

  const handleBranchDatePreset = (preset: DateRangeOption) => {
    if (preset === DateRangeOption.CUSTOM_RANGE) {
      setActiveDatePreset(preset);
      return;
    }
    const next = dateRangeDatesFromOption(preset);
    setDateFrom(next.dateFrom);
    setDateTo(next.dateTo);
    setActiveDatePreset(preset);
  };

  const branchId = useSidebarStore((state) => state.account?.branch_id ?? undefined);
  const dashboard = useBranchDashboard(branchId, {
    startDate: formatIsoDate(dateFrom),
    endDate: formatIsoDate(dateTo),
  });
  const data = dashboard.data;
  const [chartPeriod, setChartPeriod] = useState<PeriodOption>(PeriodOption.TODAY);
  const [onlinePeriod, setOnlinePeriod] = useState<PeriodOption>(PeriodOption.TODAY);

  const formatAmount = (value: string): string => {
    const numericValue = Number(value.replace(/[^\d.-]/g, ''));
    if (!Number.isFinite(numericValue)) return value;
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(numericValue);
  };

  const amountAsNumber = (value: string): number => {
    const numericValue = Number(value.replace(/[^\d.-]/g, ''));
    return Number.isFinite(numericValue) ? numericValue : 0;
  };

  const formatPercent = (value: number): string =>
    `${value > 0 ? '+' : ''}${new Intl.NumberFormat('en-IN', { maximumFractionDigits: 1 }).format(value)}%`;

  const statCards = data
    ? BRANCH_STAT_CARDS.map((stat) => {
        const metric = {
          'br-sales': {
            value: data.summary.total_sales,
            change: data.summary.total_sales_change_percent,
          },
          'br-net': {
            value: data.summary.net_sales,
            change: data.summary.net_sales_change_percent,
          },
          'br-online': { value: data.summary.online_sales },
          'br-offline': {
            value: data.summary.offline_sales,
            change: data.summary.offline_sales_change_percent,
          },
        }[stat.id];
        if (!metric) return stat;
        return {
          ...stat,
          value: formatAmount(metric.value),
          trend:
            metric.change === undefined
              ? undefined
              : {
                  value: formatPercent(metric.change),
                  isPositive: metric.change >= 0,
                  periodText: 'vs previous period',
                },
        };
      })
    : BRANCH_STAT_CARDS;

  const salesByType = data?.sales_statistics.by_order_type ?? [];
  const maxOrderTypeSales = Math.max(...salesByType.map((item) => amountAsNumber(item.sales)), 1);
  const paymentItems = data
    ? [
        { label: 'Cash', amount: data.payment_breakdown.cash, color: '#3B82F6' },
        { label: 'Card', amount: data.payment_breakdown.card, color: '#8B5CF6' },
        { label: 'UPI', amount: data.payment_breakdown.upi, color: '#10B981' },
        { label: 'Other', amount: data.payment_breakdown.other, color: '#F59E0B' },
      ]
    : BRANCH_PAYMENT_MODES;
  const paymentTotal = data
    ? amountAsNumber(data.payment_breakdown.total)
    : paymentItems.reduce((sum, item) => sum + amountAsNumber(item.amount), 0);
  const channelCards = data
    ? salesByType.map((item, index) => {
        const normalizedType = item.order_type.toLowerCase().replaceAll('_', '-');
        const channelId = normalizedType === 'takeaway' ? 'take-away' : normalizedType;
        const fallback = BRANCH_CHANNEL_CARDS.find((channel) => channel.id === channelId);
        const color = fallback?.color ?? ['#3B82F6', '#10B981', '#F97316'][index % 3];
        return {
          id: item.order_type,
          title: item.order_type
            .replaceAll('_', ' ')
            .replace(/\b\w/g, (letter) => letter.toUpperCase()),
          amount: formatAmount(item.sales),
          orders: `${item.orders} Orders`,
          icon: fallback?.icon ?? ('dine-in' as const),
          color,
          bgColor: fallback?.bgColor ?? '#EFF6FF',
        };
      })
    : BRANCH_CHANNEL_CARDS;

  const handleExport = () => {
    if (onExportClick) {
      onExportClick();
    } else {
      useToastStore.getState().show('Exporting sales statistics data to CSV/Excel...', 'info');
    }
  };

  const handleRefresh = () => {
    void dashboard.refetch();
  };

  if (typeof branchId !== 'number') {
    return (
      <AlertMessage
        variant="warning"
        title="Branch required"
        message="Select a branch before viewing dashboard metrics."
      />
    );
  }

  if (dashboard.isLoading)
    return <Loading message="Loading branch dashboard..." fullPage={false} />;

  if (dashboard.isError) {
    return (
      <AlertMessage
        variant="error"
        title="Unable to load dashboard"
        message={
          dashboard.error instanceof Error
            ? dashboard.error.message
            : 'The dashboard request failed.'
        }
      />
    );
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: { xs: 2.5, sm: 3 },
        width: '100%',
        pb: 4,
      }}
    >
      {/* Top: title, date range, export + summary stat cards */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
        <BranchSectionHeader
          title="Sales Statistics"
          dateFrom={dateFrom}
          dateTo={dateTo}
          activeDatePreset={activeDatePreset}
          onDateRangeChange={handleBranchDateRangeChange}
          onDatePresetSelect={handleBranchDatePreset}
          trailing={
            <ActionButton
              variant="outlined"
              size="medium"
              startIcon={<FileDownloadOutlinedIcon sx={{ fontSize: 18 }} />}
              onClick={handleExport}
              sx={{
                borderRadius: '8px',
                fontSize: '0.8125rem',
                fontWeight: 600,
                px: 2,
                py: 0.85,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.1)' : '#EFF6FF',
                color: '#1D4ED8',
                border: '1px solid',
                borderColor: '#93C5FD',
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.2)' : '#DBEAFE',
                  borderColor: '#60A5FA',
                },
              }}
            >
              Export Data
            </ActionButton>
          }
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' },
            gap: { xs: 1.5, sm: 2 },
          }}
        >
          {statCards.map((stat) => (
            <DashboardStatCard key={stat.id} stat={stat} />
          ))}
        </Box>
      </Box>

      {/* Charts section */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 2, sm: 2.5 } }}>
        <BranchSectionHeader
          title="Sales Statistics"
          dateFrom={dateFrom}
          dateTo={dateTo}
          activeDatePreset={activeDatePreset}
          onDateRangeChange={handleBranchDateRangeChange}
          onDatePresetSelect={handleBranchDatePreset}
          trailing={
            <IconButton
              aria-label="Refresh sales statistics"
              onClick={handleRefresh}
              sx={{
                width: 40,
                height: 40,
                borderRadius: '8px',
                border: '1px solid',
                borderColor: (theme) =>
                  theme.palette.mode === 'dark' ? theme.palette.divider : colors.border.default,
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? colors.surface.dark : '#FFFFFF',
                color: colors.text.secondary,
                '&:hover': {
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : colors.surface.muted,
                },
              }}
            >
              <RefreshIcon sx={{ fontSize: 20 }} />
            </IconButton>
          }
        />

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.15fr 1fr 1fr' },
            gap: { xs: 2, sm: 2.5 },
          }}
        >
          {/* Sales bar chart */}
          <Card
            variant="outlined"
            padding={3}
            sx={{ ...cardSurfaceSx, display: 'flex', flexDirection: 'column', gap: 2 }}
          >
            <Box
              sx={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 1.5,
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: '#1B59F8' }} />
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                  Sales
                </Typography>
              </Box>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap' }}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-end',
                    lineHeight: 1.35,
                  }}
                >
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                    Total Orders:{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {data?.sales_statistics.total_orders ?? 0}
                    </Box>
                  </Typography>
                  <Typography sx={{ fontSize: '0.75rem', color: colors.text.secondary }}>
                    Total Sales:{' '}
                    <Box component="span" sx={{ fontWeight: 700, color: 'text.primary' }}>
                      {formatAmount(data?.sales_statistics.total_sales ?? '0')}
                    </Box>
                  </Typography>
                </Box>
                <BranchPeriodSelector value={chartPeriod} onChange={setChartPeriod} />
              </Box>
            </Box>

            <Box sx={{ display: 'flex', gap: 1.5, height: 180, pt: 0.5, alignItems: 'stretch' }}>
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
                {[1, 0.67, 0.33, 0].map((ratio) => (
                  <Typography
                    key={ratio}
                    sx={{ fontSize: '0.6875rem', color: colors.text.secondary, fontWeight: 500 }}
                  >
                    {new Intl.NumberFormat('en-IN', {
                      notation: 'compact',
                      maximumFractionDigits: 1,
                    }).format(maxOrderTypeSales * ratio)}
                  </Typography>
                ))}
              </Box>

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
                          theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
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
                  {salesByType.map((item, index) => (
                    <Box
                      key={item.order_type}
                      title={`${item.order_type}: ${formatAmount(item.sales)} (${item.orders} orders)`}
                      sx={{
                        width: `${Math.min(72 / Math.max(salesByType.length, 1), 22)}%`,
                        height: `${(amountAsNumber(item.sales) / maxOrderTypeSales) * 100}%`,
                        minHeight: amountAsNumber(item.sales) > 0 ? 2 : 0,
                        borderRadius: '6px 6px 0 0',
                        bgcolor: ['#BFDBFE', '#34D399', '#FB7185', '#FBBF24'][index % 4],
                      }}
                    />
                  ))}
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2.5 }}>
              {salesByType.map((item, index) => (
                <Box
                  key={item.order_type}
                  sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}
                >
                  <Box
                    sx={{
                      width: 10,
                      height: 10,
                      borderRadius: '2px',
                      bgcolor: ['#BFDBFE', '#34D399', '#FB7185', '#FBBF24'][index % 4],
                    }}
                  />
                  <Typography
                    sx={{ fontSize: '0.75rem', color: colors.text.secondary, fontWeight: 500 }}
                  >
                    {item.order_type
                      .replaceAll('_', ' ')
                      .replace(/\b\w/g, (letter) => letter.toUpperCase())}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Payment breakdown */}
          <Card
            variant="outlined"
            padding={3}
            sx={{
              ...cardSurfaceSx,
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
                    width: 28,
                    height: 28,
                    borderRadius: '8px',
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
                {formatAmount(data?.payment_breakdown.total ?? String(paymentTotal))}
              </Typography>
            </Box>

            <Box
              sx={{
                display: 'flex',
                width: '100%',
                height: 10,
                borderRadius: '5px',
                overflow: 'hidden',
                bgcolor: (theme) =>
                  theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.06)' : '#F1F5F9',
              }}
            >
              {paymentItems.map((item) => (
                <Box
                  key={item.label}
                  sx={{
                    width: `${paymentTotal > 0 ? (amountAsNumber(item.amount) / paymentTotal) * 100 : 0}%`,
                    height: '100%',
                    bgcolor: item.color,
                  }}
                />
              ))}
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25 }}>
              {paymentItems.map((p) => (
                <Box
                  key={p.label}
                  sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: p.color }} />
                    <Typography sx={{ fontSize: '0.8125rem', color: colors.text.secondary }}>
                      {p.label}
                    </Typography>
                  </Box>
                  <Typography
                    sx={{ fontSize: '0.8125rem', fontWeight: 700, color: 'text.primary' }}
                  >
                    {formatAmount(p.amount)}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Card>

          {/* Online orders */}
          <Card
            variant="outlined"
            padding={3}
            sx={{
              ...cardSurfaceSx,
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
              minHeight: 280,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: '0.9375rem', fontWeight: 700, color: 'text.primary' }}>
                Online orders
              </Typography>
              <BranchPeriodSelector value={onlinePeriod} onChange={setOnlinePeriod} />
            </Box>

            <Box
              sx={{
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                gap: 1.5,
                py: 2,
                px: 1,
              }}
            >
              <Box
                sx={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  bgcolor: (theme) =>
                    theme.palette.mode === 'dark' ? 'rgba(27, 89, 248, 0.15)' : '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1B59F8',
                }}
              >
                <ScheduleOutlinedIcon sx={{ fontSize: 28 }} />
              </Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                {formatAmount(data?.online_orders ?? '0')}
              </Typography>
              <Typography
                sx={{
                  fontSize: '0.8125rem',
                  color: colors.text.secondary,
                  maxWidth: 260,
                  lineHeight: 1.5,
                }}
              >
                Total value of online orders for the selected business dates.
              </Typography>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Channel summary */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: 'repeat(3, 1fr)' },
          gap: { xs: 2, sm: 2.5 },
        }}
      >
        {channelCards.map((channel) => (
          <Card
            key={channel.title}
            variant="outlined"
            padding={2.5}
            sx={{
              ...cardSurfaceSx,
              display: 'flex',
              flexDirection: 'column',
              gap: 1.25,
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    display: 'flex',
                    width: 36,
                    height: 36,
                    borderRadius: '10px',
                    bgcolor: (theme) =>
                      theme.palette.mode === 'dark' ? `${channel.color}26` : channel.bgColor,
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  {channel.icon === 'dine-in' && (
                    <RestaurantIcon sx={{ fontSize: 20, color: channel.color }} />
                  )}
                  {channel.icon === 'take-away' && (
                    <TakeoutDiningIcon sx={{ fontSize: 20, color: channel.color }} />
                  )}
                  {channel.icon === 'delivery' && (
                    <DeliveryDiningIcon sx={{ fontSize: 20, color: channel.color }} />
                  )}
                </Box>
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 600, color: 'text.primary' }}>
                  {channel.title}
                </Typography>
              </Box>
              <MoreHorizIcon sx={{ fontSize: 20, color: colors.text.secondary }} />
            </Box>
            <Typography
              sx={{
                fontSize: { xs: '1.375rem', sm: '1.5rem' },
                fontWeight: 700,
                color: 'text.primary',
                letterSpacing: '-0.02em',
              }}
            >
              {channel.amount}
            </Typography>
            <Typography
              sx={{ fontSize: '0.8125rem', color: colors.text.secondary, fontWeight: 500 }}
            >
              {channel.orders}
            </Typography>
          </Card>
        ))}
      </Box>
    </Box>
  );
}
