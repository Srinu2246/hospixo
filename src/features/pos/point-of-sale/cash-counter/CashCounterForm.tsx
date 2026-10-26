'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Card } from '@/components/shared/ui/Card';
import {
  cashCounterFormSchema,
  type CashCounter,
  type CashCounterFormValues,
} from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface CashCounterFormProps {
  mode: 'create' | 'edit';
  basePath: string;
  initial?: CashCounter | null;
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: CashCounterFormValues) => void;
}

/**
 * Create / Edit cash counter — breadcrumbs, name field, and status toggle (edit only).
 */
export function CashCounterForm({
  mode,
  basePath,
  initial = null,
  submitting = false,
  onCancel,
  onSubmit,
}: Readonly<CashCounterFormProps>) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(initial?.name ?? '');
  const [isActive, setIsActive] = useState(initial?.status !== 'inactive');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const parsed = cashCounterFormSchema.safeParse({
      name: name.trim(),
      status: isEdit ? (isActive ? 'active' : 'inactive') : undefined,
    });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Invalid cash counter.');
      return;
    }
    setError(null);
    onSubmit(parsed.data);
  }

  return (
    <Box
      sx={{
        width: '100%',
        maxWidth: 960,
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
      }}
    >
      <Breadcrumbs
        items={[
          {
            label: 'Cash Counters',
            href: basePath,
            onClick: (event) => {
              event.preventDefault();
              onCancel();
            },
          },
          {
            label: isEdit ? 'Edit Cash Counter' : 'Create Cash Counter',
            active: true,
          },
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
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.875rem' },
            color: 'text.primary',
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {isEdit ? 'Edit Cash Counter' : 'Create Cash Counter'}
        </Typography>
        <Typography
          variant="body2"
          sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9375rem' }}
        >
          {isEdit
            ? 'Update the cash counter name and status only.'
            : 'Enter a name for a new cash counter in the current branch.'}
        </Typography>
      </Box>

      <Card title="Cash Counter Details" padding={3} sx={{ borderRadius: '12px' }}>
        <Stack spacing={2.5}>
          <Input
            label="Name"
            required={!isEdit}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Front desk counter"
            fullWidth
            error={Boolean(error)}
            helperText={
              error ??
              (isEdit
                ? undefined
                : 'Example input only. Name is required; it is the only field in the create payload.')
            }
          />

          {isEdit ? (
            <Box>
              <Typography
                sx={{
                  fontSize: '0.875rem',
                  fontWeight: 600,
                  color: 'text.secondary',
                  mb: 1,
                }}
              >
                Status
              </Typography>
              <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
                <Switch
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  color="primary"
                  sx={{
                    '& .MuiSwitch-switchBase.Mui-checked': {
                      color: colors.primary.default,
                    },
                    '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                      backgroundColor: colors.primary.default,
                    },
                  }}
                />
                <Typography sx={{ fontSize: '0.9375rem', fontWeight: 500, color: 'text.primary' }}>
                  {isActive ? 'Active' : 'Inactive'}
                </Typography>
              </Stack>
            </Box>
          ) : null}
        </Stack>
      </Card>

      <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
        <ActionButton variant="outlined" onClick={onCancel} disabled={submitting}>
          Cancel
        </ActionButton>
        <ActionButton
          variant="primary"
          startIcon={<Check size={16} />}
          loading={submitting}
          onClick={handleSubmit}
          sx={{
            bgcolor: colors.primary.default,
            boxShadow: 'none',
            '&:hover': { bgcolor: colors.primary.dark },
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Cash Counter'}
        </ActionButton>
      </Stack>
    </Box>
  );
}
