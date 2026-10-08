'use client';

import { DashboardPageHeader } from '@/features/dashboard/components/shared/dashboard-page-header';
import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { exportOrganisationDashboardCsv } from '@/features/dashboard/utils/export-organisation-dashboard-csv';
import type {
  OrganisationDashboardOverview,
  OrganisationDateRangeId,
} from '@/features/dashboard/types/organisation-dashboard';

type PresetRangeId = Exclude<OrganisationDateRangeId, 'custom'>;

type OrganisationDashboardHeaderProps = Readonly<{
  data: OrganisationDashboardOverview;
  activeRange: OrganisationDateRangeId;
  customFrom: string;
  customTo: string;
  dateMenuOpen: boolean;
  dateMenuRef: React.RefObject<HTMLDivElement | null>;
  onDateMenuToggle: () => void;
  onPresetRangeChange: (range: PresetRangeId) => void;
  onCustomRangeApply: (from: string, to: string) => void;
}>;

export function OrganisationDashboardHeader({
  data,
  activeRange,
  customFrom,
  customTo,
  dateMenuOpen,
  dateMenuRef,
  onDateMenuToggle,
  onPresetRangeChange,
  onCustomRangeApply,
}: OrganisationDashboardHeaderProps) {
  return (
    <DashboardPageHeader
      title={organisationDashboardCopy.title}
      dateRangeLabel={data.dateRangeLabel}
      activeRange={activeRange}
      customFrom={customFrom}
      customTo={customTo}
      dateMenuOpen={dateMenuOpen}
      dateMenuRef={dateMenuRef}
      onDateMenuToggle={onDateMenuToggle}
      onPresetRangeChange={onPresetRangeChange}
      onCustomRangeApply={onCustomRangeApply}
      exportButtonLabel={organisationDashboardCopy.exportButton}
      onExportCsv={() => exportOrganisationDashboardCsv(data)}
    />
  );
}
