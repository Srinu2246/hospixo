'use client';

import { Box, IconButton, Typography } from '@mui/material';
import { RefreshCw } from 'lucide-react';

import { OrganisationDateRangePicker } from '@/features/dashboard/components/organisation/shared/organisation-date-range-picker';
import { branchDashboardCopy } from '@/features/dashboard/config/branch/dashboard';
import type {
  BranchDashboardDisplayData,
  BranchDashboardPeriod,
} from '@/features/dashboard/types/branch-dashboard';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

import { OnlineOrdersCard } from '../online-orders/online-orders-card';
import { SalesByOrderTypeChart } from '../sales-by-order-type/sales-by-order-type-chart';
import { TotalSalesBreakdownCard } from '../total-sales-breakdown/total-sales-breakdown-card';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type SalesStatisticsSectionProps = Readonly<{
  data: BranchDashboardDisplayData;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  dateMenuOpen: boolean;
  dateMenuRef: React.RefObject<HTMLDivElement | null>;
  salesPeriod: BranchDashboardPeriod;
  onlineOrdersPeriod: BranchDashboardPeriod;
  onDateMenuToggle: () => void;
  onPresetRangeChange: (range: PresetRangeId) => void;
  onCustomRangeApply: (from: string, to: string) => void;
  onSalesPeriodChange: (period: BranchDashboardPeriod) => void;
  onOnlineOrdersPeriodChange: (period: BranchDashboardPeriod) => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}>;

export function SalesStatisticsSection({
  data,
  activeRange,
  customFrom,
  customTo,
  dateMenuOpen,
  dateMenuRef,
  salesPeriod,
  onlineOrdersPeriod,
  onDateMenuToggle,
  onPresetRangeChange,
  onCustomRangeApply,
  onSalesPeriodChange,
  onOnlineOrdersPeriodChange,
  onRefresh,
  isRefreshing = false,
}: SalesStatisticsSectionProps) {
  return (
    <Box component="section" id="sales-statistics" aria-busy={isRefreshing}>
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
        <Typography
          variant="subtitle1"
          sx={{
            fontWeight: 700,
            color: 'text.primary',
          }}
        >
          {branchDashboardCopy.salesStatisticsTitle}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <OrganisationDateRangePicker
            label={data.dateRangeLabel}
            activeRange={activeRange}
            customFrom={customFrom}
            customTo={customTo}
            isOpen={dateMenuOpen}
            menuRef={dateMenuRef}
            onToggle={onDateMenuToggle}
            onSelectPreset={onPresetRangeChange}
            onApplyCustom={onCustomRangeApply}
          />
          <IconButton
            size="small"
            onClick={onRefresh}
            disabled={isRefreshing}
            aria-label={branchDashboardCopy.refreshAriaLabel}
            sx={{
              borderRadius: '0.5rem',
              border: 1,
              borderColor: 'divider',
              p: 0.75,
              animation: isRefreshing ? 'spin 1s linear infinite' : 'none',
              '@keyframes spin': {
                '0%': { transform: 'rotate(0deg)' },
                '100%': { transform: 'rotate(360deg)' },
              },
            }}
          >
            <RefreshCw size={16} aria-hidden />
          </IconButton>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', lg: '1.2fr 1fr 1fr' },
          gap: 2,
          opacity: isRefreshing ? 0.6 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        <SalesByOrderTypeChart
          rows={data.salesByOrderType}
          summary={data.salesSummary}
          period={salesPeriod}
          onPeriodChange={onSalesPeriodChange}
        />
        <TotalSalesBreakdownCard breakdown={data.paymentBreakdown} />
        <OnlineOrdersCard
          onlineOrders={data.onlineOrders}
          period={onlineOrdersPeriod}
          onPeriodChange={onOnlineOrdersPeriodChange}
        />
      </Box>
    </Box>
  );
}
