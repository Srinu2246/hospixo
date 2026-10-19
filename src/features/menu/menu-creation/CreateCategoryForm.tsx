'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, Save } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { useMenuCreation } from '@/features/menu/context';
import {
  createCategoryInputSchema,
  type CreateCategoryInput,
  type MenuCategory,
} from '@/lib/schemas/menu/menuCreationSchema';
import { ApiError } from '@/services/api/types';

export interface CreateCategoryFormProps {
  mode?: 'create' | 'edit';
  initialCategory?: MenuCategory | null;
  onCancel: () => void;
  onSubmit: (input: CreateCategoryInput) => Promise<void>;
}

export function CreateCategoryForm({
  mode = 'create',
  initialCategory = null,
  onCancel,
  onSubmit,
}: Readonly<CreateCategoryFormProps>) {
  const { pageConfig, isCreatingCategory, isUpdatingCategory } = useMenuCreation();
  const isEdit = mode === 'edit';
  const saving = Boolean(isEdit ? isUpdatingCategory : isCreatingCategory);

  // Remount via `key` from parent when the edited category changes — no sync effect needed.
  const [name, setName] = useState(initialCategory?.name ?? '');
  const [description, setDescription] = useState(initialCategory?.description ?? '');
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    const result = createCategoryInputSchema.safeParse({
      name,
      description: description.trim() || undefined,
    });
    if (!result.success) {
      setError(result.error.issues[0]?.message ?? 'Invalid category.');
      return;
    }
    setError(null);
    try {
      await onSubmit(result.data);
    } catch (submitError) {
      setError(
        submitError instanceof ApiError
          ? submitError.message
          : submitError instanceof Error
            ? submitError.message
            : isEdit
              ? 'Unable to update category.'
              : 'Unable to create category.',
      );
    }
  }

  return (
    <Stack spacing={2.5} sx={{ p: { xs: 1, sm: 2 }, maxWidth: 720 }}>
      <Breadcrumbs
        items={[
          {
            label: 'Home',
            href: pageConfig.homeHref,
          },
          {
            label: pageConfig.pageTitle,
            onClick: onCancel,
          },
          {
            label: isEdit ? 'Edit category' : 'Add category',
            active: true,
          },
        ]}
        linkSx={{
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': {
            color: 'primary.main',
            textDecoration: 'underline',
          },
        }}
        activeSx={{
          color: 'primary.main',
          fontWeight: 600,
        }}
      />

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
              {isEdit ? 'Edit category' : 'Add category'}
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
            disabled={saving}
          />

          <Input
            id="category-description"
            label="Description (optional)"
            placeholder="Short note for kitchen or staff"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            fullWidth
            disabled={saving}
          />

          <Stack direction="row" spacing={1.5} sx={{ justifyContent: 'flex-end', pt: 1 }}>
            <ActionButton variant="outlined" onClick={onCancel} disabled={saving}>
              Cancel
            </ActionButton>
            <ActionButton
              startIcon={isEdit ? <Save size={16} /> : <Plus size={16} />}
              onClick={() => {
                void handleSubmit();
              }}
              loading={saving}
            >
              {isEdit ? 'Save changes' : 'Save category'}
            </ActionButton>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
}
