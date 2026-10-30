'use client';

import { useMemo, useState } from 'react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import FormHelperText from '@mui/material/FormHelperText';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { ArrowLeft } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { CalendarPicker } from '@/components/shared/form-fields/CalendarPicker';
import { Input } from '@/components/shared/form-fields/Input';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { resolveGstSlabRates, toGstDateInputValue } from '@/lib/helpers/gstRatesHelpers';
import {
  GST_RATES_BREADCRUMB_ACTIVE_SX,
  GST_RATES_BREADCRUMB_LINK_SX,
} from '@/lib/helpers/gstRatesNav';
import { menuFormFooterGridSx } from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';
import {
  parseCreateGstRateForm,
  type CreateGstRateFormField,
  type CreateGstRateFormFieldErrors,
} from '@/lib/schemas/menu/gst-rates/createGstRateFormSchema';
import type { CreateGstRateBody, GstRate } from '@/lib/schemas/menu/gstRatesSchema';

export interface CreateGstRateFormProps {
  mode?: 'create' | 'view';
  rate?: GstRate | null;
  submitting?: boolean;
  serverFormError?: string | null;
  serverFieldErrors?: CreateGstRateFormFieldErrors;
  dashboardHref: string;
  gstRatesBasePath: string;
  onCancel: () => void;
  onSubmit: (input: CreateGstRateBody) => void;
  onClearServerError?: () => void;
}

function rateFieldValue(rate: GstRate | null | undefined, key: keyof GstRate): string {
  if (!rate) return '';
  const value = rate[key];
  return typeof value === 'number' ? String(value) : '';
}

const CODE_HELPER = 'Tax slab code for GST compliance.';
const NAME_HELPER = 'Descriptive name printed on invoices.';
const TOTAL_HELPER = 'Auto-calculated from CGST, SGST, and IGST.';
const EFFECTIVE_FROM_HELPER = 'Start date when this GST rate applies.';

/**
 * Create or view GST rate form: rate fields, effective dates, sticky footer actions.
 */
export function CreateGstRateForm({
  mode = 'create',
  rate = null,
  submitting = false,
  serverFormError = null,
  serverFieldErrors = {},
  dashboardHref,
  gstRatesBasePath,
  onCancel,
  onSubmit,
  onClearServerError,
}: Readonly<CreateGstRateFormProps>) {
  const isView = mode === 'view';

  const [code, setCode] = useState(rate?.code ?? '');
  const [name, setName] = useState(rate?.name ?? '');
  const [cgst, setCgst] = useState(rateFieldValue(rate, 'cgst_rate'));
  const [sgst, setSgst] = useState(rateFieldValue(rate, 'sgst_rate'));
  const [igst, setIgst] = useState(rateFieldValue(rate, 'igst_rate'));

  const [effectiveFrom, setEffectiveFrom] = useState<Date | null>(
    toGstDateInputValue(rate?.effective_from),
  );
  const [effectiveTo, setEffectiveTo] = useState<Date | null>(
    toGstDateInputValue(rate?.effective_to),
  );
  const [fieldErrors, setFieldErrors] = useState<CreateGstRateFormFieldErrors>({});
  const [formError, setFormError] = useState<string | null>(null);

  const resolvedSlab = useMemo(() => {
    const c = Number(cgst);
    const s = Number(sgst);
    const i = Number(igst);
    if (Number.isNaN(c) || Number.isNaN(s) || Number.isNaN(i)) return null;
    return resolveGstSlabRates(c, s, i);
  }, [cgst, igst, sgst]);

  const displayTotal = isView
    ? rateFieldValue(rate, 'total_rate')
    : resolvedSlab
      ? String(resolvedSlab.total_rate)
      : '';

  function clearFieldError(field: CreateGstRateFormField) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setFormError(null);
    onClearServerError?.();
  }

  function fieldMessage(field: CreateGstRateFormField, defaultHelper?: string): string | undefined {
    return serverFieldErrors[field] ?? fieldErrors[field] ?? defaultHelper;
  }

  function fieldHasError(field: CreateGstRateFormField): boolean {
    return Boolean(serverFieldErrors[field] ?? fieldErrors[field]);
  }

  function handleSubmit() {
    if (isView) {
      onCancel();
      return;
    }

    const result = parseCreateGstRateForm({
      code,
      name,
      cgst_rate: cgst,
      sgst_rate: sgst,
      igst_rate: igst,
      total_rate: undefined,
      effective_from_date: effectiveFrom,
      effective_to_date: effectiveTo ?? undefined,
    });

    if (!result.success) {
      setFieldErrors(result.fieldErrors);
      setFormError(result.formError ?? null);
      return;
    }

    setFieldErrors({});
    setFormError(null);
    onSubmit(result.data);
  }

  const breadcrumbTail =
    isView && rate?.code ? rate.code : isView ? 'View GST Rate' : 'Create GST Rate';

  const showFormAlert = Boolean(serverFormError || formError);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, height: '100%', minHeight: 0 }}>
      <Breadcrumbs
        items={[
          { label: 'Dashboard', href: dashboardHref },
          {
            label: 'GST Rates',
            href: gstRatesBasePath,
            onClick: (event) => {
              event.preventDefault();
              onCancel();
            },
          },
          { label: breadcrumbTail, active: true },
        ]}
        linkSx={GST_RATES_BREADCRUMB_LINK_SX}
        activeSx={GST_RATES_BREADCRUMB_ACTIVE_SX}
      />

      <Box sx={{ flexShrink: 0 }}>
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

      <Paper
        variant="outlined"
        component="form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
        sx={{
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          borderRadius: 2,
          bgcolor: 'background.paper',
        }}
      >
        <Box
          sx={{
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
            p: { xs: 2, sm: 3 },
          }}
        >
          <Stack spacing={2.5}>
            {showFormAlert ? (
              <Alert severity="error">
                {serverFormError ?? formError ?? 'Fix the highlighted fields below.'}
              </Alert>
            ) : null}

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
                helperText={fieldMessage('code', CODE_HELPER)}
                error={fieldHasError('code')}
                reserveHelperSpace
                value={code}
                disabled={isView || submitting}
                onChange={(event) => {
                  setCode(event.target.value);
                  clearFieldError('code');
                }}
              />
              <Input
                id="gst-name"
                label="GST Name"
                required
                placeholder="e.g. Standard Food (5%)"
                helperText={fieldMessage('name', NAME_HELPER)}
                error={fieldHasError('name')}
                reserveHelperSpace
                value={name}
                disabled={isView || submitting}
                onChange={(event) => {
                  setName(event.target.value);
                  clearFieldError('name');
                }}
              />
              <Input
                id="gst-total"
                label="Total Rate (%)"
                type="number"
                helperText={fieldMessage('total_rate', TOTAL_HELPER)}
                error={fieldHasError('total_rate')}
                reserveHelperSpace
                value={displayTotal}
                disabled
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
                required
                helperText={fieldMessage('cgst_rate')}
                error={fieldHasError('cgst_rate')}
                reserveHelperSpace
                value={cgst}
                disabled={isView || submitting}
                onChange={(event) => {
                  setCgst(event.target.value);
                  clearFieldError('cgst_rate');
                  clearFieldError('total_rate');
                  clearFieldError('igst_rate');
                }}
              />
              <Input
                id="gst-sgst"
                label="SGST (%)"
                type="number"
                required
                helperText={fieldMessage('sgst_rate')}
                error={fieldHasError('sgst_rate')}
                reserveHelperSpace
                value={sgst}
                disabled={isView || submitting}
                onChange={(event) => {
                  setSgst(event.target.value);
                  clearFieldError('sgst_rate');
                  clearFieldError('total_rate');
                  clearFieldError('igst_rate');
                }}
              />
              <Input
                id="gst-igst"
                label="IGST (%)"
                type="number"
                required
                helperText={fieldMessage('igst_rate')}
                error={fieldHasError('igst_rate')}
                reserveHelperSpace
                value={igst}
                disabled={isView || submitting}
                onChange={(event) => {
                  setIgst(event.target.value);
                  clearFieldError('igst_rate');
                  clearFieldError('total_rate');
                }}
              />
            </Box>

            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
                gap: 2,
                maxWidth: { md: 720 },
              }}
            >
              <Box>
                <Typography
                  component="label"
                  sx={{
                    fontSize: '0.875rem',
                    fontWeight: 600,
                    color: 'text.primary',
                    mb: 0.75,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 0.5,
                  }}
                >
                  Effective From
                </Typography>
                <CalendarPicker
                  value={effectiveFrom}
                  onChange={(date) => {
                    setEffectiveFrom(date);
                    clearFieldError('effective_from_date');
                  }}
                  placeholder="dd-mm-yyyy"
                  disabled={isView || submitting}
                  minWidth="100%"
                  sx={{
                    width: '100%',
                    border: '1px solid',
                    borderColor: fieldHasError('effective_from_date') ? 'error.main' : 'divider',
                    borderRadius: '10px',
                  }}
                />
                <FormHelperText
                  error={fieldHasError('effective_from_date')}
                  sx={{ mx: 0, mt: 0.75, minHeight: '1.25rem' }}
                >
                  {fieldMessage('effective_from_date', EFFECTIVE_FROM_HELPER)}
                </FormHelperText>
              </Box>
              <Box>
                <Typography
                  sx={{ fontSize: '0.875rem', fontWeight: 600, color: 'text.primary', mb: 0.75 }}
                >
                  Effective To
                </Typography>
                <CalendarPicker
                  value={effectiveTo}
                  onChange={(date) => {
                    setEffectiveTo(date);
                    clearFieldError('effective_to_date');
                  }}
                  placeholder="dd-mm-yyyy"
                  disabled={isView || submitting}
                  minWidth="100%"
                  sx={{ width: '100%' }}
                />
                {fieldMessage('effective_to_date') ? (
                  <FormHelperText
                    error={fieldHasError('effective_to_date')}
                    sx={{ mx: 0, mt: 0.75 }}
                  >
                    {fieldMessage('effective_to_date')}
                  </FormHelperText>
                ) : null}
              </Box>
            </Box>
          </Stack>
        </Box>

        <Box
          sx={{
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 1.5,
            px: { xs: 2, sm: 3 },
            py: 2,
            borderTop: (theme) => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
          }}
        >
          <ActionButton
            variant="outlined"
            size="small"
            startIcon={<ArrowLeft size={16} />}
            onClick={onCancel}
            disabled={submitting}
            type="button"
            sx={{ flexShrink: 0 }}
          >
            Back
          </ActionButton>
          <Stack direction="row" spacing={1.5} sx={{ flexShrink: 0 }}>
            {!isView ? (
              <ActionButton
                variant="outlined"
                onClick={onCancel}
                disabled={submitting}
                type="button"
              >
                Cancel
              </ActionButton>
            ) : null}
            {!isView ? (
              <ActionButton type="submit" disabled={submitting}>
                {submitting ? 'Creating…' : 'Create GST Rate'}
              </ActionButton>
            ) : (
              <ActionButton
                variant="outlined"
                onClick={onCancel}
                disabled={submitting}
                type="button"
              >
                Close
              </ActionButton>
            )}
          </Stack>
        </Box>
      </Paper>
    </Box>
  );
}
