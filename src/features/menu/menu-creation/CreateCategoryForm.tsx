'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import {
  createCategoryInputSchema,
  type CreateCategoryInput,
} from '@/lib/schemas/menu/menuCreationSchema';

export interface CreateCategoryFormProps {
  onCancel: () => void;
  onSubmit: (input: CreateCategoryInput) => void;
}

export function CreateCategoryForm({ onCancel, onSubmit }: Readonly<CreateCategoryFormProps>) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [error, setError] = useState<string | null>(null);

  function handleSubmit() {
    const result = createCategoryInputSchema.safeParse({
      name,
      description: description.trim() || undefined,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid category.');
      return;
    }
    setError(null);
    onSubmit(result.data);
  }

  return (
    <Paper
      variant="outlined"
      sx={{
        p: { xs: 2, sm: 3 },
        borderRadius: 2,
        bgcolor: 'background.paper',
      }}
    >
      <Stack spacing={2.5}>
        <Box>
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
            Add category
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Categories group menu items in POS and online ordering.
          </Typography>
        </Box>

        <Input
          id="category-name"
          label="Category name"
          placeholder="e.g. Starters"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            if (error) setError(null);
          }}
          error={Boolean(error)}
          helperText={error ?? undefined}
          fullWidth
        />

        <Input
          id="category-description"
          label="Description (optional)"
          placeholder="Short note for kitchen or staff"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          fullWidth
        />

        <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
          <ActionButton variant="outlined" onClick={onCancel}>
            Cancel
          </ActionButton>
          <ActionButton startIcon={<Plus size={16} />} onClick={handleSubmit}>
            Save category
          </ActionButton>
        </Stack>
      </Stack>
    </Paper>
  );
}
