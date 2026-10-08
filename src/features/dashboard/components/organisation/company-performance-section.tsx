'use client';

import { useMemo } from 'react';
import { Box, Button, Card, IconButton, Stack, Typography } from '@mui/material';
import { BarChart3, ChevronDown, LayoutList } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import type {
  OrganisationCompanyChartPoint,
  OrganisationCompanyPerformanceRow,
  OrganisationDashboardViewMode,
  OrganisationDateRangeId,
  OrganisationPerformanceMetricId,
} from '@/features/dashboard/types/organisation-dashboard';

import {
  CompanyPerformanceChart,
  CompanyPerformancePagination,
  CompanyPerformanceTable,
} from './company-performance-parts';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type CompanyPerformanceSectionProps = Readonly<{
  dateRangeLabel: string;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  dateMenuOpen: boolean;
  dateMenuRef: React.RefObject<HTMLDivElement | null>;
  onDateMenuToggle: () => void;
  onPresetRangeChange: (range: PresetRangeId) => void;
  onCustomRangeApply: (from: string, to: string) => void;
  activeMetric: OrganisationPerformanceMetricId;
  activeMetricLabel: string;
  viewMode: OrganisationDashboardViewMode;
  metricMenuOpen: boolean;
  metricMenuRef: React.RefObject<HTMLDivElement | null>;
  companySeries: readonly OrganisationCompanyChartPoint[];
  allPerformanceRows: readonly OrganisationCompanyPerformanceRow[];
  performanceRows: readonly OrganisationCompanyPerformanceRow[];
  maxChartValue: number;
  currentPage: number;
  totalPages: number;
  onMetricMenuToggle: () => void;
  onMetricChange: (metric: OrganisationPerformanceMetricId) => void;
  onViewChange: (view: OrganisationDashboardViewMode) => void;
  onCompareCompanies: () => void;
  onPageChange: (page: number) => void;
}>;

export function CompanyPerformanceSection({
  activeMetric,
  activeMetricLabel,
  viewMode,
  metricMenuOpen,
  metricMenuRef,
  companySeries,
  allPerformanceRows,
  performanceRows,
  maxChartValue,
  currentPage,
  totalPages,
  onMetricMenuToggle,
  onMetricChange,
  onViewChange,
  onPageChange,
}: CompanyPerformanceSectionProps) {
  const rowsById = useMemo(
    () => new Map(allPerformanceRows.map((row) => [row.id, row])),
    [allPerformanceRows],
  );

  return (
    <Card
      variant="outlined"
      id="company-performance"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 2, sm: '1.25rem 1.5rem' },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        overflow: 'visible',
      }}
    >
      <Typography
        sx={{
          fontSize: '0.75rem',
          fontWeight: 700,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: 'text.secondary',
          mb: 1.5,
        }}
      >
        {organisationDashboardCopy.companyPerformanceTitle}
      </Typography>

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
        <Box sx={{ position: 'relative' }} ref={metricMenuRef}>
          <Button
            type="button"
            variant="outlined"
            size="small"
            endIcon={<ChevronDown size={14} />}
            onClick={onMetricMenuToggle}
            sx={{
              textTransform: 'none',
              fontSize: '0.8125rem',
              fontWeight: 600,
              color: 'text.primary',
              borderColor: 'divider',
              borderRadius: '0.5rem',
              px: 1.5,
              py: 0.5,
            }}
          >
            {activeMetricLabel}
          </Button>

          {metricMenuOpen ? (
            <Card
              elevation={4}
              sx={{
                position: 'absolute',
                top: 'calc(100% + 4px)',
                left: 0,
                zIndex: 1300,
                minWidth: 160,
                p: 0.5,
                borderRadius: '0.5rem',
                border: 1,
                borderColor: 'divider',
                bgcolor: 'background.paper',
              }}
              role="listbox"
            >
              <Stack spacing={0.25}>
                {organisationDashboardCopy.metricOptions.map((option) => (
                  <Box
                    component="button"
                    key={option.id}
                    type="button"
                    role="option"
                    aria-selected={activeMetric === option.id}
                    onClick={() => {
                      onMetricChange(option.id);
                      onMetricMenuToggle();
                    }}
                    sx={{
                      width: '100%',
                      textAlign: 'left',
                      px: 1.5,
                      py: 0.75,
                      borderRadius: '0.375rem',
                      fontSize: '0.8125rem',
                      fontWeight: activeMetric === option.id ? 600 : 400,
                      color: activeMetric === option.id ? 'primary.main' : 'text.primary',
                      bgcolor: activeMetric === option.id ? 'action.selected' : 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: 'action.hover',
                      },
                    }}
                  >
                    {option.label}
                  </Box>
                ))}
              </Stack>
            </Card>
          ) : null}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
          <IconButton
            size="small"
            onClick={() => onViewChange('chart')}
            aria-label="Chart view"
            aria-pressed={viewMode === 'chart'}
            sx={{
              borderRadius: '0.375rem',
              bgcolor: viewMode === 'chart' ? 'action.selected' : 'transparent',
              color: viewMode === 'chart' ? 'primary.main' : 'text.secondary',
              border: 1,
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <BarChart3 size={16} aria-hidden />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => onViewChange('list')}
            aria-label="List view"
            aria-pressed={viewMode === 'list'}
            sx={{
              borderRadius: '0.375rem',
              bgcolor: viewMode === 'list' ? 'action.selected' : 'transparent',
              color: viewMode === 'list' ? 'primary.main' : 'text.secondary',
              border: 1,
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'action.hover',
              },
            }}
          >
            <LayoutList size={16} aria-hidden />
          </IconButton>
        </Box>
      </Box>

      {viewMode === 'chart' ? (
        <CompanyPerformanceChart
          series={companySeries}
          rowsById={rowsById}
          maxValue={maxChartValue}
          metricLabel={activeMetricLabel}
          metric={activeMetric}
        />
      ) : (
        <>
          <CompanyPerformanceTable rows={performanceRows} />
          <CompanyPerformancePagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={onPageChange}
          />
        </>
      )}
    </Card>
  );
}
