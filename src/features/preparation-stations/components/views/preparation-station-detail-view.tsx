'use client';

import { useEffect, useMemo } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import { Pencil } from 'lucide-react';

import { CrudDetailCard, type CrudDetailCardField } from '@/components/ui/crud-detail-card';
import { CrudDetailHeader } from '@/components/ui/crud-detail-header';
import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
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

  const fields = useMemo<readonly CrudDetailCardField[]>(() => {
    if (!selectedStation) return [];
    const isActive = (selectedStation.status ?? 'active').toLowerCase() === 'active';
    return [
      { label: 'Station Name', value: selectedStation.name, bold: true },
      { label: 'Station Code', value: selectedStation.code },
      {
        label: 'Status',
        value: (
          <Chip
            size="small"
            label={isActive ? 'Active' : 'Inactive'}
            color={isActive ? 'success' : 'default'}
            variant="outlined"
          />
        ),
      },
    ];
  }, [selectedStation]);

  if (!selectedStation) return null;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <StickyBreadcrumbBar
        items={[
          { label: 'Dashboard', href: '/company' },
          { label: 'Preparation Stations', onClick: backToList },
          { label: selectedStation.name },
        ]}
      />

      <CrudDetailHeader
        title={selectedStation.name}
        subtitle={`Station Code: ${selectedStation.code}`}
        onBack={backToList}
        action={
          <Button
            variant="contained"
            size="small"
            startIcon={<Pencil size={15} />}
            onClick={() => openEditStationPage(selectedStation)}
            sx={{
              height: 40,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              px: 2.5,
            }}
          >
            Edit Station
          </Button>
        }
      />

      {detailError ? (
        <Alert severity="error" sx={{ mb: 2.5 }}>
          {detailError}
        </Alert>
      ) : null}

      <CrudDetailCard
        title="Station Information"
        loading={detailLoading && !hasDetails}
        fields={fields}
      />
    </Box>
  );
}
