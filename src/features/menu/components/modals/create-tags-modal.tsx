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
import FormControl from '@mui/material/FormControl';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';

import type { MenuItemTag } from '../../types/menu';
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

type CreateTagsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  editingTag?: MenuItemTag | null;
  onCreateTag: (input: {
    name: string;
    code: string;
  }) => Promise<{ ok: boolean; message?: string }>;
  onUpdateTag?: (
    tagId: string,
    input: { name: string; code: string; status?: MenuItemTag['status'] },
  ) => Promise<{ ok: boolean; message?: string }>;
};

function slugToCode(name: string): string {
  return name
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
}

export function CreateTagsModal({
  isOpen,
  onClose,
  editingTag = null,
  onCreateTag,
  onUpdateTag,
}: CreateTagsModalProps) {
  const isEditMode = Boolean(editingTag);
  const [tagName, setTagName] = useState('');
  const [tagCode, setTagCode] = useState('');
  const [status, setStatus] = useState<MenuItemTag['status']>('Active');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [previousEditingTag, setPreviousEditingTag] = useState(editingTag);
  const [previousIsOpen, setPreviousIsOpen] = useState(isOpen);

  if (editingTag !== previousEditingTag || isOpen !== previousIsOpen) {
    setPreviousEditingTag(editingTag);
    setPreviousIsOpen(isOpen);
    setTagName(editingTag?.name ?? '');
    setTagCode(editingTag?.code ?? '');
    setStatus(editingTag?.status ?? 'Active');
    setError(null);
    setIsSubmitting(false);
  }

  const isTagNameValid = tagName.trim().length >= 2;
  const isTagCodeValid = tagCode.trim().length >= 2 && /^[A-Z0-9_]+$/.test(tagCode.trim());
  const isFormValid = isTagNameValid && isTagCodeValid;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tagName.trim()) {
      setError('Tag name is required.');
      return;
    }
    if (!tagCode.trim()) {
      setError('Tag code is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: tagName.trim(),
      code: tagCode.trim(),
    };

    const result =
      isEditMode && editingTag && onUpdateTag
        ? await onUpdateTag(editingTag.id, { ...payload, status })
        : await onCreateTag(payload);

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Failed to save tag.');
      return;
    }

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
          {isEditMode ? 'Edit Tag' : 'Create Tags'}
        </Typography>
        <IconButton aria-label="close" onClick={onClose} sx={menuFormDialogCloseButtonSx}>
          <CloseIcon sx={{ fontSize: 18 }} />
        </IconButton>
      </DialogTitle>

      <Box component="form" onSubmit={handleSubmit} noValidate>
        <DialogContent sx={menuFormDialogContentSx}>
          <MenuFormField id="tag-name" label="Tag Name">
            <TextField
              id="tag-name"
              autoFocus
              hiddenLabel
              placeholder="e.g. Extra Raita, Extra Gravy"
              value={tagName}
              onChange={(e) => {
                const nextName = e.target.value;
                setTagName(nextName);
                if (!isEditMode && !tagCode.trim()) {
                  setTagCode(slugToCode(nextName));
                }
                if (error) setError(null);
              }}
              fullWidth
              size="small"
              sx={menuFormTextFieldSx}
            />
          </MenuFormField>

          <MenuFormField id="tag-code" label="Tag Code">
            <TextField
              id="tag-code"
              hiddenLabel
              placeholder="e.g. EXTRA_RAITA"
              value={tagCode}
              onChange={(e) => {
                setTagCode(e.target.value.toUpperCase());
                if (error) setError(null);
              }}
              fullWidth
              size="small"
              sx={menuFormTextFieldSx}
            />
          </MenuFormField>

          {isEditMode && (
            <MenuFormField id="tag-status" label="Status">
              <FormControl fullWidth size="small">
                <Select
                  id="tag-status"
                  labelId="tag-status-label"
                  value={status}
                  displayEmpty
                  onChange={(e) => setStatus(e.target.value as MenuItemTag['status'])}
                  sx={{ height: 40, borderRadius: '8px' }}
                >
                  <MenuItem value="Active">Active</MenuItem>
                  <MenuItem value="Inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </MenuFormField>
          )}

          {error && (
            <Alert severity="error" sx={{ borderRadius: '8px' }}>
              {error}
            </Alert>
          )}
        </DialogContent>

        <DialogActions sx={menuFormDialogActionsSx}>
          <Button variant="outlined" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="contained" disabled={isSubmitting || !isFormValid}>
            {isSubmitting ? 'Saving...' : isEditMode ? 'Save Tag' : 'Create Tag'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
}
