'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Switch from '@mui/material/Switch';
import Alert from '@mui/material/Alert';
import AddIcon from '@mui/icons-material/Add';

import { useMenu } from '../../context/menu-context';
import { CategoriesSidebarSkeleton } from '../skeleton/categories-sidebar-skeleton';

export function CategoriesSidebar() {
  const {
    pageConfig,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    categoryCounts,
    totalItemCount,
    openCreateCategoryPage,
    categoriesLoading,
    categoriesError,
    deactivateCategory,
    activateCategory,
  } = useMenu();
  const [toggleError, setToggleError] = useState<string | null>(null);

  if (categoriesLoading) {
    return <CategoriesSidebarSkeleton />;
  }

  return (
    <Paper
      variant="outlined"
      component="aside"
      sx={{
        width: { xs: '100%', md: 260 },
        flexShrink: 0,
        p: 2,
        bgcolor: 'background.paper',
        display: 'flex',
        flexDirection: 'column',
        gap: 1.5,
      }}
    >
      <Typography
        variant="h6"
        sx={{ fontSize: '1rem', fontWeight: 600, color: 'text.primary', px: 0.5 }}
      >
        Categories
      </Typography>

      {categoriesError && (
        <Alert severity="error" sx={{ py: 0.5 }}>
          {categoriesError}
        </Alert>
      )}
      {toggleError && (
        <Alert severity="warning" sx={{ py: 0.5 }}>
          {toggleError}
        </Alert>
      )}

      <Box
        component="ul"
        sx={{ listStyle: 'none', p: 0, m: 0, display: 'flex', flexDirection: 'column', gap: 0.5 }}
      >
        {/* All Items Option */}
        <Box component="li">
          <Button
            fullWidth
            onClick={() => setActiveCategoryId(null)}
            sx={{
              justifyContent: 'space-between',
              textTransform: 'none',
              px: 1.5,
              py: 1,
              color: activeCategoryId === null ? 'primary.main' : 'text.primary',
              bgcolor: activeCategoryId === null ? 'action.selected' : 'transparent',
              fontWeight: activeCategoryId === null ? 600 : 500,
              '&:hover': {
                bgcolor: activeCategoryId === null ? 'action.selected' : 'action.hover',
              },
            }}
          >
            <Typography variant="body2" sx={{ fontWeight: 'inherit', textAlign: 'left' }}>
              All Items
            </Typography>
            <Chip
              label={totalItemCount}
              size="small"
              sx={{
                height: 20,
                fontSize: '0.75rem',
                fontWeight: 600,
                bgcolor: activeCategoryId === null ? 'primary.main' : 'action.focus',
                color: activeCategoryId === null ? 'primary.contrastText' : 'text.secondary',
              }}
            />
          </Button>
        </Box>

        {/* Individual Categories */}
        {categories.map((cat) => {
          const isActive = activeCategoryId === cat.id;
          const count = categoryCounts[cat.id] ?? 0;
          const isInactive = cat.status === 'Inactive';

          return (
            <Box key={cat.id} component="li">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                <Button
                  fullWidth
                  onClick={() => setActiveCategoryId(cat.id)}
                  sx={{
                    flex: 1,
                    justifyContent: 'space-between',
                    textTransform: 'none',
                    px: 1.5,
                    py: 1,
                    color: isActive ? 'primary.main' : 'text.primary',
                    bgcolor: isActive ? 'action.selected' : 'transparent',
                    fontWeight: isActive ? 600 : 500,
                    opacity: isInactive ? 0.65 : 1,
                    '&:hover': {
                      bgcolor: isActive ? 'action.selected' : 'action.hover',
                    },
                  }}
                >
                  <Typography
                    variant="body2"
                    noWrap
                    sx={{
                      fontWeight: 'inherit',
                      textAlign: 'left',
                      maxWidth: 130,
                    }}
                    title={cat.name}
                  >
                    {cat.name}
                    {isInactive ? ' (Inactive)' : ''}
                  </Typography>
                  <Chip
                    label={count}
                    size="small"
                    sx={{
                      height: 20,
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      bgcolor: isActive ? 'primary.main' : 'action.focus',
                      color: isActive ? 'primary.contrastText' : 'text.secondary',
                    }}
                  />
                </Button>

                {pageConfig?.canManageCategories && (
                  <Switch
                    size="small"
                    checked={!isInactive}
                    onChange={async () => {
                      setToggleError(null);
                      const result = await (isInactive
                        ? activateCategory(cat.id)
                        : deactivateCategory(cat.id));
                      if (!result.ok) {
                        setToggleError(result.message ?? 'Failed to update category status.');
                      }
                    }}
                    slotProps={{
                      input: {
                        'aria-label': isInactive ? 'Activate category' : 'Deactivate category',
                      },
                    }}
                  />
                )}
              </Box>
            </Box>
          );
        })}
      </Box>

      {pageConfig?.canManageCategories && (
        <Button
          fullWidth
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={openCreateCategoryPage}
          sx={{
            mt: 'auto',
            fontWeight: 600,
            fontSize: '0.8125rem',
          }}
        >
          Add category
        </Button>
      )}
    </Paper>
  );
}
