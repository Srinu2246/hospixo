'use client';

import { Box, MenuItem, Stack, TextField } from '@mui/material';
import { Plus } from 'lucide-react';

import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { CrudPageHeader } from '@/components/ui/crud-page-header';
import {
  PreparationStationsProvider,
  usePreparationStations,
} from '../../context/preparation-stations-context';
import type { PreparationStationsPageConfig } from '../../config/preparation-stations-page-config';
import type { PreparationStationStatus } from '../../types/preparation-station-api';
import { PreparationStationsTable } from '../table/preparation-stations-table';
import { CreatePreparationStationView } from '../views/create-preparation-station-view';
import { EditPreparationStationView } from '../views/edit-preparation-station-view';
import { PreparationStationDetailView } from '../views/preparation-station-detail-view';

function PreparationStationsPageContent() {
  const { pageConfig, viewMode, statusFilter, setStatusFilter, openCreateStationPage } =
    usePreparationStations();

  if (viewMode === 'create-station') {
    return <CreatePreparationStationView />;
  }

  if (viewMode === 'edit-station') {
    return <EditPreparationStationView />;
  }

  if (viewMode === 'view-station') {
    return <PreparationStationDetailView />;
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
          actionLabel="Create Station"
          actionIcon={<Plus size={16} />}
          onAction={openCreateStationPage}
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as PreparationStationStatus | 'all')}
            sx={{
              minWidth: 160,
              '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' },
            }}
          >
            <MenuItem value="all">All statuses</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="inactive">Inactive</MenuItem>
          </TextField>
        </Stack>

        <PreparationStationsTable />
      </Box>
    </Box>
  );
}

export function PreparationStationsPage({
  pageConfig,
}: Readonly<{
  pageConfig: PreparationStationsPageConfig;
}>) {
  return (
    <PreparationStationsProvider pageConfig={pageConfig}>
      <PreparationStationsPageContent />
    </PreparationStationsProvider>
  );
}
