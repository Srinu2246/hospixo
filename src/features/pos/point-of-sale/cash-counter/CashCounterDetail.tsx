'use client';

import Box from '@mui/material/Box';
import Divider from '@mui/material/Divider';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Pencil } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Card } from '@/components/shared/ui/Card';
import type { CashCounter } from '@/lib/schemas/pos/point-of-sale/cash-counter/cashCounterSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface CashCounterDetailProps {
  counter: CashCounter;
  basePath: string;
  onBack: () => void;
  onEdit: () => void;
}

const DETAIL_FIELDS: ReadonlyArray<{ key: keyof CashCounter; label: string }> = [
  { key: 'id', label: 'Id' },
  { key: 'branch_id', label: 'branch_id' },
  { key: 'name', label: 'name' },
  { key: 'status', label: 'status' },
  { key: 'open_shift_id', label: 'open_shift_id' },
];

/**
 * Read-only cash counter detail with breadcrumbs and edit action.
 */
export function CashCounterDetail({
  counter,
  basePath,
  onBack,
  onEdit,
}: Readonly<CashCounterDetailProps>) {
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
              onBack();
            },
          },
          {
            label: counter.name || 'Cash Counter Details',
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

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'flex-start' }, justifyContent: 'space-between' }}
      >
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
            Cash Counter Details
          </Typography>
          <Typography
            variant="body2"
            sx={{ mt: 0.75, color: 'text.secondary', fontSize: '0.9375rem' }}
          >
            View the five response fields for the selected cash counter.
          </Typography>
        </Box>

        <ActionButton
          variant="primary"
          startIcon={<Pencil size={16} />}
          onClick={onEdit}
          sx={{
            flexShrink: 0,
            bgcolor: colors.primary.default,
            boxShadow: 'none',
            '&:hover': { bgcolor: colors.primary.dark },
          }}
        >
          Edit Cash Counter
        </ActionButton>
      </Stack>

      <Card
        title="Cash Counter Details"
        subtitle="Read-only response. Braced values are symbolic placeholders, not API data."
        padding={0}
        headerPadding={2.5}
        sx={{ borderRadius: '12px' }}
      >
        <Box sx={{ px: 2.5, pb: 1 }}>
          {DETAIL_FIELDS.map((field, index) => {
            const value = counter[field.key];
            const display =
              value === null || value === undefined
                ? '—'
                : typeof value === 'string'
                  ? value
                  : String(value);

            return (
              <Box key={field.key}>
                {index > 0 ? <Divider /> : null}
                <Stack
                  direction="row"
                  spacing={2}
                  sx={{
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    py: 1.75,
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.secondary',
                      minWidth: 140,
                    }}
                  >
                    {field.label}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.9375rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      textAlign: 'right',
                      flex: 1,
                    }}
                  >
                    {display}
                  </Typography>
                </Stack>
              </Box>
            );
          })}
        </Box>
      </Card>
    </Box>
  );
}
