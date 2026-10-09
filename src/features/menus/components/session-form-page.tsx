'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Alert,
  Box,
  Button,
  Card,
  FormControl,
  FormHelperText,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import { ArrowLeft, Check } from 'lucide-react';

import { menusCopy, menuTypeOptions } from '../config/copy';
import { useMenusRoutes } from '../context/menus-routes-context';
import { useMenus } from '../context/menus-context';
import { validateMenuSessionForm } from '../lib/validate-session';
import type { MenuSession, MenuSessionForm, MenuSessionType } from '../types/menus';
import { MenusBreadcrumb } from './menus-breadcrumb';
import { SessionFormSkeleton } from './skeleton/menus-skeletons';

type SessionFormPageProps = Readonly<{
  mode: 'create' | 'edit';
  session?: MenuSession;
}>;

export function SessionFormPage({ mode, session }: SessionFormPageProps) {
  const router = useRouter();
  const menusRoutes = useMenusRoutes();
  const { sessions, createSession, updateSession } = useMenus();
  const [form, setForm] = useState<MenuSessionForm>({
    name: session?.name ?? '',
    code: session?.code ?? '',
    menuType: session?.menuType ?? '',
    description: session?.description ?? '',
  });
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const isEdit = mode === 'edit';
  const title = isEdit
    ? `${menusCopy.editTitlePrefix} ${session?.name ?? ''}`.trim()
    : menusCopy.createTitle;
  const subtitle = isEdit
    ? menusCopy.editSubtitle(session?.name ?? 'this session')
    : menusCopy.createSubtitle;

  function updateField<K extends keyof MenuSessionForm>(field: K, value: MenuSessionForm[K]) {
    setForm((current) => ({ ...current, [field]: value }));
    if (error) setError(null);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const currentId = isEdit ? session?.id : undefined;
    const existingCodes = sessions.filter((item) => item.id !== currentId).map((item) => item.code);
    const validation = validateMenuSessionForm(form, existingCodes, currentId);
    if (validation) {
      setError(validation);
      return;
    }

    setPending(true);
    try {
      if (isEdit && session) {
        const result = await updateSession(session.id, form);
        if (!result.ok) {
          setError(result.message);
          return;
        }
        router.push(menusRoutes.detail(session.id));
        return;
      }

      const created = await createSession(form);
      if (!created.ok) {
        setError(created.message);
        return;
      }
      router.push(menusRoutes.detail(created.data.id));
    } finally {
      setPending(false);
    }
  }

  if (isEdit && !session) return <SessionFormSkeleton mode={mode} />;

  return (
    <Box sx={{ width: '100%', p: 0 }}>
      <MenusBreadcrumb current={isEdit ? title : menusCopy.crumbCreate} />

      <Box sx={{ mb: 3 }}>
        <Button
          component={Link}
          href={menusRoutes.root}
          startIcon={<ArrowLeft size={16} />}
          sx={{ textTransform: 'none', fontWeight: 600, mb: 1, pl: 0 }}
        >
          {menusCopy.backToMenus}
        </Button>
        <Typography variant="h5" sx={{ fontWeight: 700, letterSpacing: '-0.02em', mb: 0.5 }}>
          {title}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {subtitle}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit} noValidate sx={{ width: '100%' }}>
        <Card
          variant="outlined"
          sx={{ p: { xs: 2, sm: 2.5 }, mb: 2.5, borderRadius: '12px', bgcolor: 'background.paper' }}
        >
          <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1rem', mb: 2 }}>
            {menusCopy.sessionDetails}
          </Typography>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' },
              gap: 2,
            }}
          >
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="label"
                htmlFor="sessionName"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                {menusCopy.nameLabel}
              </Typography>
              <TextField
                id="sessionName"
                hiddenLabel
                placeholder={menusCopy.namePlaceholder}
                value={form.name}
                onChange={(e) => updateField('name', e.target.value)}
                error={error === menusCopy.errors.nameRequired}
                helperText={error === menusCopy.errors.nameRequired ? error : undefined}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="label"
                htmlFor="sessionCode"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                {menusCopy.codeLabel}
              </Typography>
              <TextField
                id="sessionCode"
                hiddenLabel
                placeholder={menusCopy.codePlaceholder}
                value={form.code}
                onChange={(e) => updateField('code', e.target.value)}
                error={
                  error === menusCopy.errors.codeRequired || error === menusCopy.errors.codeTaken
                }
                helperText={
                  error === menusCopy.errors.codeRequired || error === menusCopy.errors.codeTaken
                    ? error
                    : undefined
                }
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { height: 40, borderRadius: '8px' } }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="label"
                htmlFor="menuTypeSelect"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                {menusCopy.typeLabel}
              </Typography>
              <FormControl fullWidth size="small" error={error === menusCopy.errors.typeRequired}>
                <Select
                  id="menuTypeSelect"
                  displayEmpty
                  value={form.menuType}
                  onChange={(e) => updateField('menuType', e.target.value as MenuSessionType)}
                  sx={{ height: 40, borderRadius: '8px' }}
                >
                  <MenuItem value="" disabled>
                    <Typography color="text.secondary" variant="body2">
                      {menusCopy.typePlaceholder}
                    </Typography>
                  </MenuItem>
                  {menuTypeOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </Select>
                {error === menusCopy.errors.typeRequired && (
                  <FormHelperText>{error}</FormHelperText>
                )}
              </FormControl>
            </Box>

            <Box sx={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column' }}>
              <Typography
                component="label"
                htmlFor="sessionDesc"
                sx={{ fontSize: '0.8125rem', fontWeight: 600, color: 'text.secondary', mb: 0.5 }}
              >
                {menusCopy.descriptionLabel}
              </Typography>
              <TextField
                id="sessionDesc"
                hiddenLabel
                placeholder={menusCopy.descriptionPlaceholder}
                value={form.description}
                onChange={(e) => updateField('description', e.target.value)}
                multiline
                rows={3}
                fullWidth
                size="small"
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: '8px' } }}
              />
            </Box>
          </Box>

          {error && !error.includes('required') && !error.includes('taken') && (
            <Alert severity="error" sx={{ mt: 2.5 }}>
              {error}
            </Alert>
          )}
        </Card>

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
          <Button
            component={Link}
            href={isEdit && session ? menusRoutes.detail(session.id) : menusRoutes.root}
            variant="outlined"
            disabled={pending}
            sx={{
              height: 40,
              borderRadius: '8px',
              textTransform: 'none',
              fontWeight: 600,
              color: 'text.secondary',
              borderColor: 'divider',
            }}
          >
            {menusCopy.cancel}
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={pending}
            startIcon={<Check size={16} />}
            sx={{ height: 40, borderRadius: '8px', textTransform: 'none', fontWeight: 600, px: 3 }}
          >
            {(() => {
              if (pending) return menusCopy.saving;
              if (isEdit) return menusCopy.saveChanges;
              return menusCopy.createSession;
            })()}
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
