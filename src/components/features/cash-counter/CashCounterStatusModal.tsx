'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Info } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Modal } from '@/components/shared/ui/Modal';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import type { CashCounter } from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';

export function CashCounterStatusModal({
  counter,
  branchName,
  loading = false,
  onClose,
  onConfirm,
}: Readonly<{
  counter: CashCounter | null;
  branchName: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}>) {
  const [confirmed, setConfirmed] = useState(false);
  const open = counter != null;
  const deactivating = counter?.status === 'active';
  const outlet = counter?.branch_name || branchName || 'this branch';

  return (
    <Modal
      open={open}
      onClose={loading ? () => undefined : onClose}
      loading={loading}
      title={deactivating ? 'Deactivate this counter?' : 'Activate this counter?'}
      subtitle={
        counter
          ? deactivating
            ? `${counter.name} will no longer be available for new billing at the ${outlet} branch.`
            : `${counter.name} will become available for new billing at the ${outlet} branch.`
          : undefined
      }
      width={520}
      height="auto"
      padding="24px"
      gap={16}
      footer={
        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', width: '100%' }}>
          <ActionButton variant="outlined" onClick={onClose} disabled={loading}>
            Cancel
          </ActionButton>
          <ActionButton
            variant="primary"
            loading={loading}
            disabled={deactivating && !confirmed}
            onClick={onConfirm}
            sx={
              deactivating
                ? {
                    bgcolor: colors.danger.default,
                    '&:hover:not(.Mui-disabled)': { bgcolor: colors.danger.dark },
                  }
                : undefined
            }
          >
            {deactivating ? 'Deactivate Counter' : 'Activate Counter'}
          </ActionButton>
        </Stack>
      }
    >
      {counter ? (
        <Stack spacing={2}>
          <Stack
            direction="row"
            spacing={1.5}
            sx={{
              alignItems: 'center',
              justifyContent: 'space-between',
              px: 1.75,
              py: 1.5,
              borderRadius: '12px',
              bgcolor: 'action.hover',
            }}
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700 }}>{counter.name}</Typography>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
                {counter.code || 'No code'} · {outlet}
              </Typography>
            </Box>
            <StatusChip
              label={counter.status === 'active' ? 'Active' : 'Inactive'}
              variantType={counter.status === 'active' ? 'success' : 'default'}
              showDot
              size="small"
            />
          </Stack>

          <Stack direction="row" spacing={1} sx={{ alignItems: 'flex-start' }}>
            <Info size={16} style={{ marginTop: 2, flexShrink: 0 }} />
            <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.5 }}>
              {deactivating
                ? 'Existing transactions and billing history will be retained. This does not delete the counter or its device configuration.'
                : 'Assigned devices and existing counter details are retained. Staff can select this counter for new billing once activated.'}
            </Typography>
          </Stack>

          {deactivating ? (
            <>
              <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem', lineHeight: 1.5 }}>
                Finish or close any ongoing billing sessions before continuing. You can reactivate
                this counter later.
              </Typography>
              <FormControlLabel
                sx={{ alignItems: 'flex-start', mx: 0 }}
                control={
                  <Checkbox
                    checked={confirmed}
                    onChange={(_event, checked) => setConfirmed(checked)}
                    color="primary"
                    sx={{ pt: 0.25 }}
                  />
                }
                label={
                  <Typography sx={{ fontSize: '0.875rem', fontWeight: 600 }}>
                    I&apos;ve confirmed there are no ongoing billing sessions.
                  </Typography>
                }
              />
            </>
          ) : null}
        </Stack>
      ) : null}
    </Modal>
  );
}
