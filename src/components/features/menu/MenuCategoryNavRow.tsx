'use client';

import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Typography from '@mui/material/Typography';
import { alpha } from '@mui/material/styles';

import { colors } from '@/lib/theme/mui/colors';

export interface MenuCategoryNavRowProps {
  label: string;
  count: number;
  selected: boolean;
  /** When false, row uses reduced opacity (inactive category). */
  active?: boolean;
  onSelect: () => void;
}

/** Shared category row for menu creation and availability sidebars. */
export function MenuCategoryNavRow({
  label,
  count,
  selected,
  active = true,
  onSelect,
}: Readonly<MenuCategoryNavRowProps>) {
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
        opacity: active ? 1 : 0.65,
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
