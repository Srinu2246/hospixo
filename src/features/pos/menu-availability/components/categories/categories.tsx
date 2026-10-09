'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import type { MenuCategory } from '@/features/pos/types/menu-availability';

type MenuCategoriesProps = Readonly<{
  categories: readonly MenuCategory[];
  activeCategoryId: string | null;
  itemCounts: Record<string, number>;
  enabledByCategory: Record<string, boolean>;
  onSelect: (categoryId: string) => void;
  onToggle: (categoryId: string, enabled: boolean) => void;
}>;

export function MenuCategories({
  categories,
  activeCategoryId,
  itemCounts,
  enabledByCategory,
  onSelect,
  onToggle,
}: MenuCategoriesProps) {
  return (
    <Box
      component="aside"
      aria-label="Menu categories"
      sx={{
        width: '100%',
        maxWidth: { xs: '100%', md: '16.5rem' },
        borderRadius: 2.5,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        flexShrink: 0,
      }}
    >
      <Box
        component="ul"
        sx={{
          m: 0,
          p: 0.75,
          listStyle: 'none',
          display: 'flex',
          flexDirection: 'column',
          gap: 0.3,
        }}
      >
        {categories.map((category, index) => {
          const catKey =
            category.id && String(category.id).trim() && String(category.id) !== 'undefined'
              ? String(category.id)
              : `cat-${category.label || 'category'}-${index}`;
          const active = category.id === activeCategoryId;
          const enabled = enabledByCategory[category.id] ?? category.enabled;
          const count = itemCounts[category.id] ?? 0;

          return (
            <Box component="li" key={catKey}>
              <Box
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.75,
                  borderRadius: 1.5,
                  p: 0.4,
                  bgcolor: active ? '#eff6ff' : 'transparent',
                  transition: (theme) => theme.transitions.create('background-color'),
                }}
              >
                <ButtonBase
                  component="button"
                  type="button"
                  onClick={() => onSelect(category.id)}
                  sx={{
                    flex: 1,
                    minWidth: 0,
                    display: 'flex',
                    alignItems: 'baseline',
                    justifyContent: 'flex-start',
                    gap: 0.75,
                    border: 'none',
                    bgcolor: 'transparent',
                    textAlign: 'left',
                    cursor: 'pointer',
                    px: 1,
                    py: 0.75,
                    color: 'text.primary',
                  }}
                >
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {category.label}
                  </Typography>
                  <Typography
                    component="span"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 500,
                      color: 'text.secondary',
                      flexShrink: 0,
                    }}
                  >
                    [{count}]
                  </Typography>
                </ButtonBase>
                <Box
                  component="button"
                  type="button"
                  role="switch"
                  aria-checked={enabled}
                  aria-label={`${category.label} category ${enabled ? 'on' : 'off'}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(category.id, !enabled);
                  }}
                  sx={{
                    position: 'relative',
                    width: 38,
                    height: 22,
                    borderRadius: 999,
                    border: 'none',
                    cursor: 'pointer',
                    flexShrink: 0,
                    p: 0,
                    bgcolor: enabled ? '#16a34a' : '#cbd5e1',
                    transition: (theme) => theme.transitions.create('background-color'),
                    '&:focus-visible': {
                      outline: '2px solid #2563eb',
                      outlineOffset: '2px',
                    },
                  }}
                >
                  <Box
                    component="span"
                    sx={{
                      position: 'absolute',
                      top: 3,
                      left: 3,
                      width: 16,
                      height: 16,
                      borderRadius: 999,
                      bgcolor: '#fff',
                      boxShadow: '0 1px 2px rgba(15, 23, 42, 0.2)',
                      transform: enabled ? 'translateX(16px)' : 'none',
                      transition: (theme) => theme.transitions.create('transform'),
                    }}
                  />
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
