'use client';

import { Box, Button, Card, InputAdornment, TextField } from '@mui/material';
import { Search } from 'lucide-react';

export type StatusFilterTab = 'all' | 'active' | 'inactive';

type EntityListToolbarProps = Readonly<{
  searchQuery: string;
  onSearchChange: (value: string) => void;
  searchPlaceholder: string;
  statusFilter: StatusFilterTab;
  onStatusFilterChange: (status: StatusFilterTab) => void;
  counts: Readonly<{ all: number; active: number; inactive: number }>;
}>;

export function EntityListToolbar({
  searchQuery,
  onSearchChange,
  searchPlaceholder,
  statusFilter,
  onStatusFilterChange,
  counts,
}: EntityListToolbarProps) {
  return (
    <Card
      variant="outlined"
      sx={{
        borderRadius: '0.75rem',
        p: { xs: 1, sm: 1.25 },
        bgcolor: 'background.paper',
        borderColor: 'divider',
        boxShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1.25,
        flexShrink: 0,
      }}
    >
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
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
          minWidth: { xs: '100%', sm: 300 },
          '& .MuiOutlinedInput-root': {
            borderRadius: '0.5rem',
            fontSize: '0.875rem',
          },
        }}
      />

      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
        {(['all', 'active', 'inactive'] as const).map((tab) => {
          const active = statusFilter === tab;
          const count = counts[tab];

          return (
            <Button
              key={tab}
              size="small"
              variant={active ? 'contained' : 'outlined'}
              onClick={() => onStatusFilterChange(tab)}
              sx={{
                borderRadius: '0.5rem',
                textTransform: 'capitalize',
                fontWeight: 600,
                fontSize: '0.8125rem',
                minWidth: 80,
                borderColor: active ? 'primary.main' : 'divider',
                color: active ? 'primary.contrastText' : 'text.primary',
                bgcolor: active ? 'primary.main' : 'background.paper',
                '&:hover': {
                  bgcolor: active ? 'primary.dark' : 'action.hover',
                  borderColor: active ? 'primary.main' : 'text.secondary',
                },
              }}
            >
              {tab} ({count})
            </Button>
          );
        })}
      </Box>
    </Card>
  );
}
