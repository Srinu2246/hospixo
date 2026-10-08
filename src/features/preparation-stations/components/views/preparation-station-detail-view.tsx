'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import {
  Alert,
  Box,
  Breadcrumbs,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Typography,
} from '@mui/material';
import { ArrowLeft, Pencil } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { usePreparationStations } from '../../context/preparation-stations-context';

export function PreparationStationDetailView() {
  const {
    selectedStation,
    detailLoading,
    detailError,
    backToList,
    openEditStationPage,
    loadStationDetail,
  } = usePreparationStations();

  const selectedStationId = selectedStation?.id;
  const hasDetails = selectedStation?.code !== undefined;

  useEffect(() => {
    if (!selectedStationId || hasDetails) return;
    void loadStationDetail(selectedStationId);
  }, [hasDetails, loadStationDetail, selectedStationId]);

  if (!selectedStation) return null;

  const isActive = (selectedStation.status ?? 'active').toLowerCase() === 'active';

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
          sx={{ fontSize: '0.8125rem' }}
        >
          <Typography
            component={Link}
            href="/company"
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              textDecoration: 'none',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Dashboard
          </Typography>
          <Typography
            onClick={backToList}
            sx={{
              fontSize: '0.8125rem',
              color: 'text.secondary',
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            Preparation Stations
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}>
            {selectedStation.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={backToList}
            sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600 }}
          >
            Back
          </Button>
          <Box>
            <Typography variant="h5" sx={{ fontWeight: 700 }}>
              {selectedStation.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Station Code: {selectedStation.code}
            </Typography>
          </Box>
        </Box>

        <Button
          variant="contained"
          size="small"
          startIcon={<Pencil size={15} />}
          onClick={() => openEditStationPage(selectedStation)}
          sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 2.5 }}
        >
          Edit Station
        </Button>
      </Box>

      {detailError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {detailError}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
            Station Information
          </Typography>

          {detailLoading && !hasDetails ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress size={24} />
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2.5,
              }}
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  Station Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedStation.name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  Station Code
                </Typography>
                <Typography variant="body1">{selectedStation.code}</Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.5 }}
                >
                  Status
                </Typography>
                <Chip
                  size="small"
                  label={isActive ? 'Active' : 'Inactive'}
                  color={isActive ? 'success' : 'default'}
                  variant="outlined"
                />
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
