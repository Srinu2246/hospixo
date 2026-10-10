'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputBase from '@mui/material/InputBase';
import { Search } from 'lucide-react';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';

type MenuToolbarProps = Readonly<{
  query: string;
  onQueryChange: (value: string) => void;
}>;

export function MenuToolbar({ query, onQueryChange }: MenuToolbarProps) {
  return (
    <Box
      sx={{
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        gap: 1.5,
      }}
    >
      <Box
        component="label"
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 1,
          flex: '1 1 14rem',
          minWidth: 0,
          px: 1.75,
          py: 0.9,
          borderRadius: 2,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: 'background.paper',
        }}
      >
        <Search
          size={16}
          style={{ flexShrink: 0, color: 'var(--muted-foreground, #64748b)' }}
          aria-hidden="true"
        />
        <InputBase
          type="search"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={menuAvailabilityCopy.searchPlaceholder}
          sx={{
            width: '100%',
            fontSize: '0.875rem',
            color: 'text.primary',
            '& input': {
              p: 0,
            },
          }}
        />
      </Box>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
        <Button
          type="button"
          variant="outlined"
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            fontWeight: 600,
            px: 1.5,
            py: 0.9,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'grey.400',
            },
          }}
        >
          {menuAvailabilityCopy.quickSection}
        </Button>
        <Button
          type="button"
          variant="outlined"
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            fontWeight: 600,
            px: 1.5,
            py: 0.9,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'grey.400',
            },
          }}
        >
          {menuAvailabilityCopy.addonOn}
        </Button>
        <Button
          type="button"
          variant="outlined"
          sx={{
            borderColor: 'divider',
            color: 'text.secondary',
            fontSize: '0.8125rem',
            fontWeight: 600,
            px: 1.5,
            py: 0.9,
            borderRadius: 1.5,
            bgcolor: 'background.paper',
            textTransform: 'none',
            '&:hover': {
              bgcolor: 'action.hover',
              borderColor: 'grey.400',
            },
          }}
        >
          {menuAvailabilityCopy.storeOn}
        </Button>
      </Box>
    </Box>
  );
}
