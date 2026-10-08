'use client';

import { Box, MenuItem, Stack, TextField } from '@mui/material';
import { Plus } from 'lucide-react';

import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { CrudPageHeader } from '@/components/ui/crud-page-header';
import { ModifierGroupsProvider, useModifierGroups } from '../../context/modifier-groups-context';
import type { ModifierGroupsPageConfig } from '../../config/modifier-groups-page-config';
import type { ModifierGroupStatus } from '../../types/modifier-group-api';
import { ModifierGroupsTable } from '../table/modifier-groups-table';
import { CreateModifierGroupView } from '../views/create-modifier-group-view';
import { EditModifierGroupView } from '../views/edit-modifier-group-view';
import { ModifierGroupDetailView } from '../views/modifier-group-detail-view';

function ModifierGroupsPageContent() {
  const { pageConfig, viewMode, statusFilter, setStatusFilter, openCreateGroupPage } =
    useModifierGroups();

  if (viewMode === 'create-group') {
    return <CreateModifierGroupView />;
  }

  if (viewMode === 'edit-group') {
    return <EditModifierGroupView />;
  }

  if (viewMode === 'view-group') {
    return <ModifierGroupDetailView />;
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
          actionLabel="Create Group"
          actionIcon={<Plus size={16} />}
          onAction={openCreateGroupPage}
        />

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <TextField
            select
            size="small"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as ModifierGroupStatus | 'all')}
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

        <ModifierGroupsTable />
      </Box>
    </Box>
  );
}

export function ModifierGroupsPage({
  pageConfig,
}: Readonly<{ pageConfig: ModifierGroupsPageConfig }>) {
  return (
    <ModifierGroupsProvider pageConfig={pageConfig}>
      <ModifierGroupsPageContent />
    </ModifierGroupsProvider>
  );
}
