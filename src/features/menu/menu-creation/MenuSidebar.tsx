'use client';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { CategoryNavItem } from '@/components/features/menu/menu-creation/CategoryNavItem';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Card } from '@/components/shared/ui/Card';
import { useMenuCreation } from '@/features/menu/context';

export function MenuSidebar() {
  const {
    pageConfig,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    categoryCounts,
    totalItemCount,
    openCreateCategory,
  } = useMenuCreation();

  return (
    <Card
      component="aside"
      variant="outlined"
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
                inactive={category.status === 'Inactive'}
                onSelect={() => setActiveCategoryId(category.id)}
              />
            </Box>
          ))}
        </Box>

        {pageConfig.canManageCategories ? (
          <ActionButton
            variant="outlined"
            fullWidth
            size="small"
            startIcon={<Plus size={14} />}
            onClick={openCreateCategory}
            sx={{ mt: 'auto', flexShrink: 0 }}
          >
            Add category
          </ActionButton>
        ) : null}
      </Box>
    </Card>
  );
}
