'use client';

import { DashboardPageHeader } from '@/features/dashboard/components/shared/dashboard-page-header';
import { exportCompanyDashboardCsv } from '@/features/dashboard/utils/export-company-dashboard-csv';
import { companyLandingContent } from '@/features/dashboard/config/company';
import type { CompanyDashboardDisplayData } from '@/features/dashboard/lib/build-company-dashboard-data';
import type { OrganisationDateRangeId } from '@/features/dashboard/types/organisation-dashboard';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type CompanyDashboardHeaderProps = Readonly<{
  data: CompanyDashboardDisplayData;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  dateMenuOpen: boolean;
  dateMenuRef: React.RefObject<HTMLDivElement | null>;
  onDateMenuToggle: () => void;
  onPresetRangeChange: (range: PresetRangeId) => void;
  onCustomRangeApply: (from: string, to: string) => void;
}>;

export function CompanyDashboardHeader({
  data,
  activeRange,
  customFrom,
  customTo,
  dateMenuOpen,
  dateMenuRef,
  onDateMenuToggle,
  onPresetRangeChange,
  onCustomRangeApply,
}: CompanyDashboardHeaderProps) {
  const { title, exportButton } = companyLandingContent.header;

  return (
    <DashboardPageHeader
      title={title}
      dateRangeLabel={data.dateRangeLabel}
      activeRange={activeRange}
      customFrom={customFrom}
      customTo={customTo}
      dateMenuOpen={dateMenuOpen}
      dateMenuRef={dateMenuRef}
      onDateMenuToggle={onDateMenuToggle}
      onPresetRangeChange={onPresetRangeChange}
      onCustomRangeApply={onCustomRangeApply}
      exportButtonLabel={exportButton}
      onExportCsv={() => exportCompanyDashboardCsv(data)}
    />
  );
}
