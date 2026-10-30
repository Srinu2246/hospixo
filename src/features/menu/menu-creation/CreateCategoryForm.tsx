'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Plus, Save } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import { Card } from '@/components/shared/ui/Card';
import { menuFeaturePaneInsetSx, menuFormFooterGridSx } from '@/lib/helpers/menu/menuLayout';
import { useMenuCreation } from '@/features/menu/context';
import { assertCatalogueContextForCategoryCreate } from '@/lib/helpers/menuBranchContext';
import { resolveCatalogueContextIds } from '@/lib/helpers/apiContextHeaders';
import { zodFieldMessage } from '@/lib/schemas/menu/menuCreationSchema';
import {
  createCategoryInputSchema,
  type CreateCategoryInput,
  type MenuCategory,
} from '@/lib/schemas/menu/menuCreationSchema';
import { ApiError } from '@/services/api/types';

function categoryFormValues(name: string, description: string) {
  return {
    name,
    description: description.trim() || undefined,
  };
}

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
  const catalogueIds = resolveCatalogueContextIds(pageConfig.scope);

  const catalogueContextIssue = useMemo((): string | null => {
    if (isEdit) return null;
    try {
      assertCatalogueContextForCategoryCreate(pageConfig.scope, catalogueIds);
      return null;
    } catch (submitError) {
      return submitError instanceof ApiError
        ? submitError.message
        : 'Missing company or branch context for this workspace.';
    }
  }, [catalogueIds, isEdit, pageConfig.scope]);

  // Remount via `key` from parent when the edited category changes — no sync effect needed.
  const initialName = initialCategory?.name ?? '';
  const initialDescription = initialCategory?.description ?? '';
  const [name, setName] = useState(initialName);
  const [description, setDescription] = useState(initialDescription);
  const [nameTouched, setNameTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const nameInlineError = useMemo(() => {
    if (!nameTouched) return undefined;
    return zodFieldMessage(
      createCategoryInputSchema,
      categoryFormValues(name, description),
      'name',
    );
  }, [description, name, nameTouched]);

  const parsedInput = createCategoryInputSchema.safeParse({
    name,
    description: description.trim() || undefined,
  });
  const hasChanges = isEdit
    ? name.trim() !== initialName.trim() ||
      (description.trim() || '') !== (initialDescription.trim() || '')
    : name.trim().length > 0;
  const canSubmit = parsedInput.success && hasChanges && !saving && catalogueContextIssue == null;

  async function handleSubmit() {
    const result = createCategoryInputSchema.safeParse({
      name,
      description: description.trim() || undefined,
    });
    if (!result.success) {
      setNameTouched(true);
      return;
    }
    setSubmitError(null);
    try {
      await onSubmit(result.data);
    } catch (requestError) {
      setSubmitError(
        requestError instanceof ApiError
          ? requestError.message
          : requestError instanceof Error
            ? requestError.message
            : isEdit
              ? 'Unable to update category.'
              : 'Unable to create category.',
      );
    }
  }

  return (
    <Stack spacing={2.5} sx={[{ maxWidth: 720, width: '100%' }, menuFeaturePaneInsetSx]}>
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

      <Card variant="outlined" padding={3}>
        <Stack spacing={2.5}>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>
              {isEdit ? 'Edit category' : 'Create Category'}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
              Categories group menu items in POS and online ordering.
            </Typography>
            {catalogueContextIssue ? (
              <Typography variant="body2" color="error.main" sx={{ mt: 1 }}>
                {catalogueContextIssue}
              </Typography>
            ) : null}
          </Box>

          <Input
            id="category-name"
            label="Category name"
            placeholder="e.g. Starters"
            value={name}
            onChange={(event) => {
              setName(event.target.value);
              if (submitError) setSubmitError(null);
            }}
            onBlur={() => {
              setNameTouched(true);
            }}
            error={Boolean(nameInlineError || submitError)}
            helperText={nameInlineError ?? submitError ?? undefined}
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

          <Box sx={menuFormFooterGridSx}>
            <ActionButton variant="outlined" onClick={onCancel} disabled={saving} fullWidth>
              Cancel
            </ActionButton>
            <ActionButton
              variant="primary"
              fullWidth
              startIcon={isEdit ? <Save size={16} /> : <Plus size={16} />}
              onClick={() => {
                void handleSubmit();
              }}
              disabled={!canSubmit}
              loading={saving}
            >
              {isEdit ? 'Save changes' : 'Save Category'}
            </ActionButton>
          </Box>
        </Stack>
      </Card>
    </Stack>
  );
}
