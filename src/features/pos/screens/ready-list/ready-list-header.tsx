'use client';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Search } from 'lucide-react';

import { readyListPageMeta, type ReadyListTab } from '@/features/pos/config/ready-list';

export type ReadyListTabOption = Readonly<{
  id: ReadyListTab;
  label: string;
  count?: number;
}>;

interface ReadyListHeaderProps {
  query: string;
  onQueryChange: (value: string) => void;
  activeTab: ReadyListTab;
  onTabChange: (tab: ReadyListTab) => void;
  tabs: readonly ReadyListTabOption[];
  activeCount: number;
  /** Hide title row when mobile chrome already shows the title. */
  hideTitle?: boolean;
}

export function ReadyListHeader({
  query,
  onQueryChange,
  activeTab,
  onTabChange,
  tabs,
  activeCount,
  hideTitle = false,
}: Readonly<ReadyListHeaderProps>) {
  return (
    <Stack spacing={2.5} sx={{ mb: 2.25 }}>
      <Stack
        direction={{ xs: 'column', sm: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', sm: 'center' }, justifyContent: 'space-between' }}
      >
        <TextField
          type="search"
          size="small"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder={readyListPageMeta.searchPlaceholder}
          slotProps={{
            htmlInput: { 'aria-label': 'Search ready orders' },
            input: {
              startAdornment: (
                <InputAdornment position="start">
                  <Search size={16} aria-hidden />
                </InputAdornment>
              ),
            },
          }}
          sx={{
            width: { xs: '100%', sm: 290 },
            '& .MuiOutlinedInput-root': {
              minHeight: 34,
              borderRadius: 0.75,
              bgcolor: 'var(--muted)',
              fontSize: 10,
            },
            '& .MuiOutlinedInput-notchedOutline': { borderColor: '#f0f1f4' },
          }}
        />
        <Box
          component="span"
          sx={{
            alignSelf: { xs: 'flex-start', sm: 'center' },
            px: 1.125,
            py: 0.75,
            borderRadius: 999,
            bgcolor: '#d1fae5',
            color: '#065f46',
            fontSize: 9,
            fontWeight: 700,
            whiteSpace: 'nowrap',
          }}
        >
          {readyListPageMeta.onlineStatusLabel}
        </Box>
      </Stack>

      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={{ alignItems: { xs: 'stretch', md: 'center' }, justifyContent: 'space-between' }}
      >
        {!hideTitle ? (
          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Typography
              component="h1"
              sx={{
                m: 0,
                fontSize: { xs: 22, md: 28 },
                fontWeight: 750,
                letterSpacing: '-0.035em',
              }}
            >
              {readyListPageMeta.title}
            </Typography>
            <Box
              component="span"
              sx={{
                display: 'grid',
                placeItems: 'center',
                minWidth: 22,
                height: 22,
                px: 0.75,
                borderRadius: 999,
                bgcolor: '#d1fae5',
                color: '#065f46',
                fontSize: 10,
                fontWeight: 700,
              }}
            >
              {activeCount}
            </Box>
          </Stack>
        ) : null}

        <Stack
          component="div"
          direction="row"
          role="tablist"
          aria-label="Ready order filters"
          sx={{ flexWrap: 'wrap', gap: 0.5 }}
        >
          {tabs.map((tab) => {
            const isActive = tab.id === activeTab;
            return (
              <Button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => onTabChange(tab.id)}
                variant={isActive ? 'contained' : 'text'}
                sx={{
                  minHeight: 30,
                  px: 1.875,
                  borderRadius: 999,
                  bgcolor: isActive ? 'var(--pos-primary)' : 'transparent',
                  color: isActive ? '#fff' : '#52525b',
                  fontSize: 10,
                  fontWeight: 600,
                  textTransform: 'none',
                  boxShadow: 'none',
                  '&:hover': {
                    bgcolor: isActive ? 'var(--pos-primary-hover)' : 'action.hover',
                    boxShadow: 'none',
                  },
                }}
              >
                {tab.label}
                {tab.count != null ? ` (${tab.count})` : ''}
              </Button>
            );
          })}
        </Stack>
      </Stack>
    </Stack>
  );
}
