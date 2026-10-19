'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import { alpha } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import { useMenuAvailability } from '@/features/menu/context';

interface CategoryNavItemProps {
  label: string;
  count: number;
  selected: boolean;
  inactive?: boolean;
  onSelect: () => void;
}

function CategoryNavItem({
  label,
  count,
  selected,
  inactive = false,
  onSelect,
}: Readonly<CategoryNavItemProps>) {
  return (
    <ButtonBase
      onClick={onSelect}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 1,
        px: 1.5,
        py: 1.1,
        borderRadius: '8px',
        textAlign: 'left',
        color: selected ? 'primary.main' : 'text.primary',
        bgcolor: selected ? alpha(colors.primary.default, 0.1) : 'transparent',
        opacity: inactive ? 0.65 : 1,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': {
          bgcolor: selected ? alpha(colors.primary.default, 0.15) : 'action.hover',
        },
      }}
    >
      <Typography
        variant="body2"
        noWrap
        sx={{
          fontWeight: selected ? 600 : 500,
          fontSize: '0.875rem',
          color: 'inherit',
          flex: 1,
          minWidth: 0,
        }}
        title={label}
      >
        {label}
      </Typography>
      <Box
        component="span"
        sx={{
          fontSize: '0.875rem',
          fontWeight: selected ? 600 : 500,
          color: selected ? 'primary.main' : 'text.secondary',
          flexShrink: 0,
        }}
      >
        {count}
      </Box>
    </ButtonBase>
  );
}

/** Categories from GET /v1/restaurant/menu/categories (same as Menu Creation). */
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
                inactive={category.status === 'inactive'}
                onSelect={() => setActiveCategoryId(category.id)}
              />
            </Box>
          ))}
        </Box>
      </Box>
    </Card>
  );
}
