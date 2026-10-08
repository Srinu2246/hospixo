'use client';

import { Box, Checkbox, FormControlLabel, Stack, TextField, Typography } from '@mui/material';
import { Plus } from 'lucide-react';

import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { CrudPageHeader } from '@/components/ui/crud-page-header';
import { GstRatesProvider, useGstRates } from '../../context/gst-rates-context';
import type { GstRatesPageConfig } from '../../config/gst-rates-page-config';
import { GstRatesTable } from '../table/gst-rates-table';
import { CreateGstRateView } from '../views/create-gst-rate-view';
import { GstRateDetailView } from '../views/gst-rate-detail-view';

function GstRatesPageContent() {
  const {
    pageConfig,
    viewMode,
    codeFilter,
    activeOnlyFilter,
    setCodeFilter,
    setActiveOnlyFilter,
    openCreateRatePage,
  } = useGstRates();

  if (viewMode === 'create-rate') {
    return <CreateGstRateView />;
  }

  if (viewMode === 'view-rate') {
    return <GstRateDetailView />;
  }

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <StickyBreadcrumbBar
        items={[{ label: 'Home', href: pageConfig.homeHref }, { label: pageConfig.pageTitle }]}
      />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <CrudPageHeader
          title={pageConfig.pageTitle}
          subtitle={pageConfig.pageSubtitle}
          actionLabel="Create GST Rate"
          actionIcon={<Plus size={16} />}
          onAction={openCreateRatePage}
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            size="small"
            placeholder="Filter by GST code (e.g. GST_5)"
            value={codeFilter}
            onChange={(e) => setCodeFilter(e.target.value)}
            slotProps={{ htmlInput: { 'aria-label': 'Filter by GST code' } }}
            sx={{
              minWidth: 240,
              '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' },
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                size="small"
                checked={activeOnlyFilter}
                onChange={(e) => setActiveOnlyFilter(e.target.checked)}
              />
            }
            label={<Typography variant="body2">Active only</Typography>}
          />
        </Stack>

        <GstRatesTable />
      </Box>
    </Box>
  );
}

export function GstRatesPage({ pageConfig }: Readonly<{ pageConfig: GstRatesPageConfig }>) {
  return (
    <GstRatesProvider pageConfig={pageConfig}>
      <GstRatesPageContent />
    </GstRatesProvider>
  );
}
