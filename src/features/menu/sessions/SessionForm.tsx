'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import FormHelperText from '@mui/material/FormHelperText';
import Typography from '@mui/material/Typography';
import { Check } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Dropdown } from '@/components/shared/form-fields/Dropdown';
import { TimePicker } from '@/components/shared/form-fields/TimePicker';
import {
  formatSessionNameLabel,
  mealSessionTimeToFormValue,
  parseSessionNameForForm,
} from '@/lib/helpers/mealSessionMapper';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import {
  SESSION_NAME_OPTIONS,
  sessionFormSchema,
  type SessionFormValues,
  type SessionName,
  type SessionRecord,
} from '@/lib/schemas/menu/sessions/sessionSchema';
import { colors } from '@/lib/theme/mui/colors';
import { useThemeStore } from '@/stores/themeStore';

export interface SessionFormProps {
  mode: 'create' | 'edit';
  /** Sessions list base path used by edit breadcrumbs (e.g. /branch-manager/menu/sessions). */
  sessionsBasePath?: string;
  initialSession?: SessionRecord | null;
  onCancel: () => void;
  onSubmit: (values: SessionFormValues) => void | Promise<void>;
  submitting?: boolean;
}

/**
 * Create or Edit Meal Session form matching reference Image 2.
 * Breadcrumbs provide back navigation to the sessions list.
 */
export function SessionForm({
  mode,
  sessionsBasePath = '/branch-manager/menu/sessions',
  initialSession,
  onCancel,
  onSubmit,
  submitting = false,
}: Readonly<SessionFormProps>) {
  const isEdit = mode === 'edit';
  const themeMode = useThemeStore((state) => state.mode);
  const isDark = themeMode === 'dark';
  const textPrimary = isDark ? colors.text.darkPrimary : colors.text.primary;
  const textSecondary = isDark ? colors.text.darkSecondary : colors.text.secondary;
  const surfaceBg = isDark ? colors.surface.dark : colors.surface.default;
  const surfaceMuted = isDark ? colors.surface.darkMuted : colors.background.default;
  const borderColor = isDark ? colors.border.dark : colors.border.default;
  const fieldBorder = isDark ? colors.border.dark : '#D1D5DB';
  const labelColor = isDark ? colors.text.darkSecondary : '#374151';

  const [name, setName] = useState<SessionName | ''>(() =>
    parseSessionNameForForm(initialSession?.name),
  );
  const [startTime, setStartTime] = useState(
    mealSessionTimeToFormValue(initialSession?.startTime ?? '06:00'),
  );
  const [endTime, setEndTime] = useState(
    mealSessionTimeToFormValue(initialSession?.endTime ?? '10:30'),
  );
  const [isActive, setIsActive] = useState(initialSession?.status !== 'inactive');
  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormValues, string>>>({});
  const sessionDisplayName = initialSession?.name
    ? formatSessionNameLabel(initialSession.name)
    : 'Session';

  const fieldSx = {
    '& .MuiOutlinedInput-root': {
      borderRadius: '8px',
      bgcolor: surfaceBg,
      color: textPrimary,
      fontSize: '0.9375rem',
      '& fieldset': { borderColor: fieldBorder },
      '&:hover fieldset': { borderColor: textSecondary },
      '&.Mui-focused fieldset': { borderColor: colors.primary.default },
    },
  } as const;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const parsed = sessionFormSchema.safeParse({
      name,
      startTime,
      endTime,
      status: isActive ? 'active' : 'inactive',
    });

    if (!parsed.success) {
      const fieldErrors: Partial<Record<keyof SessionFormValues, string>> = {};
      parsed.error.issues.forEach((issue) => {
        const fieldName = issue.path[0] as keyof SessionFormValues;
        if (fieldName && !fieldErrors[fieldName]) {
          fieldErrors[fieldName] = issue.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    setErrors({});
    onSubmit(parsed.data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit}
      sx={{
        width: '100%',
        maxWidth: 1100,
        display: 'flex',
        flexDirection: 'column',
        gap: 3,
      }}
    >
      <Breadcrumbs
        items={[
          {
            label: 'Sessions',
            href: sessionsBasePath,
            onClick: (event) => {
              event.preventDefault();
              onCancel();
            },
          },
          {
            label: isEdit ? sessionDisplayName : 'Create Session',
            active: true,
          },
        ]}
        linkSx={{
          color: 'text.primary',
          fontWeight: 500,
          '&:hover': { color: 'primary.main', textDecoration: 'underline' },
        }}
        activeSx={{ color: 'primary.main', fontWeight: 600 }}
      />

      {/* Header */}
      <Box>
        <Typography
          variant="h4"
          component="h1"
          sx={{
            fontWeight: 700,
            fontSize: { xs: '1.5rem', sm: '1.875rem' },
            color: textPrimary,
            lineHeight: 1.2,
            letterSpacing: '-0.02em',
          }}
        >
          {isEdit ? 'Edit Session' : 'Create Session'}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            mt: 0.75,
            color: textSecondary,
            fontSize: '0.9375rem',
          }}
        >
          {isEdit
            ? `Configure ${sessionDisplayName} session name, start and end times, and active status.`
            : 'Configure session name, start and end times, and active status.'}
        </Typography>
      </Box>

      {/* Session Details Card */}
      <Box
        sx={{
          bgcolor: surfaceBg,
          border: `1px solid ${borderColor}`,
          borderRadius: '16px',
          p: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          boxShadow: isDark ? 'none' : '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.0625rem',
            color: textPrimary,
          }}
        >
          Session Details
        </Typography>

        {/* Session Name */}
        <Box>
          <Typography
            component="label"
            htmlFor="session-name-select"
            sx={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: labelColor,
              mb: 1,
            }}
          >
            Session name *
          </Typography>
          <Dropdown<SessionName>
            options={SESSION_NAME_OPTIONS}
            value={name}
            onChange={(next) => {
              setName(next);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="Select session name"
            size="small"
            minWidth="100%"
            disabled={submitting}
            sx={{
              width: '100%',
              ...fieldSx,
            }}
          />
          {errors.name ? (
            <FormHelperText error sx={{ mx: 0, mt: 0.75 }}>
              {errors.name}
            </FormHelperText>
          ) : null}
        </Box>

        {/* Start Time & End Time */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          <TimePicker
            id="start-time-input"
            label="Start time"
            required
            value={startTime}
            onChange={(next) => {
              setStartTime(next);
              if (errors.startTime) {
                setErrors((prev) => ({ ...prev, startTime: undefined }));
              }
            }}
            error={Boolean(errors.startTime)}
            helperText={errors.startTime ?? '24-hour (00–23 : 00–59)'}
            disabled={submitting}
          />

          <TimePicker
            id="end-time-input"
            label="End time"
            required
            value={endTime}
            onChange={(next) => {
              setEndTime(next);
              if (errors.endTime) {
                setErrors((prev) => ({ ...prev, endTime: undefined }));
              }
            }}
            error={Boolean(errors.endTime)}
            helperText={errors.endTime ?? '24-hour (00–23 : 00–59)'}
            disabled={submitting}
          />
        </Box>

        {/* Status Toggle */}
        <Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: labelColor,
              mb: 1,
            }}
          >
            Status
          </Typography>

          <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center' }}>
            <Switch
              checked={isActive}
              onChange={(e) => setIsActive(e.target.checked)}
              color="primary"
              sx={{
                '& .MuiSwitch-switchBase.Mui-checked': {
                  color: colors.primary.default,
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: colors.primary.default,
                },
              }}
            />
            <Typography
              sx={{
                fontSize: '0.9375rem',
                color: textPrimary,
                fontWeight: 500,
              }}
            >
              {isActive ? 'Active' : 'Inactive'}
            </Typography>
          </Stack>
        </Box>
      </Box>

      {/* Footer Actions */}
      <Stack
        direction="row"
        spacing={2}
        sx={{
          justifyContent: 'flex-end',
          alignItems: 'center',
          pt: 1,
        }}
      >
        <ActionButton
          type="button"
          variant="outlined"
          onClick={onCancel}
          disabled={submitting}
          sx={{
            minWidth: 100,
            borderRadius: '8px',
            borderColor: fieldBorder,
            color: textPrimary,
            bgcolor: surfaceBg,
            fontWeight: 500,
            '&:hover': {
              borderColor: textSecondary,
              bgcolor: surfaceMuted,
            },
          }}
        >
          Cancel
        </ActionButton>

        <ActionButton
          type="submit"
          variant="primary"
          startIcon={<Check size={18} />}
          loading={submitting}
          sx={{
            minWidth: 150,
            borderRadius: '8px',
            bgcolor: colors.primary.default,
            '&:hover': {
              bgcolor: colors.primary.dark,
            },
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Session'}
        </ActionButton>
      </Stack>
    </Box>
  );
}
