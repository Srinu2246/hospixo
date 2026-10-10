'use client';

import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { openOrdersPillFilters } from '@/features/pos/config/open-orders';

interface OpenOrdersFiltersProps {
  activeType: OpenOrderType;
  onChange: (type: OpenOrderType) => void;
}

export function OpenOrdersFilters({ activeType, onChange }: Readonly<OpenOrdersFiltersProps>) {
  return (
    <Stack
      component="fieldset"
      direction="row"
      aria-label="Filter open orders"
      sx={{ p: 0, m: 0, mb: 2, border: 0, flexWrap: 'wrap', gap: 1 }}
    >
      <legend className="sr-only">Filter open orders</legend>
      {openOrdersPillFilters.map((filter) => {
        const active = filter.id === activeType;
        return (
          <Button
            key={filter.id}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(filter.id)}
            variant={active ? 'contained' : 'outlined'}
            sx={{
              minHeight: 32,
              px: 1.75,
              borderColor: active ? 'var(--pos-primary)' : 'var(--pos-border-strong)',
              borderRadius: 999,
              bgcolor: active ? 'var(--pos-primary)' : 'var(--pos-surface)',
              color: active ? '#fff' : 'text.secondary',
              fontSize: 12,
              fontWeight: 600,
              textTransform: 'none',
            }}
          >
            {filter.label}
          </Button>
        );
      })}
    </Stack>
  );
}
