'use client';

import type { ReactNode } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

import {
  menuFormDialogCloseButtonSx,
  menuFormDialogPaperSx,
  menuFormDialogTitleSx,
  menuFormDialogTitleTextSx,
} from './menu-form-dialog-styles';

export type MenuFormDialogShellProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}>;

export function MenuFormDialogShell({
  isOpen,
  onClose,
  title,
  children,
}: MenuFormDialogShellProps) {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: {
          sx: menuFormDialogPaperSx,
        },
      }}
    >
      <DialogTitle sx={menuFormDialogTitleSx}>
        <Typography sx={menuFormDialogTitleTextSx}>{title}</Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          size="small"
          sx={menuFormDialogCloseButtonSx}
        >
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>
      {children}
    </Dialog>
  );
}
