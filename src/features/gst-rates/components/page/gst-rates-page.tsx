'use client';

import Link from 'next/link';
import {
  Box,
  Breadcrumbs,
  Button,
  Checkbox,
  FormControlLabel,
  Link as MuiLink,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { Plus } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

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
            onClick={openCreateRatePage}
            sx={{
              height: 40,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Create GST Rate
          </Button>
        </Box>

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

export function GstRatesPage({ pageConfig }: { pageConfig: GstRatesPageConfig }) {
  return (
    <GstRatesProvider pageConfig={pageConfig}>
      <GstRatesPageContent />
    </GstRatesProvider>
  );
}
