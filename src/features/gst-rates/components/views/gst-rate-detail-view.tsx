'use client';

import { useEffect, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';

import { CrudDetailCard, type CrudDetailCardField } from '@/components/ui/crud-detail-card';
import { CrudDetailHeader } from '@/components/ui/crud-detail-header';
import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { useGstRates } from '../../context/gst-rates-context';

export function GstRateDetailView() {
  const { selectedRate, detailLoading, detailError, backToList, loadRateDetail } = useGstRates();
  const selectedRateId = selectedRate?.id;
  const hasDetails = selectedRate?.cgstRate !== undefined;

  useEffect(() => {
    if (!selectedRateId || hasDetails) return;
    void loadRateDetail(selectedRateId);
  }, [hasDetails, loadRateDetail, selectedRateId]);

  const fields = useMemo<readonly CrudDetailCardField[]>(() => {
    if (!selectedRate) return [];

    const result: CrudDetailCardField[] = [
      { label: 'GST Code', value: selectedRate.code, bold: true },
      { label: 'Slab Name', value: selectedRate.name, bold: true },
      { label: 'CGST', value: `${selectedRate.cgstRate}%` },
      { label: 'SGST', value: `${selectedRate.sgstRate}%` },
      { label: 'IGST', value: `${selectedRate.igstRate}%` },
      {
        label: 'Total Rate',
        value: (
          <Typography variant="body1" color="primary.main" sx={{ fontWeight: 700 }}>
            {selectedRate.totalRate}%
          </Typography>
        ),
      },
      {
        label: 'Effective From',
        value: (
          <Typography variant="body2">
            {new Date(selectedRate.effectiveFrom).toLocaleString()}
          </Typography>
        ),
      },
      {
        label: 'Effective To',
        value: (
          <Typography variant="body2">
            {selectedRate.effectiveTo
              ? new Date(selectedRate.effectiveTo).toLocaleString()
              : 'Open-ended'}
          </Typography>
        ),
      },
    ];

    if (selectedRate.status) {
      result.push({
        label: 'Status',
        value: (
          <Chip
            size="small"
            label={selectedRate.status}
            color={selectedRate.status.toUpperCase() === 'ACTIVE' ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      });
    }

    return result;
  }, [selectedRate]);

  if (!selectedRate) return null;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <StickyBreadcrumbBar
        items={[
          { label: 'Dashboard', href: '/company' },
          { label: 'GST Rates', onClick: backToList },
          { label: selectedRate.name },
        ]}
      />

      <CrudDetailHeader
        title={selectedRate.name}
        subtitle={`GST Code: ${selectedRate.code}`}
        onBack={backToList}
      />

      {detailError ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {detailError}
        </Alert>
      ) : null}

      <CrudDetailCard
        title="GST Rate Details"
        loading={detailLoading && !hasDetails}
        fields={fields}
      />
    </Box>
  );
}
