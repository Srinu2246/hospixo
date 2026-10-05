'use client';

import { orgDash } from '@/features/dashboard/styles/org-dash-classes';

import { Skeleton } from '@mui/material';

const KPI_COUNT = 4;
const CHART_BAR_COUNT = 6;
const CHART_BAR_HEIGHTS = [72, 58, 85, 64, 91, 55];

const skeletonSx = {
  bgcolor: 'var(--muted)',
  transform: 'none',
} as const;

function Block({
  className,
  style,
}: Readonly<{ className?: string; style?: React.CSSProperties }>) {
  return (
    <Skeleton
      variant="rounded"
      animation="wave"
      className={className}
      style={style}
      sx={skeletonSx}
    />
  );
}

function KpiCardSkeleton() {
  return (
    <article className={orgDash.kpiCard}>
      <div className={orgDash.kpiCardtop}>
        <div>
          <Block className={orgDash.skKpilabel} />
          <Block className={orgDash.skKpivalue} />
        </div>
        <Block className={orgDash.skKpiicon} />
      </div>
      <Block className={orgDash.skKpimeta} />
    </article>
  );
}

function CompanyPerformanceChartSkeleton() {
  return (
    <div className={orgDash.perfChart}>
      {Array.from({ length: CHART_BAR_COUNT }).map((_, index) => (
        <div key={index} className={orgDash.perfChartcolumn}>
          <div className={orgDash.perfChartbartrack}>
            <Block
              className={orgDash.skChartbar}
              style={{ height: `${CHART_BAR_HEIGHTS[index] ?? 60}%` }}
            />
          </div>
          <Block className={orgDash.skChartlabel} />
        </div>
      ))}
    </div>
  );
}

function OperationsDonutSkeleton() {
  return (
    <div className={orgDash.skDonutcard}>
      <Block className={orgDash.skSectionlabel} />
      <Block className={orgDash.skDonutring} />
      <div className={orgDash.skDonutlegend}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Block key={index} className={orgDash.skDonutlegendline} />
        ))}
      </div>
    </div>
  );
}

function OperationsFinancialSkeleton() {
  return (
    <section className={`${orgDash.surfaceCard} ${orgDash.skFinancialcard}`}>
      <Block className={orgDash.skSectionlabel} />
      <Block className={orgDash.skStackbar} />
      <div className={orgDash.skFinanciallines}>
        {Array.from({ length: 4 }).map((_, index) => (
          <Block key={index} className={orgDash.skFinancialline} />
        ))}
      </div>
    </section>
  );
}

function BottomPanelSkeleton({ tall = false }: Readonly<{ tall?: boolean }>) {
  return (
    <div className={orgDash.skPanelcard} style={tall ? { minHeight: '14rem' } : undefined}>
      <Block className={orgDash.skPaneltitle} />
      <div className={orgDash.skPanellines}>
        <Block className={orgDash.skPanelline} />
        <Block className={orgDash.skPanellineshort} />
        <Block className={orgDash.skPanelline} />
      </div>
      <Block className={orgDash.skPanelfooter} />
    </div>
  );
}

export function OrganisationDashboardSkeleton() {
  return (
    <div
      className={orgDash.page}
      role="status"
      aria-busy="true"
      aria-label="Loading organisation dashboard"
    >
      <div className={orgDash.headerHeader}>
        <Block className={orgDash.skPagetitle} />
        <div className={orgDash.headerActions}>
          <Block className={orgDash.skDatepicker} />
          <Block className={orgDash.skExportbutton} />
        </div>
      </div>

      <div className={orgDash.kpiGrid}>
        {Array.from({ length: KPI_COUNT }).map((_, index) => (
          <KpiCardSkeleton key={index} />
        ))}
      </div>

      <section className={orgDash.surfaceCard}>
        <Block className={orgDash.skSectionlabel} />
        <div className={orgDash.perfSectionheader}>
          <Block className={orgDash.skMetricselect} />
          <div className={orgDash.perfToolbar}>
            <div className={orgDash.perfViewtoggle}>
              <Block className={orgDash.skViewtoggleplaceholder} />
            </div>
          </div>
        </div>
        <CompanyPerformanceChartSkeleton />
      </section>

      <div>
        <Block className={orgDash.skSectionlabel} />
        <div className={orgDash.opsGrid}>
          <OperationsDonutSkeleton />
          <OperationsFinancialSkeleton />
        </div>
      </div>

      <div className={orgDash.bottomTwocolgrid}>
        <BottomPanelSkeleton />
        <BottomPanelSkeleton />
      </div>

      <div className={orgDash.bottomThreecolgrid}>
        {Array.from({ length: 3 }).map((_, index) => (
          <BottomPanelSkeleton key={index} tall />
        ))}
      </div>
    </div>
  );
}
