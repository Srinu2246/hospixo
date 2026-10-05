import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { Download } from 'lucide-react';

import { organisationDashboardCopy } from '@/features/dashboard/config/organisation/dashboard';
import { exportOrganisationDashboardCsv } from '@/features/dashboard/utils/export-organisation-dashboard-csv';
import { OrganisationDateRangePicker } from '@/features/dashboard/components/organisation/shared/organisation-date-range-picker';
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
    <header className={orgDash.headerHeader}>
      <h1 className={orgDash.headerTitle}>{organisationDashboardCopy.title}</h1>
      <div className={orgDash.headerActions}>
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
        <button
          type="button"
          className={orgDash.headerExportbutton}
          onClick={() => exportOrganisationDashboardCsv(data)}
        >
          <Download className={orgDash.headerExporticon} aria-hidden />
          {organisationDashboardCopy.exportButton}
        </button>
      </div>
    </header>
  );
}
