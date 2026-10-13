'use client';

/** Reports hub — section tabs and tab panels. */

import { useCallback, useMemo } from 'react';
import { Box, Typography } from '@mui/material';
import { useRouter, useSearchParams } from 'next/navigation';

import { PageSectionTabs } from '@/components/shared/ui/PageSectionTabs';
import { ReportsOverviewPage } from '@/features/reports/overview/ReportsOverviewPage';
import { ReportsSalesPage } from '@/features/reports/overview/ReportsSalesPage';
import {
  isReportsTabId,
  reportsPageCopy,
  reportsTabItems,
  type ReportsTabId,
} from '@/lib/mocks/reports/reports.mocks';

export function ReportsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const activeTab = useMemo((): ReportsTabId => {
    const tab = searchParams.get('tab');
    return isReportsTabId(tab) ? tab : 'overview';
  }, [searchParams]);

  const handleTabChange = useCallback(
    (tabId: string) => {
      if (!isReportsTabId(tabId)) return;

      const params = new URLSearchParams(searchParams.toString());
      if (tabId === 'overview') {
        params.delete('tab');
      } else {
        params.set('tab', tabId);
      }

      const query = params.toString();
      const basePath = '/reports';
      router.replace(query ? `${basePath}?${query}` : basePath, { scroll: false });
    },
    [router, searchParams],
  );

  const activeLabel = reportsTabItems.find((item) => item.id === activeTab)?.label ?? 'Overview';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        flex: '1 0 auto',
        minHeight: '100%',
        bgcolor: (theme) => (theme.palette.mode === 'dark' ? 'background.default' : '#f8fafc'),
      }}
    >
      <PageSectionTabs items={reportsTabItems} value={activeTab} onChange={handleTabChange} />

      <Box
        sx={{
          flex: '1 0 auto',
          p: { xs: 2, sm: 2.5, md: 3 },
          boxSizing: 'border-box',
        }}
      >
        {activeTab === 'overview' ? (
          <ReportsOverviewPage />
        ) : activeTab === 'sales' ? (
          <ReportsSalesPage />
        ) : (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: 320,
              borderRadius: '0.75rem',
              border: '1px dashed',
              borderColor: 'divider',
              bgcolor: 'background.paper',
              p: 4,
              textAlign: 'center',
            }}
          >
            <Box>
              <Typography sx={{ fontSize: '1rem', fontWeight: 700, color: 'text.primary' }}>
                {activeLabel}
              </Typography>
              <Typography sx={{ mt: 1, fontSize: '0.875rem', color: 'text.secondary' }}>
                {reportsPageCopy.tabPlaceholder}
              </Typography>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
}
