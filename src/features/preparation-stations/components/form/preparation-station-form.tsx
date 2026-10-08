'use client';

import { useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import FormControl from '@mui/material/FormControl';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

import { CrudDetailHeader } from '@/components/ui/crud-detail-header';
import { CrudFormActions } from '@/components/ui/crud-form-actions';
import { StickyBreadcrumbBar } from '@/components/ui/sticky-breadcrumb-bar';
import { usePreparationStations } from '../../context/preparation-stations-context';
import type { PreparationStationStatus } from '../../types/preparation-station-api';

export function PreparationStationForm({ mode }: { readonly mode: 'create' | 'edit' }) {
  const { selectedStation, createStation, updateStation, backToList } = usePreparationStations();
  const isEdit = mode === 'edit';

  const [name, setName] = useState(isEdit ? (selectedStation?.name ?? '') : '');
  const [code, setCode] = useState(isEdit ? (selectedStation?.code ?? '') : '');
  const [status, setStatus] = useState<PreparationStationStatus>(
    (selectedStation?.status as PreparationStationStatus) ?? 'active',
  );
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (isEdit && !selectedStation) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !code.trim()) {
      setError('Station name and code are required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const result = isEdit
      ? await updateStation(selectedStation!.id, {
          name: name.trim(),
          code: code.trim().toUpperCase(),
          status,
        })
      : await createStation({
          name: name.trim(),
          code: code.trim().toUpperCase(),
        });

    setIsSubmitting(false);
    if (!result.ok) {
      setError(result.message ?? 'Failed to save preparation station.');
    }
  }

  const breadcrumbs = [
    { label: 'Dashboard', href: '/company' },
    { label: 'Preparation Stations', onClick: backToList },
    {
      label: isEdit ? `Edit ${selectedStation?.name ?? ''}` : 'Create Preparation Station',
    },
  ];

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <StickyBreadcrumbBar items={breadcrumbs} />

      <CrudDetailHeader
        title={isEdit ? 'Edit Preparation Station' : 'Create Preparation Station'}
        subtitle={
          isEdit
            ? `Update station settings for ${selectedStation?.name ?? ''}`
            : 'Route menu items and order tickets to specific kitchen or bar stations.'
        }
        onBack={backToList}
      />

      <Card variant="outlined" sx={{ borderRadius: '12px' }}>
        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, '&:last-child': { pb: { xs: 2, sm: 2.5 } } }}>
          <Typography variant="h6" sx={{ fontWeight: 600, mb: 2 }} gutterBottom>
            Station Information
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5 }}>
              {error}
            </Alert>
          )}

          <Box
            component="form"
            onSubmit={handleSubmit}
            noValidate
            sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}
          >
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: isEdit ? '1fr 1fr 1fr' : '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="stationName"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Station Name
                </Typography>
                <TextField
                  id="stationName"
                  placeholder="e.g. Main Kitchen, Bar"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  disabled={isSubmitting}
                  required
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Typography
                  component="label"
                  htmlFor="stationCode"
                  sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
                >
                  Station Code
                </Typography>
                <TextField
                  id="stationCode"
                  placeholder="e.g. KIT-01, BAR-01"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  disabled={isSubmitting}
                  required
                  fullWidth
                  size="small"
                  sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
                />
              </Box>

              {isEdit && (
                <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                  <Typography
                    component="label"
                    htmlFor="stationStatus"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      mb: 0.5,
                    }}
                  >
                    Status
                  </Typography>
                  <FormControl size="small" fullWidth>
                    <Select
                      id="stationStatus"
                      value={status}
                      onChange={(e) => setStatus(e.target.value as PreparationStationStatus)}
                      disabled={isSubmitting}
                      sx={{ height: 40, borderRadius: '8px' }}
                    >
                      <MenuItem value="active">Active</MenuItem>
                      <MenuItem value="inactive">Inactive</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Box>

            <CrudFormActions
              onCancel={backToList}
              submitLabel={isEdit ? 'Save Changes' : 'Create Station'}
              isSubmitting={isSubmitting}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
