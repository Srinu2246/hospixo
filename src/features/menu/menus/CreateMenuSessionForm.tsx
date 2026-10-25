'use client';

import { useMemo, useState } from 'react';
import Box from '@mui/material/Box';
import ButtonBase from '@mui/material/ButtonBase';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Check, ChevronLeft } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { Input } from '@/components/shared/form-fields/Input';
import { zodFieldMessage } from '@/lib/schemas/menu/menuCreationSchema';
import {
  editMenuSessionFormSchema,
  menuSessionFormSchema,
  RESTAURANT_MENU_SLUG_OPTIONS,
  type MenuSessionFormValues,
  type RestaurantMenuSlug,
} from '@/lib/schemas/menu/menus/menusSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useThemeStore } from '@/stores/themeStore';

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
  const themeMode = useThemeStore((state) => state.mode);
  const isDark = themeMode === 'dark';
  const surfaceBg = isDark ? colors.surface.dark : colors.surface.default;
  const borderColor = isDark ? colors.border.dark : colors.border.default;
  const [name, setName] = useState(initialValues?.name ?? '');
  const [code, setCode] = useState(initialValues?.code ?? '');
  const [menu, setMenu] = useState<RestaurantMenuSlug>(initialValues?.menu ?? 'breakfast');
  const [menuType, setMenuType] = useState(initialValues?.menuType ?? 'all');
  const [description, setDescription] = useState(initialValues?.description ?? '');
  const [touched, setTouched] = useState<Partial<Record<keyof MenuSessionFormValues, boolean>>>({});
  const [fieldErrors, setFieldErrors] = useState<
    Partial<Record<keyof MenuSessionFormValues, string>>
  >({});

  function sessionFormValues(): MenuSessionFormValues {
    return {
      name,
      code,
      menu: isEdit ? menu || initialValues?.menu || 'breakfast' : menu,
      menuType: isEdit ? (menuType || initialValues?.menuType || 'all').toLowerCase() : menuType,
      description,
    };
  }

  const activeSchema = isEdit ? editMenuSessionFormSchema : menuSessionFormSchema;

  function validationPayload() {
    const values = sessionFormValues();
    if (isEdit) {
      return {
        name: values.name,
        code: values.code,
        description: values.description,
      };
    }
    return values;
  }

  function touchField(field: keyof MenuSessionFormValues) {
    setTouched((prev) => (prev[field] ? prev : { ...prev, [field]: true }));
  }

  function validateField(field: keyof MenuSessionFormValues) {
    const message = zodFieldMessage(activeSchema, validationPayload(), field);
    setFieldErrors((prev) => {
      if (!message) {
        if (!prev[field]) return prev;
        const next = { ...prev };
        delete next[field];
        return next;
      }
      return { ...prev, [field]: message };
    });
  }

  function handleFieldBlur(field: keyof MenuSessionFormValues) {
    touchField(field);
    validateField(field);
  }

  function clearFieldError(field: keyof MenuSessionFormValues) {
    setFieldErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }

  function inlineError(field: keyof MenuSessionFormValues): string | undefined {
    return touched[field] ? fieldErrors[field] : undefined;
  }

  const initialEditSnapshot = useMemo(
    () => ({
      name: (initialValues?.name ?? '').trim(),
      code: (initialValues?.code ?? '').trim(),
      description: (initialValues?.description ?? '').trim(),
    }),
    [initialValues?.code, initialValues?.description, initialValues?.name],
  );

  const hasEditChanges = useMemo(() => {
    if (!isEdit) return true;
    return (
      name.trim() !== initialEditSnapshot.name ||
      code.trim() !== initialEditSnapshot.code ||
      description.trim() !== initialEditSnapshot.description
    );
  }, [code, description, initialEditSnapshot, isEdit, name]);

  const canSubmit = useMemo(() => {
    const isValid = isEdit
      ? editMenuSessionFormSchema.safeParse(validationPayload()).success
      : menuSessionFormSchema.safeParse(sessionFormValues()).success;
    if (!isValid) return false;
    if (isEdit) return hasEditChanges;
    return true;
  }, [code, description, hasEditChanges, isEdit, menu, menuType, name]);

  function applySchemaErrors(result: {
    success: false;
    error: { issues: { path: PropertyKey[]; message: string }[] };
  }) {
    const nextTouched: Partial<Record<keyof MenuSessionFormValues, boolean>> = {};
    const next: Partial<Record<keyof MenuSessionFormValues, string>> = {};
    for (const issue of result.error.issues) {
      const key = issue.path[0];
      if (typeof key === 'string') {
        const field = key as keyof MenuSessionFormValues;
        nextTouched[field] = true;
        if (!(field in next)) {
          next[field] = issue.message;
        }
      }
    }
    setTouched((prev) => ({ ...prev, ...nextTouched }));
    setFieldErrors(next);
  }

  function handleSubmit() {
    const values = sessionFormValues();

    if (isEdit) {
      const editResult = editMenuSessionFormSchema.safeParse(validationPayload());
      if (!editResult.success) {
        applySchemaErrors(editResult);
        return;
      }
      setFieldErrors({});
      onSubmit({
        ...values,
        name: editResult.data.name,
        code: editResult.data.code,
        description: editResult.data.description ?? '',
      });
      return;
    }

    const createResult = menuSessionFormSchema.safeParse(values);
    if (!createResult.success) {
      applySchemaErrors(createResult);
      return;
    }
    setFieldErrors({});
    onSubmit(createResult.data);
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
          borderColor,
          bgcolor: surfaceBg,
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
              error={Boolean(inlineError('name'))}
              helperText={inlineError('name')}
              onChange={(event) => {
                setName(event.target.value);
                if (touched.name) validateField('name');
                else clearFieldError('name');
              }}
              onBlur={() => handleFieldBlur('name')}
            />
            <Input
              id="menu-session-code"
              label="Session Code"
              required
              placeholder="e.g., BKFAST"
              value={code}
              disabled={submitting}
              error={Boolean(inlineError('code'))}
              helperText={inlineError('code')}
              onChange={(event) => {
                setCode(event.target.value);
                if (touched.code) validateField('code');
                else clearFieldError('code');
              }}
              onBlur={() => handleFieldBlur('code')}
            />
            {!isEdit ? (
              <>
                <Box>
                  <Typography
                    component="label"
                    htmlFor="menu-session-menu"
                    sx={{
                      display: 'block',
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      color: 'text.primary',
                      mb: 0.75,
                    }}
                  >
                    Menu *
                  </Typography>
                  <Dropdown
                    options={[...RESTAURANT_MENU_SLUG_OPTIONS]}
                    value={menu}
                    onChange={(value) => {
                      setMenu(value as RestaurantMenuSlug);
                      touchField('menu');
                      validateField('menu');
                    }}
                    disabled={submitting}
                    minWidth="100%"
                    sx={{ width: '100%' }}
                  />
                  {inlineError('menu') ? (
                    <Typography sx={{ mt: 0.5, fontSize: '0.75rem', color: 'error.main' }}>
                      {inlineError('menu')}
                    </Typography>
                  ) : null}
                </Box>
                <Input
                  id="menu-session-type"
                  label="Menu type"
                  required
                  placeholder="e.g., all"
                  value={menuType}
                  disabled={submitting}
                  error={Boolean(inlineError('menuType'))}
                  helperText={inlineError('menuType') ?? 'Service channel (all, dine_in, …)'}
                  onChange={(event) => {
                    setMenuType(event.target.value);
                    if (touched.menuType) validateField('menuType');
                    else clearFieldError('menuType');
                  }}
                  onBlur={() => handleFieldBlur('menuType')}
                />
              </>
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
          disabled={submitting || !canSubmit}
        >
          {isEdit ? 'Save Changes' : 'Create Session'}
        </ActionButton>
      </Stack>
    </Box>
  );
}
