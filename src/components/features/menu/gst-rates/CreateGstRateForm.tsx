'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { CalendarPicker } from '@/components/shared/form-fields/CalendarPicker';
import { Input } from '@/components/shared/form-fields/Input';
import {
  createGstRateInputSchema,
  type CreateGstRateInput,
  type GstRate,
} from '@/lib/schemas/menu/gstRatesSchema';

export interface CreateGstRateFormProps {
  mode?: 'create' | 'view';
  rate?: GstRate | null;
  onCancel: () => void;
  onSubmit: (input: CreateGstRateInput) => void;
}

function toDateInputValue(value?: string | null): Date | null {
  if (!value) return null;
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? null : date;
}

function toIsoDate(value: Date | null): string {
  if (!value) return '';
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, '0');
  const day = String(value.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function CreateGstRateForm({
  mode = 'create',
  rate = null,
  onCancel,
  onSubmit,
}: Readonly<CreateGstRateFormProps>) {
  const isView = mode === 'view';

  const [code, setCode] = useState(rate?.code ?? '');
  const [name, setName] = useState(rate?.name ?? '');
  const [cgst, setCgst] = useState(rate ? String(rate.cgst) : '2.5');
  const [sgst, setSgst] = useState(rate ? String(rate.sgst) : '2.5');
  const [igst, setIgst] = useState(rate ? String(rate.igst) : '5');
  const [total, setTotal] = useState(rate ? String(rate.total) : '5');
  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(
    toDateInputValue(rate?.effectiveFrom) ?? new Date(),
  );
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(toDateInputValue(rate?.effectiveTo));
  const [error, setError] = useState<string | null>(null);

  const computedTotal = useMemo(() => {
    const c = Number(cgst) || 0;
    const s = Number(sgst) || 0;
    const i = Number(igst) || 0;
    return Number((c + s + i).toFixed(2));
  }, [cgst, igst, sgst]);

  function handleSubmit() {
    if (isView) {
      onCancel();
      return;
    }

    const result = createGstRateInputSchema.safeParse({
      code,
      name,
      cgst,
      sgst,
      igst,
      total: total.trim() ? Number(total) : computedTotal,
      effectiveFrom: toIsoDate(effectiveFrom),
      effectiveTo: toIsoDate(effectiveTo) || undefined,
    });

    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid GST rate.');
      return;
    }

    setError(null);
    onSubmit(result.data);
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', minHeight: 0 }}>
      <Stack direction="row" spacing={1.5} sx={{ alignItems: 'flex-start', flexShrink: 0 }}>
        <ActionButton
          variant="outlined"
          size="small"
          startIcon={<ArrowLeft size={16} />}
          onClick={onCancel}
          sx={{ flexShrink: 0 }}
        >
          Back
        </ActionButton>
        <Box sx={{ minWidth: 0 }}>
          <Typography
            variant="h5"
            component="h1"
            sx={{
              fontWeight: 700,
              fontSize: { xs: '1.375rem', sm: '1.5rem' },
              letterSpacing: '-0.02em',
              lineHeight: 1.2,
            }}
          >
            {isView ? 'View GST Rate' : 'Create GST Rate'}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Define a GST slab with CGST, SGST, and IGST components.
          </Typography>
        </Box>
      </Stack>

      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          overflow: 'auto',
          p: { xs: 2, sm: 3 },
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.0625rem' }}>
            Rate Configuration
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Input
              id="gst-code"
              label="GST Code"
              required
              placeholder="e.g. GST_5, GST_12, GST_18, EXEMPT"
              helperText="Tax slab code for GST compliance."
              value={code}
              disabled={isView}
              onChange={(event) => {
                setCode(event.target.value);
                if (error) setError(null);
              }}
            />
            <Input
              id="gst-name"
              label="GST Name"
              required
              placeholder="e.g. Standard Food (5%)"
              helperText="Descriptive name printed on invoices."
              value={name}
              disabled={isView}
              onChange={(event) => {
                setName(event.target.value);
                if (error) setError(null);
              }}
            />
            <Input
              id="gst-total"
              label="Total Rate (%)"
              type="number"
              value={total}
              disabled={isView}
              onChange={(event) => setTotal(event.target.value)}
              onBlur={() => {
                if (!total.trim()) setTotal(String(computedTotal));
              }}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Input
              id="gst-cgst"
              label="CGST (%)"
              type="number"
              value={cgst}
              disabled={isView}
              onChange={(event) => setCgst(event.target.value)}
            />
            <Input
              id="gst-sgst"
              label="SGST (%)"
              type="number"
              value={sgst}
              disabled={isView}
              onChange={(event) => setSgst(event.target.value)}
            />
            <Input
              id="gst-igst"
              label="IGST (%)"
              type="number"
              value={igst}
              disabled={isView}
              onChange={(event) => setIgst(event.target.value)}
            />
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
              gap: 2,
            }}
          >
            <Box>
              <Typography
                sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.75 }}
              >
                Effective From
              </Typography>
              <CalendarPicker
                value={effectiveFrom}
                onChange={setEffectiveFrom}
                placeholder="dd-mm-yyyy"
                disabled={isView}
                minWidth="100%"
                sx={{ width: '100%' }}
              />
            </Box>
            <Box>
              <Typography
                sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.75 }}
              >
                Effective To
              </Typography>
              <CalendarPicker
                value={effectiveTo}
                onChange={setEffectiveTo}
                placeholder="dd-mm-yyyy --:--"
                disabled={isView}
                minWidth="100%"
                sx={{ width: '100%' }}
              />
            </Box>
          </Box>

          {error ? (
            <Typography variant="body2" color="error">
              {error}
            </Typography>
          ) : null}

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
            <ActionButton variant="outlined" onClick={onCancel}>
              {isView ? 'Close' : 'Cancel'}
            </ActionButton>
            {!isView ? <ActionButton onClick={handleSubmit}>Create GST Rate</ActionButton> : null}
          </Stack>
        </Stack>
      </Paper>
    </Box>
  );
}
