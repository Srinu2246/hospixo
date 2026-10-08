'use client';

import { useState } from 'react';
import {
  Alert,
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft } from 'lucide-react';

import { useRestaurantMenus } from '../../context/restaurant-menus-context';
import type { RestaurantMenuType } from '../../types/restaurant-menu';

const menuTypeOptions: RestaurantMenuType[] = ['All', 'Dine In', 'Takeaway', 'Delivery', 'Online'];

export function CreateRestaurantMenuView() {
  const { editingMenu, createMenu, updateMenu, backToList } = useRestaurantMenus();
  const isEditMode = Boolean(editingMenu);

  const [name, setName] = useState(editingMenu?.name ?? '');
  const [code, setCode] = useState(editingMenu?.code ?? '');
  const [description, setDescription] = useState(editingMenu?.description ?? '');
  const [menuType, setMenuType] = useState<RestaurantMenuType>(editingMenu?.menuType ?? 'All');
  const [displayOrder, setDisplayOrder] = useState(String(editingMenu?.displayOrder ?? '0'));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [prevEditingMenuId, setPrevEditingMenuId] = useState<string | undefined>(editingMenu?.id);

  if (editingMenu?.id !== prevEditingMenuId) {
    setPrevEditingMenuId(editingMenu?.id);
    setName(editingMenu?.name ?? '');
    setCode(editingMenu?.code ?? '');
    setDescription(editingMenu?.description ?? '');
    setMenuType(editingMenu?.menuType ?? 'All');
    setDisplayOrder(String(editingMenu?.displayOrder ?? '0'));
  }

  function slugToCode(value: string): string {
    return value
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Menu name is required.');
      return;
    }
    if (!code.trim()) {
      setError('Menu code is required.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    const payload = {
      name: name.trim(),
      code: code.trim(),
      description: description.trim() || undefined,
      menuType,
      displayOrder: Number(displayOrder) || 0,
    };

    const result =
      isEditMode && editingMenu
        ? await updateMenu(editingMenu.id, payload)
        : await createMenu(payload);

    setIsSubmitting(false);

    if (!result.ok) {
      setError(result.message ?? 'Failed to save menu.');
    }
  }

  return (
    <Box sx={{ width: '100%' }}>
      <Stack direction="row" spacing={2} sx={{ mb: 3, alignItems: 'flex-start' }}>
        <Button
          startIcon={<ArrowLeft size={16} />}
          onClick={backToList}
          sx={{ textTransform: 'none', mt: 0.5 }}
        >
          Back
        </Button>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {isEditMode ? 'Edit Menu' : 'Create Menu'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Configure menu metadata used for category assignments and menu trees.
          </Typography>
        </Box>
      </Stack>

      <Paper
        component="form"
        onSubmit={handleSubmit}
        variant="outlined"
        sx={{ p: 3, borderRadius: 2 }}
      >
        <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 2 }}>
          Configuration
        </Typography>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
            mb: 2,
          }}
        >
          <TextField
            label="Menu Name"
            required
            value={name}
            onChange={(e) => {
              const nextName = e.target.value;
              setName(nextName);
              if (!isEditMode && !code.trim()) setCode(slugToCode(nextName));
              if (error) setError(null);
            }}
            disabled={isSubmitting}
            error={Boolean(error && !name.trim())}
          />
          <TextField
            label="Menu Code"
            required
            value={code}
            onChange={(e) => {
              setCode(e.target.value.toUpperCase());
              if (error) setError(null);
            }}
            disabled={isSubmitting}
          />
          <FormControl>
            <InputLabel id="menu-type-label">Menu Type</InputLabel>
            <Select
              labelId="menu-type-label"
              label="Menu Type"
              value={menuType}
              onChange={(e) => setMenuType(e.target.value as RestaurantMenuType)}
              disabled={isSubmitting}
            >
              {menuTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          <TextField
            label="Display Order"
            type="number"
            slotProps={{ htmlInput: { min: 0 } }}
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            disabled={isSubmitting}
          />
        </Box>

        <TextField
          label="Description"
          multiline
          minRows={3}
          fullWidth
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          sx={{ mb: 2 }}
        />

        {error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        ) : null}

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end' }}>
          <Button variant="outlined" onClick={backToList} sx={{ textTransform: 'none' }}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={isSubmitting}
            sx={{ textTransform: 'none' }}
          >
            {isSubmitting ? 'Saving…' : isEditMode ? 'Save Menu' : 'Create Menu'}
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
}
