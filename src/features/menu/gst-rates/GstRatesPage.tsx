'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { CreateGstRateForm, GstRatesTable } from '@/components/features/menu/gst-rates';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { SearchBar } from '@/components/shared/form-fields/SearchBar';
import { MOCK_GST_RATES } from '@/lib/mocks/menu/useGstRates.mocks';
import {
  createGstRateInputSchema,
  gstRateSchema,
  type CreateGstRateInput,
  type GstRate,
} from '@/lib/schemas/menu/gstRatesSchema';

type ViewMode = 'list' | 'create' | 'view';

/**
 * Single fixed-height GST Rates page: header + filters stay put; table scrolls internally.
 */
export function GstRatesPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [rates, setRates] = useState<GstRate[]>(MOCK_GST_RATES);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOnly, setActiveOnly] = useState(false);
  const [selectedRate, setSelectedRate] = useState<GstRate | null>(null);

  const filteredRates = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rates.filter((rate) => {
      if (activeOnly && !rate.active) return false;
      if (!query) return true;
      return rate.code.toLowerCase().includes(query) || rate.name.toLowerCase().includes(query);
    });
  }, [activeOnly, rates, searchQuery]);

  function openCreate() {
    setSelectedRate(null);
    setViewMode('create');
  }

  function openView(rate: GstRate) {
    setSelectedRate(rate);
    setViewMode('view');
  }

  function backToList() {
    setSelectedRate(null);
    setViewMode('list');
  }

  function addRate(input: CreateGstRateInput) {
    const parsed = createGstRateInputSchema.parse(input);
    const total = parsed.total ?? Number((parsed.cgst + parsed.sgst + parsed.igst).toFixed(2));
    const next = gstRateSchema.parse({
      id: `gst_${Date.now()}`,
      code: parsed.code,
      name: parsed.name,
      cgst: parsed.cgst,
      sgst: parsed.sgst,
      igst: parsed.igst,
      total,
      effectiveFrom: parsed.effectiveFrom,
      effectiveTo: parsed.effectiveTo || undefined,
      active: true,
    });
    setRates((prev) => [next, ...prev]);
    setViewMode('list');
  }

  if (viewMode === 'create' || viewMode === 'view') {
    return (
      <Box
        sx={{
          width: '100%',
          height: '100%',
          minHeight: 0,
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <CreateGstRateForm
          mode={viewMode === 'view' ? 'view' : 'create'}
          rate={selectedRate}
          onCancel={backToList}
          onSubmit={addRate}
        />
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: '100%',
        height: '100%',
        maxHeight: '100%',
        minHeight: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden',
        bgcolor: 'background.default',
        boxSizing: 'border-box',
      }}
    >
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{
          alignItems: { sm: 'flex-start' },
          justifyContent: 'space-between',
          flexShrink: 0,
        }}
      >
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.375rem', sm: '1.5rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
              color: 'text.primary',
            }}
          >
            GST Rates
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}
          >
            Configure GST slabs used across menu items and billing.
          </Typography>
        </Box>

        <ActionButton startIcon={<Plus size={16} />} onClick={openCreate} sx={{ flexShrink: 0 }}>
          Create GST Rate
        </ActionButton>
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { sm: 'center' }, flexShrink: 0 }}
      >
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Filter by GST code (e.g. GST_)"
          showClear
          fullWidth
          width="100%"
          sx={{ flex: 1, maxWidth: { sm: 420 } }}
        />
        <FormControlLabel
          control={
            <Checkbox
              checked={activeOnly}
              onChange={(event) => setActiveOnly(event.target.checked)}
              size="small"
            />
          }
          label="Active only"
          sx={{
            m: 0,
            flexShrink: 0,
            '& .MuiFormControlLabel-label': {
              fontSize: '0.875rem',
              fontWeight: 500,
              color: 'text.primary',
            },
          }}
        />
      </Stack>

      <Box
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <GstRatesTable rates={filteredRates} onCreate={openCreate} onView={openView} />
      </Box>
    </Box>
  );
}
