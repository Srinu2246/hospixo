'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { menuAvailabilityCopy } from '@/features/pos/menu-availability/config';
import type { MenuSurfaceTab } from '@/features/pos/types/menu-availability';

type MenuSurfaceTabsProps = Readonly<{
  value: MenuSurfaceTab;
  onChange: (tab: MenuSurfaceTab) => void;
}>;

const TABS: MenuSurfaceTab[] = ['all', 'online', 'dinein_qr'];

export function MenuSurfaceTabs({ value, onChange }: MenuSurfaceTabsProps) {
  return (
    <Box
      role="tablist"
      aria-label="Menu surfaces"
      sx={{
        display: 'flex',
        gap: 0.5,
        borderBottom: '1px solid',
        borderColor: 'divider',
      }}
    >
      {TABS.map((tab) => {
        const active = value === tab;
        return (
          <ButtonBase
            key={tab}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab)}
            sx={{
              border: 'none',
              bgcolor: 'transparent',
              color: active ? 'primary.main' : 'text.secondary',
              fontSize: '0.875rem',
              fontWeight: 600,
              px: 1.75,
              py: 1.25,
              borderBottom: '2px solid',
              borderBottomColor: active ? 'primary.main' : 'transparent',
              mb: '-1px',
              cursor: 'pointer',
              transition: (theme) => theme.transitions.create(['color', 'border-color']),
              '&:hover': {
                color: 'text.primary',
              },
            }}
          >
            {menuAvailabilityCopy.tabs[tab]}
          </ButtonBase>
        );
      })}
    </Box>
  );
}
