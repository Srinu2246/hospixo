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
import { ArrowLeft } from 'lucide-react';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';

import { useGstRates } from '../../context/gst-rates-context';

export function GstRateDetailView() {
  const { selectedRate, detailLoading, detailError, backToList, loadRateDetail } = useGstRates();
  const selectedRateId = selectedRate?.id;
  const hasDetails = selectedRate?.cgstRate !== undefined;

  useEffect(() => {
    if (!selectedRateId || hasDetails) return;
    void loadRateDetail(selectedRateId);
  }, [hasDetails, loadRateDetail, selectedRateId]);

  if (!selectedRate) return null;

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
            GST Rates
          </Typography>
          <Typography sx={{ fontSize: '0.8125rem', color: 'primary.main', fontWeight: 600 }}>
            {selectedRate.name}
          </Typography>
        </Breadcrumbs>
      </Box>

      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2.5 }}>
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
            {selectedRate.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            GST Code: {selectedRate.code}
          </Typography>
        </Box>
      </Box>

      {detailError && (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {detailError}
        </Alert>
      )}

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, mb: 2 }}>
            GST Rate Details
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
                  GST Code
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedRate.code}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  Slab Name
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {selectedRate.name}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  CGST
                </Typography>
                <Typography variant="body1">{selectedRate.cgstRate}%</Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  SGST
                </Typography>
                <Typography variant="body1">{selectedRate.sgstRate}%</Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  IGST
                </Typography>
                <Typography variant="body1">{selectedRate.igstRate}%</Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  Total Rate
                </Typography>
                <Typography variant="body1" color="primary.main" sx={{ fontWeight: 700 }}>
                  {selectedRate.totalRate}%
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  Effective From
                </Typography>
                <Typography variant="body2">
                  {new Date(selectedRate.effectiveFrom).toLocaleString()}
                </Typography>
              </Box>

              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ display: 'block', mb: 0.25 }}
                >
                  Effective To
                </Typography>
                <Typography variant="body2">
                  {selectedRate.effectiveTo
                    ? new Date(selectedRate.effectiveTo).toLocaleString()
                    : 'Open-ended'}
                </Typography>
              </Box>

              {selectedRate.status && (
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
                    label={selectedRate.status}
                    color={selectedRate.status.toUpperCase() === 'ACTIVE' ? 'success' : 'default'}
                    variant="outlined"
                  />
                </Box>
              )}
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
