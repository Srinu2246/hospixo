'use client';

import Box from '@mui/material/Box';

import { getMenuCreationPageConfig } from '@/features/menu/config';
import { MenuCreationProvider } from '@/features/menu/context';
import { MenuContent } from './MenuContent';
import type {
  MenuCreationScope,
  MenuCreationViewMode,
} from '@/lib/schemas/menu/menuCreationSchema';

export interface MenuCreationLayoutProps {
  scope?: MenuCreationScope;
  initialViewMode?: MenuCreationViewMode;
  initialItemId?: string;
  /** Category id from `?category=` so selection survives refresh. */
  initialCategoryId?: string;
}

/**
 * Menu Creation layout shell used by company / branch / organization sidebar routes.
 * Categories rail starts at the top; page header and tools live in the right pane.
 */
export function MenuCreationLayout({
  scope = 'company',
  initialViewMode = 'list',
  initialItemId,
  initialCategoryId,
}: Readonly<MenuCreationLayoutProps>) {
  const pageConfig = getMenuCreationPageConfig(scope);

  return (
    <MenuCreationProvider
      pageConfig={pageConfig}
      initialViewMode={initialViewMode}
      initialItemId={initialItemId}
      initialCategoryId={initialCategoryId}
    >
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
