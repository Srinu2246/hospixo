'use client';

import Box from '@mui/material/Box';

import { getMenuAvailabilityPageConfig } from '@/features/menu/config';
import { MenuAvailabilityProvider } from '@/features/menu/context';
import type { MenuAvailabilityScope } from '@/lib/schemas/menu/menuAvailabilitySchema';

import { MenuAvailabilityContent } from './MenuAvailabilityContent';

export interface MenuAvailabilityLayoutProps {
  scope?: MenuAvailabilityScope;
}

/**
 * Menu Availability layout shell used by branch / company / organization sidebar routes.
 */
export function MenuAvailabilityLayout({
  scope = 'branch',
}: Readonly<MenuAvailabilityLayoutProps>) {
  const pageConfig = getMenuAvailabilityPageConfig(scope);

  return (
    <MenuAvailabilityProvider pageConfig={pageConfig}>
      <Box
        sx={{
          width: '100%',
          height: '100%',
          maxHeight: '100%',
          flex: 1,
          minHeight: 0,
          display: 'flex',
          flexDirection: 'column',
          boxSizing: 'border-box',
          overflow: 'hidden',
          bgcolor: 'background.default',
        }}
      >
        <MenuAvailabilityContent />
      </Box>
    </MenuAvailabilityProvider>
  );
}
