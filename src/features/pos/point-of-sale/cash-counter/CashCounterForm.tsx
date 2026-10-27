'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { BadgeCheck, Lock } from 'lucide-react';

import { CashCounterPayments } from '@/components/features/cash-counter';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { useAppShellFooterTarget } from '@/lib/hooks/useAppShellFooterTarget';
import {
  CASH_COUNTER_TYPE_OPTIONS,
  cashCounterFormSchema,
  defaultCashCounterPayments,
  type CashCounter,
  type CashCounterFormValues,
} from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';

const FORM_ID = 'cash-counter-form';

export interface CashCounterFormProps {
  mode: 'create' | 'edit';
  basePath: string;
  branchName: string;
  initial?: CashCounter | null;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: CashCounterFormValues) => void;
}

/**
 * Create / Edit counter — details, payment methods, and status.
 */
export function CashCounterForm({
  mode,
  basePath,
  branchName,
  initial = null,
  submitting = false,
  onCancel,
  onSubmit,
}: Readonly<CashCounterFormProps>) {
  const isEdit = mode === 'edit';
  const outlet = initial?.branch_name || branchName || '—';
  const form = useForm<CashCounterFormValues>({
    resolver: zodResolver(cashCounterFormSchema),
    mode: 'onChange',
    defaultValues: {
      name: initial?.name ?? '',
      code: initial?.code ?? '',
      counter_type: initial?.counter_type ?? 'billing',
      payments: initial?.payments ?? defaultCashCounterPayments,
      status: initial?.status ?? 'active',
    },
  });
  const { control, handleSubmit, trigger, formState } = form;
  const canSave = isEdit ? formState.isDirty && formState.isValid : formState.isValid;
  const footerTarget = useAppShellFooterTarget();

  useEffect(() => {
    void trigger();
  }, [trigger]);

  const footer = (
    <Stack
      component="footer"
      direction={{ xs: 'column', sm: 'row' }}
      spacing={1.5}
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        alignItems: { sm: 'center' },
        justifyContent: 'space-between',
        px: '32px',
        py: 2,
        bgcolor: 'background.paper',
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>
        Changes apply when you save.
      </Typography>
      <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'flex-end' }}>
        <ActionButton variant="outlined" onClick={onCancel} disabled={submitting}>
          Cancel
        </ActionButton>
        <ActionButton type="submit" form={FORM_ID} loading={submitting} disabled={!canSave}>
          {isEdit ? 'Save Changes' : 'Create Counter'}
        </ActionButton>
      </Stack>
    </Stack>
  );

  return (
    <>
      <Stack spacing={2.5} sx={{ width: '100%' }}>
        <Breadcrumbs
          items={[
            {
              label: 'Counters',
              href: basePath,
              onClick: (event) => {
                event.preventDefault();
                onCancel();
              },
            },
            { label: isEdit ? 'Edit Counter' : 'Create Counter', active: true },
          ]}
          linkSx={{
            color: 'text.primary',
            fontWeight: 500,
            '&:hover': { color: 'primary.main', textDecoration: 'underline' },
          }}
          activeSx={{ color: 'primary.main', fontWeight: 600 }}
        />

        <Box>
          <Typography
            component="h1"
            sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.75rem' }, lineHeight: 1.2 }}
          >
            {isEdit ? 'Edit Counter' : 'Create Counter'}
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9375rem' }}>
            {isEdit
              ? 'Update counter details and device configuration for your branch.'
              : 'Add a billing counter and the payment methods it accepts.'}
          </Typography>
        </Box>

        <Box
          component="form"
          id={FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          sx={{
            width: '100%',
            boxSizing: 'border-box',
            p: { xs: 2, md: 2.5 },
            borderRadius: '16px',
            border: '1px solid',
            borderColor: 'divider',
            bgcolor: 'background.paper',
          }}
        >
          <Stack
            direction="row"
            sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1, mb: 2 }}
          >
            <Box>
              <Typography sx={{ fontWeight: 800 }}>Counter Details</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
                {isEdit
                  ? 'Update the basic details for the cash register.'
                  : 'Enter the basic details for the cash register.'}
              </Typography>
            </Box>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.75rem', flexShrink: 0 }}>
              * Required fields
            </Typography>
          </Stack>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr 1fr' },
              gap: 2,
            }}
          >
            <Controller
              name="name"
              control={control}
              render={({ field, fieldState }) => (
                <Input
                  id="counter-name"
                  label="Counter Name"
                  required
                  value={field.value}
                  onChange={field.onChange}
                  onBlur={field.onBlur}
                  placeholder="Counter name"
                  helperText={
                    fieldState.error?.message ?? 'The name used to identify this counter.'
                  }
                  error={Boolean(fieldState.error)}
                />
              )}
            />
            <Controller
              name="code"
              control={control}
              render={({ field, fieldState }) => (
                <Box>
                  <Input
                    id="counter-code"
                    label="Counter Code"
                    required
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    placeholder="POS-01"
                    error={Boolean(fieldState.error)}
                    helperText={fieldState.error?.message}
                    reserveHelperSpace={false}
                  />
                  {!fieldState.error && field.value.trim() ? (
                    <Stack
                      direction="row"
                      spacing={0.5}
                      sx={{ alignItems: 'center', mt: 0.75, color: colors.primary.default }}
                    >
                      <BadgeCheck size={14} />
                      <Typography sx={{ fontSize: '0.75rem', color: 'primary.main' }}>
                        Counter code is valid.
                      </Typography>
                    </Stack>
                  ) : null}
                </Box>
              )}
            />
            <Input
              id="counter-branch"
              label="Branch"
              value={outlet}
              disabled
              endIcon={<Lock size={16} />}
              helperText="Branch is fixed for this counter."
            />
          </Box>

          <Box sx={{ mt: 2, maxWidth: { [screen.desktop]: 280 } }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', mb: 0.75 }}>
              Counter Type{' '}
              <Box component="span" sx={{ color: 'error.main' }}>
                *
              </Box>
            </Typography>
            <Controller
              name="counter_type"
              control={control}
              render={({ field }) => (
                <Dropdown
                  options={CASH_COUNTER_TYPE_OPTIONS}
                  value={field.value}
                  onChange={field.onChange}
                  size="large"
                  minWidth={0}
                  sx={{ width: '100%' }}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: 3 }}>
            <Typography sx={{ fontWeight: 800 }}>Payment Methods</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25, mb: 1.5 }}>
              Select the payment methods accepted at this counter.
            </Typography>
            <Controller
              name="payments"
              control={control}
              render={({ field }) => (
                <CashCounterPayments
                  payments={field.value}
                  onChange={(key, checked) => field.onChange({ ...field.value, [key]: checked })}
                />
              )}
            />
          </Box>

          <Box sx={{ mt: 2.5 }}>
            <Controller
              name="status"
              control={control}
              render={({ field }) => (
                <LabeledSwitch
                  title="Cash Counter Status"
                  hint="Inactive counters will not be available for billing."
                  checked={field.value === 'active'}
                  onChange={(checked) => field.onChange(checked ? 'active' : 'inactive')}
                />
              )}
            />
          </Box>
        </Box>
      </Stack>
      {footerTarget ? createPortal(footer, footerTarget) : footer}
    </>
  );
}
