'use client';

import { Box } from '@mui/material';

import type { OrganisationDashboardOverview } from '@/features/dashboard/types/organisation-dashboard';

import { AlertsCard } from '../alerts';
import { InsightsCard } from '../insights';
import { QuickHelpCard } from '../quick-help';
import { SubscriptionUsageCard } from '../subscription-usage';
import { TopBranchesCard } from '../top-branches';

type OrganisationBottomGridProps = Readonly<{
  data: OrganisationDashboardOverview;
  expandedInsightId: string | null;
  onToggleInsight: (insightId: string) => void;
}>;

export function OrganisationBottomGrid({
  data,
  expandedInsightId,
  onToggleInsight,
}: OrganisationBottomGridProps) {
  return (
    <>
      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <TopBranchesCard branches={data.topBranches} />
        <SubscriptionUsageCard subscription={data.subscription} />
      </Box>

      <Box
        sx={{
          display: 'grid',
          gap: 2.5,
          gridTemplateColumns: { xs: '1fr', lg: 'repeat(3, minmax(0, 1fr))' },
        }}
      >
        <AlertsCard alerts={data.alerts} />
        <InsightsCard
          insights={data.insights}
          expandedInsightId={expandedInsightId}
          onToggleInsight={onToggleInsight}
        />
        <QuickHelpCard accountManager={data.accountManager} />
      </Box>
    </>
  );
}
