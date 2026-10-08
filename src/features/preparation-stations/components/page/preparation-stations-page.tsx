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
            onClick={openCreateStationPage}
            sx={{
              height: 40,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Create Station
          </Button>
        </Box>

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
}: {
  pageConfig: PreparationStationsPageConfig;
}) {
  return (
    <PreparationStationsProvider pageConfig={pageConfig}>
      <PreparationStationsPageContent />
    </PreparationStationsProvider>
  );
}
