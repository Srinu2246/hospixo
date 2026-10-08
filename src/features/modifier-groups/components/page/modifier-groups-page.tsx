'use client';

import Link from 'next/link';
import {
  Box,
  Breadcrumbs,
  Button,
  Link as MuiLink,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Plus } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
      {/* Sticky Breadcrumb Bar */}
      <Box
        sx={{
          position: 'sticky',
          top: { xs: -16, md: -24 },
          zIndex: 10,
          mx: { xs: -2, md: -3 },
          mt: { xs: -2, md: -3 },
          mb: 2.5,
          px: { xs: 2, md: 3 },
          py: 1.25,
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <Breadcrumbs
          separator={<NavigateNextIcon sx={{ fontSize: 14, color: '#94a3b8' }} />}
          aria-label="breadcrumb"
          sx={{ fontSize: '0.8125rem' }}
        >
          <MuiLink
            component={Link}
            underline="hover"
            color="text.secondary"
            href={pageConfig.homeHref}
            sx={{ fontSize: '0.8125rem' }}
          >
            Home
          </MuiLink>
          <Typography color="primary.main" sx={{ fontWeight: 600, fontSize: '0.8125rem' }}>
            {pageConfig.pageTitle}
          </Typography>
        </Breadcrumbs>
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: 2,
            flexWrap: 'wrap',
          }}
        >
          <Box>
            <Typography variant="h5" color="text.primary" sx={{ fontWeight: 700 }}>
              {pageConfig.pageTitle}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {pageConfig.pageSubtitle}
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<Plus size={16} />}
            onClick={openCreateGroupPage}
            sx={{
              height: 40,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Create Group
          </Button>
        </Box>

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

export function ModifierGroupsPage({ pageConfig }: { pageConfig: ModifierGroupsPageConfig }) {
  return (
    <ModifierGroupsProvider pageConfig={pageConfig}>
      <ModifierGroupsPageContent />
    </ModifierGroupsProvider>
  );
}
