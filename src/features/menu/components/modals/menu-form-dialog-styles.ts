import type { SxProps, Theme } from '@mui/material/styles';

/** Rounded card-style dialog surface (Figma menu modals). */
export const menuFormDialogPaperSx: SxProps<Theme> = {
  borderRadius: '16px',
  overflow: 'hidden',
};

export const menuFormDialogTitleSx: SxProps<Theme> = {
  m: 0,
  px: 3,
  pt: 3,
  pb: 2,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
};

export const menuFormDialogTitleTextSx: SxProps<Theme> = {
  fontWeight: 600,
  m: 0,
  fontSize: '1.125rem',
  lineHeight: 1.3,
  color: 'text.primary',
};

export const menuFormDialogCloseButtonSx: SxProps<Theme> = {
  color: 'text.secondary',
  border: 1,
  borderColor: 'divider',
  width: 32,
  height: 32,
  flexShrink: 0,
  '&:hover': {
    bgcolor: 'action.hover',
    borderColor: 'divider',
  },
};

export const menuFormDialogContentSx: SxProps<Theme> = {
  px: 3,
  py: 0,
  display: 'flex',
  flexDirection: 'column',
  gap: 2.5,
};

export const menuFormDialogActionsSx: SxProps<Theme> = {
  px: 3,
  py: 3,
  pt: 2,
  gap: 1.5,
  '& .MuiButton-root': {
    textTransform: 'none',
    fontWeight: 600,
    borderRadius: '8px',
    minHeight: 40,
    px: 2.5,
    boxShadow: 'none',
  },
  '& .MuiButton-contained': {
    boxShadow: 'none',
    '&:hover': {
      boxShadow: 'none',
    },
  },
};

export const menuFormFieldLabelSx: SxProps<Theme> = {
  display: 'block',
  fontSize: '0.8125rem',
  fontWeight: 600,
  color: 'text.secondary',
  mb: 0.75,
};

export const menuFormTextFieldSx: SxProps<Theme> = {
  '& .MuiOutlinedInput-root': {
    height: 40,
    borderRadius: '8px',
    bgcolor: 'background.paper',
  },
};
