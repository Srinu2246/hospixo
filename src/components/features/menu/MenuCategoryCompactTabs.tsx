'use client';

import Box from '@mui/material/Box';

import { Tabs } from '@/components/shared/form-fields/Tabs';
import { screen } from '@/lib/theme/mui/breakpoints';

export interface MenuCategoryCompactTabsProps {
  tabs: ReadonlyArray<{ value: string; label: string }>;
  value: string;
  onChange: (value: string) => void;
}

/** Horizontal category tabs on mobile/tablet; hidden on desktop via layout sx. */
export function MenuCategoryCompactTabs({
  tabs,
  value,
  onChange,
}: Readonly<MenuCategoryCompactTabsProps>) {
  return (
    <Box
      sx={{
        display: {
          [screen.mobile]: 'block',
          [screen.tablet]: 'block',
          [screen.desktop]: 'none',
        },
        flexShrink: 0,
      }}
    >
      <Tabs tabs={[...tabs]} value={value} onChange={onChange} fullWidth={false} scrollable />
    </Box>
  );
}
