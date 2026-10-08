'use client';

import { useState } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

import { MenuFormField } from './menu-form-field';
import {
  menuFormDialogActionsSx,
  menuFormDialogCloseButtonSx,
  menuFormDialogContentSx,
  menuFormDialogPaperSx,
  menuFormDialogTitleSx,
  menuFormDialogTitleTextSx,
  menuFormTextFieldSx,
} from './menu-form-dialog-styles';

type AddModifierModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  onAddModifier: (name: string, price: number) => void;
}>;

export function AddModifierModal({ isOpen, onClose, onAddModifier }: AddModifierModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{ name?: string; price?: string }>({});

  const modifierPriceNum = Number(price);
  const isFormValid =
    name.trim().length >= 2 &&
    price.trim() !== '' &&
    !Number.isNaN(modifierPriceNum) &&
    modifierPriceNum >= 0;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { name?: string; price?: string } = {};
    if (!name.trim()) errs.name = 'Modifier name is required.';
    const p = Number(price);
    if (!price.trim() || Number.isNaN(p) || p < 0) {
      errs.price = 'Valid price is required.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onAddModifier(name.trim(), Number(price));
    setName('');
    setPrice('');
    setErrors({});
    onClose();
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      maxWidth="xs"
      fullWidth
      slotProps={{
        paper: { sx: menuFormDialogPaperSx },
      }}
    >
      <DialogTitle component="div" sx={menuFormDialogTitleSx}>
        <Typography variant="h6" component="h2" sx={menuFormDialogTitleTextSx}>
          Modifiers
        </Typography>
        <IconButton aria-label="close" onClick={onClose} sx={menuFormDialogCloseButtonSx}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={menuFormDialogContentSx}>
          <MenuFormField id="modifier-name" label="Modifier Name">
            <TextField
              id="modifier-name"
              autoFocus
              hiddenLabel
              placeholder="e.g. Extra Raita, Extra Gravy"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
              error={Boolean(errors.name)}
              helperText={errors.name}
              fullWidth
              size="small"
              sx={menuFormTextFieldSx}
            />
          </MenuFormField>

          <MenuFormField id="modifier-price" label="Price">
            <TextField
              id="modifier-price"
              hiddenLabel
              placeholder="Enter price"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
              }}
              error={Boolean(errors.price)}
              helperText={errors.price}
              fullWidth
              size="small"
              sx={menuFormTextFieldSx}
              slotProps={{
                input: {
                  startAdornment: <InputAdornment position="start">₹</InputAdornment>,
                },
              }}
            />
          </MenuFormField>
        </DialogContent>

        <DialogActions sx={menuFormDialogActionsSx}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={!isFormValid}>
            Add Add-On
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
