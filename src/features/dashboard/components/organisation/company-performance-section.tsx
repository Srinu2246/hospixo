import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { BarChart3, ChevronDown, LayoutList } from 'lucide-react';
import { useMemo } from 'react';

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
import { OrganisationDateRangePicker } from './shared/organisation-date-range-picker';

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
  dateRangeLabel,
  activeRange,
  customFrom,
  customTo,
  dateMenuOpen,
  dateMenuRef,
  onDateMenuToggle,
  onPresetRangeChange,
  onCustomRangeApply,
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
  onCompareCompanies,
  onPageChange,
}: CompanyPerformanceSectionProps) {
  const rowsById = useMemo(
    () => new Map(allPerformanceRows.map((row) => [row.id, row])),
    [allPerformanceRows],
  );

  return (
    <section className={orgDash.surfaceCard} id="company-performance">
      <p className={orgDash.perfMutedtitle}>{organisationDashboardCopy.companyPerformanceTitle}</p>
      <div className={orgDash.perfSectionheader}>
        <div className={orgDash.perfMetricselectwrap} ref={metricMenuRef}>
          <div className={orgDash.perfMetricselectbutton}>{activeMetricLabel}</div>
          {metricMenuOpen ? (
            <div className={orgDash.perfMetricmenu} role="listbox">
              {organisationDashboardCopy.metricOptions.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={activeMetric === option.id}
                  className={
                    activeMetric === option.id
                      ? orgDash.perfMetricmenuitemactive
                      : orgDash.perfMetricmenuitem
                  }
                  onClick={() => onMetricChange(option.id)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className={orgDash.perfToolbar}>
          <div className={orgDash.perfViewtoggle}>
            <button
              type="button"
              className={
                viewMode === 'chart' ? orgDash.perfIconbuttonactive : orgDash.perfIconbutton
              }
              aria-label="Chart view"
              aria-pressed={viewMode === 'chart'}
              onClick={() => onViewChange('chart')}
            >
              <BarChart3 className={orgDash.perfActionicon} aria-hidden />
            </button>
            <button
              type="button"
              className={
                viewMode === 'list' ? orgDash.perfIconbuttonactive : orgDash.perfIconbutton
              }
              aria-label="List view"
              aria-pressed={viewMode === 'list'}
              onClick={() => onViewChange('list')}
            >
              <LayoutList className={orgDash.perfActionicon} aria-hidden />
            </button>
          </div>
        </div>
      </div>

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
    </section>
  );
}
