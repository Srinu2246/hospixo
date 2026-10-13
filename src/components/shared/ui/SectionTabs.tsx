'use client';

import type { SyntheticEvent } from 'react';
import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import type { SxProps, Theme } from '@mui/material/styles';

export type SectionTabItem = Readonly<{
  id: string;
  label: string;
}>;

export type SectionTabsProps = Readonly<{
  items: readonly SectionTabItem[];
  value: string;
  onChange: (tabId: string) => void;
  ariaLabel?: string;
  sx?: SxProps<Theme>;
}>;

export function SectionTabs({
  items,
  value,
  onChange,
  ariaLabel = 'Section tabs',
  sx,
}: SectionTabsProps) {
  function handleChange(_event: SyntheticEvent, nextValue: string) {
    onChange(nextValue);
  }

  return (
    <Box
      sx={{
        width: '100%',
        borderBottom: '1px solid',
        borderColor: 'divider',
        bgcolor: 'background.paper',
        ...((sx as object) || {}),
      }}
    >
      <Tabs
        value={value}
        onChange={handleChange}
        variant="scrollable"
        scrollButtons="auto"
        allowScrollButtonsMobile
        aria-label={ariaLabel}
        sx={{
          minHeight: 48,
          px: { xs: 1, sm: 2 },
          '& .MuiTabs-indicator': {
            height: 2,
            borderRadius: '2px 2px 0 0',
            bgcolor: 'primary.main',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            minHeight: 48,
            minWidth: 'auto',
            px: { xs: 1.5, sm: 2.25 },
            py: 1.25,
            fontSize: '0.875rem',
            fontWeight: 600,
            letterSpacing: '-0.01em',
            color: 'text.secondary',
            '&.Mui-selected': {
              color: 'primary.main',
            },
          },
        }}
      >
        {items.map((item) => (
          <Tab key={item.id} value={item.id} label={item.label} disableRipple />
        ))}
      </Tabs>
    </Box>
  );
}
