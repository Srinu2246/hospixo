'use client';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, SquarePen } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { StatusChip } from '@/components/shared/ui/StatusChip';
import {
  cashCounterTypeLabel,
  type CashCounter,
} from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { screen } from '@/lib/theme/mui/breakpoints';

export interface CashCounterListProps {
  rows: readonly CashCounter[];
  branchName: string;
  onCreate: () => void;
  onOpen: (row: CashCounter) => void;
  onRequestStatusChange: (row: CashCounter) => void;
}

/**
 * Counters list — title, create action, and one card per counter.
 */
export function CashCounterList({
  rows,
  branchName,
  onCreate,
  onOpen,
  onRequestStatusChange,
}: Readonly<CashCounterListProps>) {
  return (
    <Stack spacing={2.5} sx={{ width: '100%' }}>
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
            Counters
          </Typography>
          <Typography sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9375rem' }}>
            Manage billing counters and their devices across your branches.
          </Typography>
        </Box>
        <ActionButton startIcon={<Plus size={16} />} onClick={onCreate} sx={{ flexShrink: 0 }}>
          Create Counter
        </ActionButton>
      </Stack>

      {rows.length === 0 ? (
        <Typography sx={{ color: 'text.secondary', py: 6, textAlign: 'center' }}>
          No counters for this branch yet.
        </Typography>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              [screen.mobile]: '1fr',
              [screen.tablet]: '1fr 1fr',
              [screen.desktop]: '1fr 1fr 1fr',
            },
            gap: 2,
          }}
        >
          {rows.map((row) => {
            const outlet = row.branch_name || branchName || '—';
            const active = row.status === 'active';
            return (
              <Box
                key={row.id}
                role="button"
                tabIndex={0}
                aria-label={`Open ${row.name}`}
                onClick={() => onOpen(row)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    onOpen(row);
                  }
                }}
                sx={{
                  p: 2,
                  borderRadius: '16px',
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: 'background.paper',
                  cursor: 'pointer',
                  '&:hover': { borderColor: 'primary.light' },
                }}
              >
                <Stack
                  direction="row"
                  sx={{ justifyContent: 'space-between', alignItems: 'flex-start', gap: 1 }}
                >
                  <Box sx={{ minWidth: 0 }}>
                    <Typography sx={{ fontWeight: 700, color: 'primary.main' }}>
                      {row.name}
                    </Typography>
                    <Typography sx={{ color: 'text.secondary', fontSize: '0.8125rem', mt: 0.25 }}>
                      {row.code || 'No code'}
                    </Typography>
                  </Box>
                  <StatusChip
                    label={active ? 'Active' : 'Inactive'}
                    variantType={active ? 'success' : 'default'}
                    size="small"
                  />
                </Stack>

                <Stack spacing={1.25} sx={{ mt: 2 }}>
                  <DetailRow label="Branch" value={outlet} />
                  <DetailRow label="Type" value={cashCounterTypeLabel(row.counter_type)} />
                  <DetailRow label="POS device" value={row.pos_device || '—'} accent />
                </Stack>

                <Stack
                  direction="row"
                  sx={{
                    justifyContent: 'flex-end',
                    mt: 2,
                    pt: 1.25,
                    borderTop: '1px solid',
                    borderColor: 'divider',
                  }}
                  onClick={(event) => event.stopPropagation()}
                  onKeyDown={(event) => event.stopPropagation()}
                >
                  <ActionButton
                    variant="text"
                    size="small"
                    startIcon={<SquarePen size={15} />}
                    onClick={() => onRequestStatusChange(row)}
                  >
                    {active ? 'Deactivate' : 'Activate'}
                  </ActionButton>
                </Stack>
              </Box>
            );
          })}
        </Box>
      )}
    </Stack>
  );
}

function DetailRow({
  label,
  value,
  accent = false,
}: Readonly<{ label: string; value: string; accent?: boolean }>) {
  return (
    <Stack direction="row" spacing={2} sx={{ justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ color: 'text.secondary', fontSize: '0.875rem' }}>{label}</Typography>
      <Typography
        sx={{
          fontWeight: 700,
          fontSize: '0.875rem',
          textAlign: 'right',
          color: accent ? 'primary.main' : 'text.primary',
        }}
      >
        {value}
      </Typography>
    </Stack>
  );
}
