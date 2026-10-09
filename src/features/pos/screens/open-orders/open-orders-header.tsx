'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';

import type { OpenOrderType } from '@/features/pos/config/open-orders';
import { openOrdersPageMeta, openOrdersTopFilters } from '@/features/pos/config/open-orders';

interface OpenOrdersHeaderProps {
  activeType: OpenOrderType;
  searchQuery: string;
  onTypeChange: (type: OpenOrderType) => void;
  onSearchChange: (query: string) => void;
}

export function OpenOrdersHeader({
  activeType,
  searchQuery,
  onTypeChange,
  onSearchChange,
}: Readonly<OpenOrdersHeaderProps>) {
  return (
    <Stack component="header" spacing={2} sx={{ mb: 2 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'flex-start', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <Typography
          component="h1"
          sx={{ fontSize: { xs: 28, md: 36 }, fontWeight: 700, lineHeight: 1.1 }}
        >
          {openOrdersPageMeta.title}
        </Typography>
        <Stack
          component="nav"
          direction="row"
          useFlexGap
          aria-label="Order type filters"
          sx={{ flexWrap: 'wrap', gap: 1 }}
        >
          {openOrdersTopFilters.map((filter) => {
            const active = filter.id === activeType;
            return (
              <Button
                key={filter.id}
                type="button"
                aria-pressed={active}
                onClick={() => onTypeChange(filter.id)}
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
      </Stack>

      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={1.5}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' } }}
      >
        <TextField
          type="search"
          size="small"
          value={searchQuery}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder={openOrdersPageMeta.searchPlaceholder}
          slotProps={{
            htmlInput: { 'aria-label': 'Search open orders' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={18} aria-hidden />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: '100%',
            maxWidth: { sm: 420 },
            '& .MuiOutlinedInput-root': { minHeight: 44, borderRadius: 999 },
            '& .MuiInputBase-input': { fontSize: 14 },
          }}
        />
        <Tooltip title="Order data syncs automatically">
          <Box
            component="span"
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              alignSelf: { xs: 'flex-start', sm: 'center' },
              minHeight: 36,
              px: 1.5,
              borderRadius: 999,
              bgcolor: '#d1fae5',
              color: '#022c22',
              fontSize: 13,
              fontWeight: 600,
              whiteSpace: 'nowrap',
            }}
          >
            {openOrdersPageMeta.syncLabel}
          </Box>
        </Tooltip>
      </Stack>
    </Stack>
  );
}
