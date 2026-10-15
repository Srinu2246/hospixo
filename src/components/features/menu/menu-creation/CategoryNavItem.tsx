'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';

export interface CategoryNavItemProps {
  label: string;
  count: number;
  selected: boolean;
  inactive?: boolean;
  onSelect: () => void;
}

export function CategoryNavItem({
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
        bgcolor: selected ? 'action.selected' : 'transparent',
        opacity: inactive ? 0.65 : 1,
        transition: 'background-color 0.15s ease, color 0.15s ease',
        '&:hover': {
          bgcolor: selected ? 'action.selected' : 'action.hover',
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
        {inactive ? ' (Inactive)' : ''}
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
