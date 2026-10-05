import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { TrendingUp } from 'lucide-react';

import { formatPercent } from '@/features/dashboard/lib/format';
import type { OrganisationDashboardKpi } from '@/features/dashboard/types/organisation-dashboard';
import { cn } from '@/lib/utils';

type OrganisationKpiRowProps = Readonly<{
  kpis: readonly OrganisationDashboardKpi[];
  selectedId?: string | null;
  onSelect?: (kpiId: string) => void;
}>;

export function OrganisationKpiRow({ kpis, selectedId = null, onSelect }: OrganisationKpiRowProps) {
  return (
    <div className={orgDash.kpiGrid}>
      {kpis.map((kpi) => {
        const selected = selectedId === kpi.id;
        const className = cn(
          orgDash.kpiCard,
          onSelect && orgDash.kpiCardbutton,
          selected && orgDash.kpiCardselected,
        );

        const body = (
          <>
            <div className={orgDash.kpiCardtop}>
              <div>
                <p className={orgDash.kpiLabel}>{kpi.label}</p>
                <p className={orgDash.kpiValue}>{kpi.value}</p>
              </div>
              <span className={orgDash.kpiIconwrap}>
                <TrendingUp className={orgDash.kpiIcon} aria-hidden />
              </span>
            </div>
            {typeof kpi.changePercent === 'number' ? (
              <p className={orgDash.kpiMeta}>
                <span className={orgDash.kpiMetapositive}>{formatPercent(kpi.changePercent)}</span>
                <span className={orgDash.kpiMetaneutral}> {kpi.changeLabel}</span>
              </p>
            ) : kpi.helperText ? (
              <p className={cn(orgDash.kpiMeta, orgDash.kpiMetaneutral)}>{kpi.helperText}</p>
            ) : null}
          </>
        );

        if (onSelect) {
          return (
            <button
              key={kpi.id}
              type="button"
              className={className}
              aria-pressed={selected}
              aria-label={`Show ${kpi.label} details in the table`}
              onClick={() => onSelect(kpi.id)}
            >
              {body}
            </button>
          );
        }

        return (
          <article key={kpi.id} className={className}>
            {body}
          </article>
        );
      })}
    </div>
  );
}
