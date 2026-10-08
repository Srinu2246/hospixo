import type { SxProps, Theme } from '@mui/material/styles';

/** Matches platform auth form spacing (auth-form-shared.module.css). */
export const authFormStackSx: SxProps<Theme> = {
  gap: 2,
};

export const authFieldLabelSx: SxProps<Theme> = {
  display: 'block',
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'text.primary',
  mb: 0.5,
};

export const authTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    minHeight: 44,
    borderRadius: '8px',
    bgcolor: 'background.paper',
    fontSize: '0.9375rem',
  },
};

export const authSubmitButtonSx: SxProps<Theme> = {
  mt: 0.5,
  minHeight: 46,
  borderRadius: '8px',
  textTransform: 'none',
  fontWeight: 600,
  fontSize: '0.9375rem',
  boxShadow: 'none',
  '&:hover': {
    boxShadow: 'none',
  },
};

export const authFooterLinkSx: SxProps<Theme> = {
  fontSize: '0.875rem',
  fontWeight: 600,
  color: 'primary.main',
  textDecoration: 'none',
  '&:hover': {
    textDecoration: 'underline',
  },
};
