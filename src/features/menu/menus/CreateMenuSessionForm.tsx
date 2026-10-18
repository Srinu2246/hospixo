'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check, ChevronLeft } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Input } from '@/components/shared/form-fields/Input';
import {
  menuSessionFormSchema,
  type MenuSessionFormValues,
} from '@/lib/schemas/menu/menus/menuSessionFormSchema';
import { colors } from '@/lib/theme/mui/colors';

export interface CreateMenuSessionFormProps {
  mode?: 'create' | 'edit';
  /** Prefill when editing an existing session. */
  initialValues?: Partial<MenuSessionFormValues> & { name?: string };
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (values: MenuSessionFormValues) => void;
}

/**
 * Create / edit meal-session form: back link, session details, Cancel / primary action.
 */
export function CreateMenuSessionForm({
  mode = 'create',
  initialValues,
  submitting = false,
  onCancel,
  onSubmit,
}: Readonly<CreateMenuSessionFormProps>) {
  const isEdit = mode === 'edit';
  const [name, setName] = useState(initialValues?.name ?? '');
  const [code, setCode] = useState(initialValues?.code ?? '');
  const [menuType, setMenuType] = useState(initialValues?.menuType ?? '');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MenuSessionFormValues, string>>
  >({});

  function clearFieldError(field: keyof MenuSessionFormValues) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function handleSubmit() {
    const result = menuSessionFormSchema.safeParse({
      name,
      code,
      menuType: isEdit ? menuType || initialValues?.menuType || 'ALL' : menuType,
      description,
    });

    if (!result.success) {
      const next: Partial<Record<keyof MenuSessionFormValues, string>> = {};
      for (const issue of result.error.issues) {
        const key = issue.path[0];
        if (typeof key === 'string' && !(key in next)) {
          next[key as keyof MenuSessionFormValues] = issue.message;
        }
      }
      setFieldErrors(next);
      return;
    }

    setFieldErrors({});
    onSubmit(result.data);
  }

  const title = isEdit ? `Edit ${initialValues?.name?.trim() || 'Session'}` : 'Create Menus';
  const subtitle = isEdit
    ? `Configure ${initialValues?.name?.trim() || 'session'} menu metadata, active times, and operating schedule.`
    : 'Define a new meal session with time range and operating days.';

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        height: '100%',
        minHeight: 0,
        overflow: 'auto',
      }}
    >
      <Box sx={{ flexShrink: 0 }}>
        {!isEdit ? (
          <ButtonBase
            onClick={onCancel}
            disableRipple
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 0.5,
              color: colors.primary.default,
              fontSize: '0.875rem',
              fontWeight: 600,
              mb: 1.5,
              '&:hover': { opacity: 0.85 },
            }}
          >
            <ChevronLeft size={18} />
            Back to Menus
          </ButtonBase>
        ) : null}

        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.375rem', sm: '1.5rem' },
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
            color: 'text.primary',
          }}
        >
          {title}
        </Typography>
        <Typography variant="body2" sx={{ mt: 0.5, color: 'text.secondary', fontSize: '0.875rem' }}>
          {subtitle}
        </Typography>
      </Box>

      <Paper
        variant="outlined"
        sx={{
          flexShrink: 0,
          p: { xs: 2, sm: 3 },
          borderRadius: '12px',
          borderColor: colors.border.default,
          bgcolor: colors.surface.default,
        }}
      >
        <Typography
          component="h2"
          sx={{ fontWeight: 700, fontSize: '1rem', color: 'text.primary', mb: 2.5 }}
        >
          Session Details
        </Typography>

        <Stack spacing={2.5}>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: '1fr',
                md: isEdit ? 'repeat(2, minmax(0, 1fr))' : 'repeat(3, minmax(0, 1fr))',
              },
              gap: 2,
            }}
          >
            <Input
              id="menu-session-name"
              label="Session Name"
              required
              placeholder="e.g., Breakfast Buffet"
              value={name}
              disabled={submitting}
              error={Boolean(fieldErrors.name)}
              helperText={fieldErrors.name}
              onChange={(event) => {
                setName(event.target.value);
                clearFieldError('name');
              }}
            />
            <Input
              id="menu-session-code"
              label="Session Code"
              required
              placeholder="e.g., BKFAST"
              value={code}
              disabled={submitting}
              error={Boolean(fieldErrors.code)}
              helperText={fieldErrors.code}
              onChange={(event) => {
                setCode(event.target.value);
                clearFieldError('code');
              }}
            />
            {!isEdit ? (
              <Input
                id="menu-session-type"
                label="Menu Type"
                required
                placeholder="e.g., ALL"
                value={menuType}
                disabled={submitting}
                error={Boolean(fieldErrors.menuType)}
                helperText={fieldErrors.menuType}
                onChange={(event) => {
                  setMenuType(event.target.value);
                  clearFieldError('menuType');
                }}
              />
            ) : null}
          </Box>

          <Input
            id="menu-session-description"
            label="Description"
            placeholder="Describe this session's context or notes..."
            value={description}
            disabled={submitting}
            multiline
            rows={4}
            onChange={(event) => setDescription(event.target.value)}
          />
        </Stack>
      </Paper>

      <Stack
        direction="row"
        spacing={1.5}
        sx={{ justifyContent: 'flex-end', flexShrink: 0, pb: 1 }}
      >
        <ActionButton variant="outlined" onClick={onCancel} disabled={submitting}>
          Cancel
        </ActionButton>
        <ActionButton
          startIcon={<Check size={16} />}
          onClick={handleSubmit}
          loading={submitting}
          disabled={submitting}
        >
          {isEdit ? 'Save Changes' : 'Create Session'}
        </ActionButton>
      </Stack>
    </Box>
  );
}
