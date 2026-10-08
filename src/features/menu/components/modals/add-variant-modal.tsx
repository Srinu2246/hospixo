'use client';

import { useState } from 'react';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';

import type { ItemVariant } from '../../types/menu';
import { MenuFormField } from './menu-form-field';
import { MenuFormDialogShell } from './menu-form-dialog-shell';
import {
  menuFormDialogActionsSx,
  menuFormDialogContentSx,
  menuFormTextFieldSx,
} from './menu-form-dialog-styles';

type AddVariantModalProps = Readonly<{
  isOpen: boolean;
  onClose: () => void;
  editingVariant?: ItemVariant | null;
  onAddVariant: (sizeName: string, price: number) => void | Promise<void>;
  onUpdateVariant?: (variantId: string, sizeName: string, price: number) => void | Promise<void>;
}>;

export function AddVariantModal({
  isOpen,
  onClose,
  editingVariant = null,
  onAddVariant,
  onUpdateVariant,
}: AddVariantModalProps) {
  const [sizeName, setSizeName] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState<{ sizeName?: string; price?: string }>({});
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousEditingVariant, setPreviousEditingVariant] = useState(editingVariant);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  const isEditMode = Boolean(editingVariant);

  let submitButtonLabel = 'Add Size';
  if (isSubmitting) {
    submitButtonLabel = 'Saving...';
  } else if (isEditMode) {
    submitButtonLabel = 'Save Changes';
  }

  if (editingVariant !== previousEditingVariant || isOpen !== previousIsOpen) {
    setPreviousEditingVariant(editingVariant);
    setPreviousIsOpen(isOpen);
    setSizeName(editingVariant?.size ?? '');
    setPrice(editingVariant ? String(editingVariant.price) : '');
    setErrors({});
    setSubmitError(null);
    setIsSubmitting(false);
  }

  const variantPriceNum = Number(price);
  const isFormValid =
    sizeName.trim().length >= 2 &&
    price.trim() !== '' &&
    !Number.isNaN(variantPriceNum) &&
    variantPriceNum > 0;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs: { sizeName?: string; price?: string } = {};
    if (!sizeName.trim()) errs.sizeName = 'Size name is required.';
    const p = Number(price);
    if (!price.trim() || Number.isNaN(p) || p <= 0) {
      errs.price = 'Valid price is required.';
    }
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    try {
      if (isEditMode && editingVariant && onUpdateVariant) {
        await onUpdateVariant(editingVariant.id, sizeName.trim(), Number(price));
      } else {
        await onAddVariant(sizeName.trim(), Number(price));
      }
      setSizeName('');
      setPrice('');
      setErrors({});
      onClose();
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'Failed to save variant.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <MenuFormDialogShell
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? 'Edit Variant' : 'Variants'}
    >
      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={menuFormDialogContentSx}>
          <MenuFormField id="variant-size-name" label="Size Name">
            <TextField
              id="variant-size-name"
              autoFocus
              hiddenLabel
              placeholder="e.g. Mini, Single, Double, Family Pack"
              value={sizeName}
              onChange={(e) => {
                setSizeName(e.target.value);
                if (errors.sizeName) setErrors((prev) => ({ ...prev, sizeName: undefined }));
                if (submitError) setSubmitError(null);
              }}
              error={Boolean(errors.sizeName)}
              helperText={errors.sizeName}
              fullWidth
              size="small"
              sx={menuFormTextFieldSx}
            />
          </MenuFormField>

          <MenuFormField id="variant-price" label="Price">
            <TextField
              id="variant-price"
              hiddenLabel
              placeholder="Enter price"
              type="number"
              value={price}
              onChange={(e) => {
                setPrice(e.target.value);
                if (errors.price) setErrors((prev) => ({ ...prev, price: undefined }));
                if (submitError) setSubmitError(null);
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

          {submitError && (
            <Alert severity="error" sx={{ borderRadius: '8px' }}>
              {submitError}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={menuFormDialogActionsSx}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !isFormValid}>
            {submitButtonLabel}
          </Button>
        </DialogActions>
      </Box>
    </MenuFormDialogShell>
  );
}
