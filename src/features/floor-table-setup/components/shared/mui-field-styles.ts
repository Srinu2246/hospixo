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
};

export const floorSetupRequiredLabel = (label: string) => `${label} *`;
