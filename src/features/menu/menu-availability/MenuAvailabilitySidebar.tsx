'use client';

import { useMemo } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { MenuCategoryCompactTabs } from '@/components/features/menu/MenuCategoryCompactTabs';
import { MenuCategoryNavRow } from '@/components/features/menu/MenuCategoryNavRow';
import { Card } from '@/components/shared/ui/Card';
import { useMenuAvailability } from '@/features/menu/context';
import {
  buildMenuCategoryTabs,
  menuCategoryIdFromTab,
  menuCategoryTabValue,
} from '@/lib/helpers/menu/menuCategoryHelpers';
import { menuCategoryListItemSx, menuCategoryListSx } from '@/lib/helpers/menu/menuLayout';
import { screen } from '@/lib/theme/mui/breakpoints';

/** Categories from GET /v1/restaurant/menu/categories (same as Menu Creation). */
export function MenuAvailabilitySidebar() {
  const { categories, activeCategoryId, setActiveCategoryId, categoryCounts, totalItemCount } =
    useMenuAvailability();

  const activeTabValue = menuCategoryTabValue(activeCategoryId);

  const categoryTabs = useMemo(
    () => buildMenuCategoryTabs(categories, categoryCounts, totalItemCount),
    [categories, categoryCounts, totalItemCount],
  );

  function handleTabChange(value: string) {
    setActiveCategoryId(menuCategoryIdFromTab(value));
  }

  return (
    <Card
      component="aside"
      variant="outlined"
      padding={2}
      sx={{
        width: { xs: '100%', md: 240 },
        flexShrink: 0,
        alignSelf: 'stretch',
        height: { md: '100%' },
        overflow: {
          [screen.mobile]: 'visible',
          [screen.tablet]: 'visible',
          [screen.desktop]: 'auto',
        },
      }}
    >
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          gap: 1.25,
          height: '100%',
          minHeight: 0,
        }}
      >
        <Typography
          sx={{
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Categories
        </Typography>

        <MenuCategoryCompactTabs
          tabs={categoryTabs}
          value={activeTabValue}
          onChange={handleTabChange}
        />

        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            ...menuCategoryListSx,
            display: {
              [screen.mobile]: 'none',
              [screen.tablet]: 'none',
              [screen.desktop]: 'flex',
            },
            flexDirection: 'column',
          }}
        >
          <Box component="li" sx={menuCategoryListItemSx}>
            <MenuCategoryNavRow
              label="All Items"
              count={totalItemCount}
              selected={activeCategoryId === null}
              onSelect={() => setActiveCategoryId(null)}
            />
          </Box>

          {categories.map((category) => (
            <Box component="li" key={category.id} sx={menuCategoryListItemSx}>
              <MenuCategoryNavRow
                label={category.name}
                count={categoryCounts[category.id] ?? 0}
                selected={activeCategoryId === category.id}
                active={category.status !== 'inactive'}
                onSelect={() => setActiveCategoryId(category.id)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
