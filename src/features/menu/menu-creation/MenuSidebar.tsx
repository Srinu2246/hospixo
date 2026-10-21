'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import IconButton from '@mui/material/IconButton';
import Switch from '@mui/material/Switch';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';
import { Pencil, Plus } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Card } from '@/components/shared/ui/Card';
import { colors } from '@/lib/theme/mui/colors';
import { useMenuCreation } from '@/features/menu/context';
import type { MenuCategory } from '@/lib/schemas/menu/menuCreationSchema';

interface CategoryNavItemProps {
  label: string;
  count: number;
  selected: boolean;
  /** Active = true, Inactive = false. */
  active?: boolean;
  showStatusToggle?: boolean;
  showEdit?: boolean;
  toggleDisabled?: boolean;
  onSelect: () => void;
  onEdit?: () => void;
  onToggleActive?: (nextActive: boolean) => void;
}

function CategoryNavItem({
  label,
  count,
  selected,
  active = true,
  showStatusToggle = false,
  showEdit = false,
  toggleDisabled = false,
  onSelect,
  onEdit,
  onToggleActive,
}: Readonly<CategoryNavItemProps>) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 0.25,
        borderRadius: '8px',
        bgcolor: selected ? alpha(colors.primary.default, 0.1) : 'transparent',
        opacity: active ? 1 : 0.65,
        transition: 'background-color 0.15s ease',
        '&:hover': {
          bgcolor: selected ? alpha(colors.primary.default, 0.15) : 'action.hover',
        },
      }}
    >
      <ButtonBase
        onClick={onSelect}
        sx={{
          flex: 1,
          minWidth: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 1,
          px: 1.5,
          py: 1.1,
          borderRadius: '8px',
          textAlign: 'left',
          color: selected ? 'primary.main' : 'text.primary',
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

      {showEdit ? (
        <IconButton
          size="small"
          aria-label={`Edit ${label}`}
          onClick={(event) => {
            event.stopPropagation();
            onEdit?.();
          }}
          sx={{ p: 0.5, color: 'text.secondary' }}
        >
          <Pencil size={14} />
        </IconButton>
      ) : null}

      {showStatusToggle ? (
        <Switch
          size="small"
          checked={active}
          disabled={toggleDisabled}
          onClick={(event) => event.stopPropagation()}
          onChange={(_event, next) => onToggleActive?.(next)}
          slotProps={{
            input: { 'aria-label': `${label} ${active ? 'active' : 'inactive'}` },
          }}
          sx={{
            flexShrink: 0,
            mr: 0.5,
            '& .MuiSwitch-switchBase.Mui-checked': {
              color: 'primary.main',
            },
          }}
        />
      ) : null}
    </Box>
  );
}

export function MenuSidebar() {
  const {
    pageConfig,
    categories,
    activeCategoryId,
    setActiveCategoryId,
    categoryCounts,
    totalItemCount,
    openCreateCategory,
    openEditCategory,
    toggleCategoryStatus,
    isUpdatingCategory,
  } = useMenuCreation();
  const [togglingId, setTogglingId] = useState<string | null>(null);

  async function handleToggle(category: MenuCategory, nextActive: boolean) {
    const isActive = category.status === 'Active';
    if (nextActive === isActive) return;
    setTogglingId(category.id);
    try {
      await toggleCategoryStatus(category.id, nextActive);
    } catch {
      // Error toast is shown by the API client (POST/PATCH).
    } finally {
      setTogglingId(null);
    }
  }

  return (
    <Card
      component="aside"
      variant="outlined"
      sx={{
        width: { xs: '100%', md: 280 },
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

          {categories.map((category) => {
            const isActive = category.status === 'Active';
            return (
              <Box component="li" key={category.id}>
                <CategoryNavItem
                  label={category.name}
                  count={categoryCounts[category.id] ?? 0}
                  selected={activeCategoryId === category.id}
                  active={isActive}
                  showStatusToggle={pageConfig.canManageCategories}
                  showEdit={pageConfig.canManageCategories}
                  toggleDisabled={Boolean(isUpdatingCategory) || togglingId === category.id}
                  onSelect={() => setActiveCategoryId(category.id)}
                  onEdit={() => openEditCategory(category)}
                  onToggleActive={(nextActive) => {
                    void handleToggle(category, nextActive);
                  }}
                />
              </Box>
            );
          })}
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
