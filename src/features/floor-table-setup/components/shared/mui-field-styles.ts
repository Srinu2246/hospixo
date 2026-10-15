import type { SxProps, Theme } from '@mui/material/styles';

/** Rounded outlined fields matching workspace form reference. */
export const floorSetupFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
  },
  '& .MuiSelect-select': {
    pr: '2.75rem !important',
  },
  '& .MuiSelect-icon': {
    right: 12,
    color: 'text.secondary',
  },
};

export const floorSetupRequiredLabel = (label: string) => `${label} *`;

/** Compact toolbar / filter selects — matches edit-table dropdown chrome + icon inset. */
export const floorSetupToolbarSelectSx: SxProps<Theme> = {
  ...floorSetupFieldSx,
  minWidth: 152,
  flex: '0 1 auto',
  '& .MuiOutlinedInput-root': {
    borderRadius: 2,
    bgcolor: 'background.paper',
  },
  '& .MuiSelect-select': {
    py: 1.1,
    pl: 1.75,
    pr: '2.75rem !important',
    fontSize: '0.8125rem',
    fontWeight: 600,
  },
  '& .MuiSelect-icon': {
    right: 12,
    color: 'text.secondary',
  },
  '& .MuiInputLabel-root': {
    fontWeight: 600,
    fontSize: '0.8125rem',
  },
};

/** Full-width filter row fields (50% / 25% / 25% grid cells). */
export const floorSetupFilterFieldSx: SxProps<Theme> = {
  ...floorSetupToolbarSelectSx,
  width: '100%',
  minWidth: 0,
  flex: 'unset',
};
