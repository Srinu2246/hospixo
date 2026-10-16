'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import InputAdornment from '@mui/material/InputAdornment';
import TextField from '@mui/material/TextField';
import type { SxProps, Theme } from '@mui/material/styles';
import { Search } from 'lucide-react';

import { screen } from '@/lib/theme/mui/breakpoints';
import { colors } from '@/lib/theme/mui/colors';

export type EntityStatusFilter = 'all' | 'active' | 'inactive';

const STATUS_TABS: readonly EntityStatusFilter[] = ['all', 'active', 'inactive'];

export interface EntityListToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  statusFilter: EntityStatusFilter;
  onStatusFilterChange: (status: EntityStatusFilter) => void;
  counts: Readonly<Record<EntityStatusFilter, number>>;
  sx?: SxProps<Theme>;
}

export function EntityListToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  statusFilter,
  onStatusFilterChange,
  counts,
  sx,
}: Readonly<EntityListToolbarProps>) {
  return (
    <Card
      variant="outlined"
      sx={[
        {
          borderRadius: '0.75rem',
          p: { [screen.mobile]: 1, [screen.tablet]: 1.25 },
          bgcolor: 'background.paper',
          borderColor: 'divider',
          boxShadow: colors.entityList.cardShadow,
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1.25,
        },
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
    >
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(event) => onSearchChange(event.target.value)}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <Search size={16} />
              </InputAdornment>
            ),
          },
        }}
        sx={{
          minWidth: { [screen.mobile]: '100%', [screen.tablet]: 300 },
          '& .MuiOutlinedInput-root': { borderRadius: '0.5rem', fontSize: '0.875rem' },
        }}
      />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {STATUS_TABS.map((tab) => {
          const selected = statusFilter === tab;
          return (
            <Button
              key={tab}
              size="small"
              variant={selected ? 'contained' : 'outlined'}
              onClick={() => onStatusFilterChange(tab)}
              sx={{
                borderRadius: '0.5rem',
                textTransform: 'capitalize',
                fontWeight: 600,
                fontSize: '0.8125rem',
                minWidth: 80,
                borderColor: selected ? 'primary.main' : 'divider',
                color: selected ? 'primary.contrastText' : 'text.primary',
                bgcolor: selected ? 'primary.main' : 'background.paper',
                '&:hover': {
                  bgcolor: selected ? 'primary.dark' : 'action.hover',
                  borderColor: selected ? 'primary.main' : 'text.secondary',
                },
              }}
            >
              {tab} ({counts[tab]})
            </Button>
          );
        })}
      </Box>
    </Card>
  );
}
