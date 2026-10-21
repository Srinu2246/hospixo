'use client';

import { useState } from 'react';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Check, Clock } from 'lucide-react';

import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Breadcrumbs } from '@/components/shared/ui/Breadcrumbs';
import {
  sessionFormSchema,
  type SessionFormValues,
  type SessionRecord,
} from '@/lib/schemas/menu/sessions/sessionSchema';
import { colors } from '@/lib/theme/mui/colors';

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

  const [name, setName] = useState(initialSession?.name ?? '');
  const [startTime, setStartTime] = useState(initialSession?.startTime ?? '06:00 AM');
  const [endTime, setEndTime] = useState(initialSession?.endTime ?? '10:30 AM');
  const [isActive, setIsActive] = useState(initialSession?.status !== 'inactive');
  const [errors, setErrors] = useState<Partial<Record<keyof SessionFormValues, string>>>({});
  const sessionDisplayName = initialSession?.name?.trim() || 'Session';

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
            color: '#111827',
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
            color: '#6B7280',
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
          bgcolor: '#FFFFFF',
          border: '1px solid #E5E7EB',
          borderRadius: '16px',
          p: { xs: 2.5, sm: 3.5 },
          display: 'flex',
          flexDirection: 'column',
          gap: 3,
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)',
        }}
      >
        <Typography
          variant="h6"
          component="h2"
          sx={{
            fontWeight: 700,
            fontSize: '1.0625rem',
            color: '#111827',
          }}
        >
          Session Details
        </Typography>

        {/* Session Name */}
        <Box>
          <Typography
            component="label"
            htmlFor="session-name-input"
            sx={{
              display: 'block',
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
              mb: 1,
            }}
          >
            Session name *
          </Typography>
          <TextField
            id="session-name-input"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (errors.name) {
                setErrors((prev) => ({ ...prev, name: undefined }));
              }
            }}
            placeholder="e.g. Breakfast, Lunch, Dinner"
            fullWidth
            error={Boolean(errors.name)}
            helperText={errors.name}
            size="small"
            sx={{
              '& .MuiOutlinedInput-root': {
                borderRadius: '8px',
                bgcolor: '#FFFFFF',
                fontSize: '0.9375rem',
                '& fieldset': { borderColor: '#D1D5DB' },
                '&:hover fieldset': { borderColor: '#9CA3AF' },
                '&.Mui-focused fieldset': { borderColor: colors.primary.default || '#2563EB' },
              },
            }}
          />
        </Box>

        {/* Start Time & End Time */}
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
            gap: 2.5,
          }}
        >
          <Box>
            <Typography
              component="label"
              htmlFor="start-time-input"
              sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                mb: 1,
              }}
            >
              Start time *
            </Typography>
            <TextField
              id="start-time-input"
              value={startTime}
              onChange={(e) => {
                setStartTime(e.target.value);
                if (errors.startTime) {
                  setErrors((prev) => ({ ...prev, startTime: undefined }));
                }
              }}
              placeholder="e.g. 06:00 AM"
              fullWidth
              error={Boolean(errors.startTime)}
              helperText={errors.startTime}
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Clock size={18} color="#9CA3AF" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  fontSize: '0.9375rem',
                  '& fieldset': { borderColor: '#D1D5DB' },
                  '&:hover fieldset': { borderColor: '#9CA3AF' },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.default || '#2563EB' },
                },
              }}
            />
          </Box>

          <Box>
            <Typography
              component="label"
              htmlFor="end-time-input"
              sx={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: 600,
                color: '#374151',
                mb: 1,
              }}
            >
              End time *
            </Typography>
            <TextField
              id="end-time-input"
              value={endTime}
              onChange={(e) => {
                setEndTime(e.target.value);
                if (errors.endTime) {
                  setErrors((prev) => ({ ...prev, endTime: undefined }));
                }
              }}
              placeholder="e.g. 10:30 AM"
              fullWidth
              error={Boolean(errors.endTime)}
              helperText={errors.endTime}
              size="small"
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <Clock size={18} color="#9CA3AF" />
                    </InputAdornment>
                  ),
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '8px',
                  bgcolor: '#FFFFFF',
                  fontSize: '0.9375rem',
                  '& fieldset': { borderColor: '#D1D5DB' },
                  '&:hover fieldset': { borderColor: '#9CA3AF' },
                  '&.Mui-focused fieldset': { borderColor: colors.primary.default || '#2563EB' },
                },
              }}
            />
          </Box>
        </Box>

        {/* Status Toggle */}
        <Box>
          <Typography
            sx={{
              fontSize: '0.875rem',
              fontWeight: 600,
              color: '#374151',
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
                  color: colors.primary.default || '#2563EB',
                },
                '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                  backgroundColor: colors.primary.default || '#2563EB',
                },
              }}
            />
            <Typography
              sx={{
                fontSize: '0.9375rem',
                color: '#111827',
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
            borderColor: '#D1D5DB',
            color: '#374151',
            bgcolor: '#FFFFFF',
            fontWeight: 500,
            '&:hover': {
              borderColor: '#9CA3AF',
              bgcolor: '#F9FAFB',
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
            bgcolor: colors.primary.default || '#2563EB',
            '&:hover': {
              bgcolor: colors.primary.dark || '#1D4ED8',
            },
          }}
        >
          {isEdit ? 'Save Changes' : 'Create Session'}
        </ActionButton>
      </Stack>
    </Box>
  );
}
