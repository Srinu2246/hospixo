'use client';

import Box from '@mui/material/Box';

import { getMenuCreationPageConfig } from '@/features/menu/config';
import { MenuCreationProvider } from '@/features/menu/context';
import type { MenuCreationScope } from '@/lib/schemas/menu/menuCreationSchema';

import { MenuContent } from './MenuContent';

export interface MenuCreationLayoutProps {
  scope?: MenuCreationScope;
}

/**
 * Menu Creation layout shell used by company / branch / organization sidebar routes.
 * Categories rail starts at the top; page header and tools live in the right pane.
 */
export function MenuCreationLayout({ scope = 'company' }: Readonly<MenuCreationLayoutProps>) {
  const pageConfig = getMenuCreationPageConfig(scope);

  return (
    <MenuCreationProvider pageConfig={pageConfig}>
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
        <MenuContent />
      </Box>
    </MenuCreationProvider>
  );
}
