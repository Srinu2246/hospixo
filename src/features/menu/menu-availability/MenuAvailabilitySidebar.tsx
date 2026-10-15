'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

import { CategoryNavItem } from '@/components/features/menu/menu-creation/CategoryNavItem';
import { Card } from '@/components/shared/ui/Card';
import { useMenuAvailability } from '@/features/menu/context';

export function MenuAvailabilitySidebar() {
  const { categories, activeCategoryId, setActiveCategoryId, categoryCounts, totalItemCount } =
    useMenuAvailability();

  return (
    <Card
      component="aside"
      variant="outlined"
      padding={1.5}
      sx={{
        width: { xs: '100%', md: 240 },
        flexShrink: 0,
        alignSelf: 'stretch',
        height: { md: '100%' },
        overflow: 'auto',
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
            px: 1.5,
            fontSize: '0.6875rem',
            fontWeight: 700,
            letterSpacing: '0.08em',
            textTransform: 'uppercase',
            color: 'text.secondary',
          }}
        >
          Categories
        </Typography>

        <Box
          component="ul"
          sx={{
            listStyle: 'none',
            p: 0,
            m: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 0.25,
            flex: 1,
            minHeight: 0,
            overflow: 'auto',
          }}
        >
          <Box component="li">
            <CategoryNavItem
              label="All Items"
              count={totalItemCount}
              selected={activeCategoryId === null}
              onSelect={() => setActiveCategoryId(null)}
            />
          </Box>

          {categories.map((category) => (
            <Box component="li" key={category.id}>
              <CategoryNavItem
                label={category.name}
                count={categoryCounts[category.id] ?? 0}
                selected={activeCategoryId === category.id}
                onSelect={() => setActiveCategoryId(category.id)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
