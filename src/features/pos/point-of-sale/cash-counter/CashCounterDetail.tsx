'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Ban, MapPin, Pencil } from 'lucide-react';

import { CashCounterPayments } from '@/components/features/cash-counter';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { LabeledSwitch } from '@/components/shared/form-fields/LabeledSwitch';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import {
  cashCounterTypeLabel,
  type CashCounter,
} from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';
import { screen } from '@/lib/theme/mui/breakpoints';

export interface CashCounterDetailProps {
  counter: CashCounter;
  basePath: string;
  branchName: string;
  onBack: () => void;
  onEdit: () => void;
  onRequestStatusChange: () => void;
}

/**
 * View Counter — details, payment methods, and activate or deactivate.
 */
export function CashCounterDetail({
  counter,
  basePath,
  branchName,
  onBack,
  onEdit,
  onRequestStatusChange,
}: Readonly<CashCounterDetailProps>) {
  const outlet = counter.branch_name || branchName || 'this branch';
  const active = counter.status === 'active';

  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
      <Breadcrumbs
        items={[
          {
            label: 'Counters',
            href: basePath,
            onClick: (event) => {
              event.preventDefault();
              onBack();
            },
          },
          { label: 'View Counter', active: true },
        ]}
        linkSx={{
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
        }}
        activeSx={{ color: 'primary.main', fontWeight: 600 }}
      />

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
        <Box>
          <Typography
            component="h1"
            sx={{ fontWeight: 800, fontSize: { xs: '1.5rem', sm: '1.75rem' }, lineHeight: 1.2 }}
          >
            View Counter
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9375rem' }}>
            Review counter details, assigned devices and billing availability.
          </Typography>
        </Box>
        <ActionButton startIcon={<Pencil size={16} />} onClick={onEdit} sx={{ flexShrink: 0 }}>
          Edit Counter
        </ActionButton>
      </Stack>

      <Box
        sx={{
          mb: 4,
          p: { xs: 2, md: 2.5 },
          borderRadius: '16px',
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Stack
          direction="row"
          spacing={1.5}
          sx={{ alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}
        >
          <Box sx={{ minWidth: 0 }}>
            <Typography sx={{ fontWeight: 800, fontSize: '1.15rem' }}>{counter.name}</Typography>
            <Stack direction="row" spacing={0.75} sx={{ alignItems: 'center', mt: 0.5 }}>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                Counter code: {counter.code || '—'}
              </Typography>
              <Typography sx={{ color: 'text.disabled' }}>·</Typography>
              <MapPin size={14} />
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
                {outlet}
              </Typography>
            </Stack>
          </Box>
          <StatusChip
            label={active ? 'Active' : 'Inactive'}
            variantType={active ? 'success' : 'default'}
            showDot
            size="small"
          />
        </Stack>

        <Box sx={{ borderTop: '1px solid', borderColor: 'divider', mt: 2, pt: 2 }}>
          <Typography sx={{ fontWeight: 800 }}>Counter Details</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
            Basic information for this cash register.
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { [screen.mobile]: '1fr', [screen.desktop]: '1fr 1fr 1fr' },
              gap: 2,
              mt: 2,
            }}
          >
            <Field label="Counter Name" value={counter.name} />
            <Field label="Counter Code" value={counter.code || '—'} />
            <Field label="Branch" value={outlet} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Field label="Counter Type" value={cashCounterTypeLabel(counter.counter_type)} />
          </Box>
        </Box>

        <Box sx={{ mt: 3 }}>
          <Typography sx={{ fontWeight: 800 }}>Payment Methods</Typography>
          <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25, mb: 1.5 }}>
            Select the payment methods accepted at this counter.
          </Typography>
          <CashCounterPayments payments={counter.payments} disabled />
        </Box>

        <Box sx={{ mt: 2.5 }}>
          <LabeledSwitch
            title="Cash Counter Status"
            hint="Inactive counters will not be available for billing."
            checked={active}
            disabled
            onChange={() => undefined}
          />
        </Box>

        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          sx={{
            alignItems: { sm: 'center' },
            justifyContent: 'space-between',
            mt: 2.5,
            pt: 2,
            borderTop: '1px solid',
            borderColor: 'divider',
          }}
        >
          <Box>
            <Typography sx={{ fontWeight: 800 }}>Cash Counter Status</Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
              {active
                ? `Active — available for new billing in ${outlet}.`
                : `Inactive — not available for new billing in ${outlet}.`}
            </Typography>
            <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>
              Inactive counters will not be available for billing.
            </Typography>
          </Box>
          <ActionButton
            variant={active ? 'outlined' : 'primary'}
            startIcon={active ? <Ban size={16} /> : undefined}
            onClick={onRequestStatusChange}
            sx={
              active
                ? {
                    flexShrink: 0,
                    color: colors.danger.default,
                    borderColor: colors.danger.default,
                    '&:hover:not(.Mui-disabled)': {
                      borderColor: colors.danger.dark,
                      bgcolor: 'action.hover',
                    },
                  }
                : { flexShrink: 0 }
            }
          >
            {active ? 'Deactivate Counter' : 'Activate Counter'}
          </ActionButton>
        </Stack>
      </Box>
    </Stack>
  );
}

function Field({ label, value }: Readonly<{ label: string; value: string }>) {
  return (
    <Box>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem' }}>{label}</Typography>
      <Typography sx={{ fontWeight: 700, mt: 0.5 }}>{value}</Typography>
    </Box>
  );
}
