'use client';

import { useMemo, useState } from 'react';
import {
  CheckCircle2,
  Eye,
  EyeOff,
  Info,
  KeyRound,
  Lock,
  Mail,
  PencilLine,
  ShieldCheck,
  Trash2,
  X,
} from 'lucide-react';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Switch from '@mui/material/Switch';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useTheme, type SxProps, type Theme } from '@mui/material/styles';

import { useAuth } from '@/context/auth';
import { LogoutDialog } from '@/features/profile/components/logout-dialog/logout-dialog';
import { UsersListPageSkeleton } from '@/features/user-roles/components/users-list/users-list-page-skeleton';
import { editUserInfoCopy, profilePageCopy } from '@/features/profile/config/profile';
import { useUserProfileControls } from '@/features/profile/hooks/use-profile';
import {
  canSubmitPasswordChange,
  getPasswordRequirements,
  type ChangePasswordForm,
  type UserProfile,
  type VerifiedMobileNumber,
} from '@/features/profile/types/user-profile';

const profileCardSx: SxProps<Theme> = (theme) => ({
  border: 1,
  borderColor: theme.palette.divider,
  borderRadius: '14px',
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  p: 2.5,
});

const profileSectionTitleSx: SxProps<Theme> = (theme) => ({
  fontSize: '1rem',
  fontWeight: 700,
  color: theme.palette.text.primary,
});

const profileMutedTextSx: SxProps<Theme> = (theme) => ({
  fontSize: '0.8125rem',
  color: theme.palette.text.secondary,
  lineHeight: 1.45,
});

const profileMutedSurfaceSx: SxProps<Theme> = {
  bgcolor: 'var(--muted)',
  color: 'var(--muted-foreground)',
};

const profileDividerTopSx: SxProps<Theme> = (theme) => ({
  pt: 2.5,
  borderTop: 1,
  borderColor: theme.palette.divider,
});

const profileIconButtonOutlineSx: SxProps<Theme> = (theme) => ({
  border: 1,
  borderColor: theme.palette.divider,
  width: 32,
  height: 32,
});

function ProfileSwitchField({
  checked,
  label,
  onCheckedChange,
  hint,
}: Readonly<{
  checked: boolean;
  label: string;
  onCheckedChange: (checked: boolean) => void;
  hint?: string;
}>) {
  return (
    <Stack
      direction="row"
      spacing={2}
      sx={{ width: '100%', alignItems: 'center', justifyContent: 'space-between' }}
    >
      <Stack spacing={0.25} sx={{ minWidth: 0 }}>
        <Typography
          component="span"
          color="text.primary"
          sx={{ fontSize: '0.875rem', fontWeight: 600 }}
        >
          {label}
        </Typography>
        {hint ? (
          <Typography component="span" color="text.secondary" sx={{ fontSize: '0.8125rem' }}>
            {hint}
          </Typography>
        ) : null}
      </Stack>
      <Switch
        checked={checked}
        onChange={(_, next) => onCheckedChange(next)}
        slotProps={{ input: { 'aria-label': label } }}
      />
    </Stack>
  );
}

function UserInfoCard({
  profile,
  onEdit,
  onTwoFactorChange,
}: Readonly<{
  profile: UserProfile;
  onEdit: () => void;
  onTwoFactorChange: (enabled: boolean) => void;
}>) {
  const primaryMobile = profile.mobileNumbers[0]?.number ?? '—';

  return (
    <Paper component="section" aria-label="User info" elevation={0} sx={profileCardSx}>
      <Stack direction="row" sx={{ mb: 2, alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography component="h2" sx={profileSectionTitleSx}>
          {profilePageCopy.userInfoTitle}
        </Typography>
        <IconButton
          size="small"
          aria-label="Edit user info"
          onClick={onEdit}
          sx={profileIconButtonOutlineSx}
        >
          <Box component="span" sx={{ color: 'text.secondary', display: 'flex' }}>
            <PencilLine size={15} aria-hidden />
          </Box>
        </IconButton>
      </Stack>

      <Stack
        component="dl"
        spacing={1.75}
        sx={{
          m: 0,
          mb: 2.5,
          '& .detail-row': {
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', sm: 'minmax(7rem, 10rem) 1fr' },
            gap: { xs: 0.25, sm: 1.5 },
            alignItems: 'baseline',
          },
        }}
      >
        {(
          [
            ['Name', profile.name],
            ['Email', profile.email],
            ['Mobile Numbers', primaryMobile],
          ] as const
        ).map(([label, value]) => (
          <Box key={label} className="detail-row">
            <Typography
              component="dt"
              color="text.secondary"
              sx={{ fontSize: '0.8125rem', fontWeight: 600 }}
            >
              {label}
            </Typography>
            <Typography
              component="dd"
              color="text.primary"
              sx={{ m: 0, fontSize: '0.875rem', fontWeight: 600, wordBreak: 'break-word' }}
            >
              {value}
            </Typography>
          </Box>
        ))}
      </Stack>

      <Divider sx={{ mb: 2 }} />
      <ProfileSwitchField
        checked={profile.twoFactorEnabled}
        label={profilePageCopy.twoFactorLoginLabel}
        hint={profilePageCopy.twoFactorLoginHint}
        onCheckedChange={onTwoFactorChange}
      />
    </Paper>
  );
}

function PasswordField({
  label,
  placeholder,
  value,
  onChange,
}: Readonly<{
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
}>) {
  const [visible, setVisible] = useState(false);

  return (
    <TextField
      fullWidth
      size="small"
      label={label}
      placeholder={placeholder}
      type={visible ? 'text' : 'password'}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      autoComplete="off"
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="end">
              <IconButton
                edge="end"
                aria-label={visible ? 'Hide password' : 'Show password'}
                onClick={() => setVisible((current) => !current)}
              >
                {visible ? <EyeOff size={18} /> : <Eye size={18} />}
              </IconButton>
            </InputAdornment>
          ),
        },
      }}
    />
  );
}

function ChangePasswordPanel({
  open,
  form,
  onOpen,
  onClose,
  onFieldChange,
  onSubmit,
}: Readonly<{
  open: boolean;
  form: ChangePasswordForm;
  onOpen: () => void;
  onClose: () => void;
  onFieldChange: (field: keyof ChangePasswordForm, value: string) => void;
  onSubmit: () => void;
}>) {
  const theme = useTheme();
  const requirements = useMemo(() => getPasswordRequirements(form.newPassword), [form.newPassword]);
  const canSubmit = canSubmitPasswordChange(form);

  if (!open) {
    return (
      <Stack
        component="section"
        direction={{ xs: 'column', md: 'row' }}
        spacing={2}
        sx={(t) => ({
          pt: 2.5,
          borderTop: 1,
          borderColor: t.palette.divider,
          alignItems: { md: 'flex-start' },
          justifyContent: 'space-between',
        })}
      >
        <Stack spacing={0.5} sx={{ minWidth: 0 }}>
          <Typography component="h3" sx={profileSectionTitleSx}>
            {profilePageCopy.passwordSectionTitle}
          </Typography>
          <Typography sx={profileMutedTextSx}>{profilePageCopy.passwordSectionHint}</Typography>
          <Stack direction="row" spacing={0.5} sx={{ alignItems: 'center' }}>
            <KeyRound size={14} aria-hidden />
            <Typography component="span" sx={profileMutedTextSx}>
              {profilePageCopy.passwordTip}
            </Typography>
          </Stack>
        </Stack>
        <Button
          variant="contained"
          startIcon={<Lock size={16} />}
          onClick={onOpen}
          sx={{ flexShrink: 0 }}
        >
          {profilePageCopy.changePasswordButton}
        </Button>
      </Stack>
    );
  }

  return (
    <Stack component="section" spacing={2} sx={profileDividerTopSx}>
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'flex-start', justifyContent: 'space-between' }}
      >
        <Box>
          <Typography component="h3" sx={profileSectionTitleSx}>
            {profilePageCopy.changePasswordFormTitle}
          </Typography>
          <Typography sx={profileMutedTextSx}>{profilePageCopy.changePasswordFormHint}</Typography>
        </Box>
        <IconButton aria-label="Close" onClick={onClose} sx={profileIconButtonOutlineSx}>
          <X size={15} aria-hidden />
        </IconButton>
      </Stack>

      <Stack spacing={1.75}>
        <PasswordField
          label={profilePageCopy.currentPasswordLabel}
          placeholder={profilePageCopy.currentPasswordPlaceholder}
          value={form.currentPassword}
          onChange={(value) => onFieldChange('currentPassword', value)}
        />
        <PasswordField
          label={profilePageCopy.newPasswordLabel}
          placeholder={profilePageCopy.newPasswordPlaceholder}
          value={form.newPassword}
          onChange={(value) => onFieldChange('newPassword', value)}
        />
        <PasswordField
          label={profilePageCopy.confirmPasswordLabel}
          placeholder={profilePageCopy.confirmPasswordPlaceholder}
          value={form.confirmPassword}
          onChange={(value) => onFieldChange('confirmPassword', value)}
        />
      </Stack>

      <Box
        component="ul"
        aria-label="Password requirements"
        sx={{
          ...profileMutedSurfaceSx,
          listStyle: 'none',
          m: 0,
          p: '14px 16px',
          borderRadius: '10px',
          display: 'grid',
          gap: 0.75,
        }}
      >
        {requirements.map((rule) => (
          <Typography
            key={rule.id}
            component="li"
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              fontSize: '0.8125rem',
              color: rule.met ? theme.palette.success.main : theme.palette.error.main,
            }}
          >
            <Box component="span" sx={{ width: 16, textAlign: 'center', fontWeight: 700 }}>
              {rule.met ? '✓' : '×'}
            </Box>
            {rule.label}
          </Typography>
        ))}
      </Box>

      <Stack direction="row" spacing={1.25} sx={{ justifyContent: 'flex-end' }}>
        <Button variant="outlined" onClick={onClose}>
          {profilePageCopy.cancel}
        </Button>
        <Button variant="contained" disabled={!canSubmit} onClick={onSubmit}>
          {profilePageCopy.savePassword}
        </Button>
      </Stack>
    </Stack>
  );
}

function SecuritySettingsCard({
  twoFactorEnabled,
  onTwoFactorChange,
  passwordFormOpen,
  passwordForm,
  onOpenPasswordForm,
  onClosePasswordForm,
  onPasswordFieldChange,
  onSubmitPasswordChange,
}: Readonly<{
  twoFactorEnabled: boolean;
  onTwoFactorChange: (enabled: boolean) => void;
  passwordFormOpen: boolean;
  passwordForm: ChangePasswordForm;
  onOpenPasswordForm: () => void;
  onClosePasswordForm: () => void;
  onPasswordFieldChange: (field: keyof ChangePasswordForm, value: string) => void;
  onSubmitPasswordChange: () => void;
}>) {
  return (
    <Paper component="section" aria-label="Security settings" elevation={0} sx={profileCardSx}>
      <Stack spacing={2}>
        <Stack spacing={0.25}>
          <Typography component="h2" sx={profileSectionTitleSx}>
            {profilePageCopy.securityTitle}
          </Typography>
          <Typography sx={profileMutedTextSx}>{profilePageCopy.securityHint}</Typography>
        </Stack>

        <Alert
          role="status"
          icon={<ShieldCheck size={16} aria-hidden />}
          severity={twoFactorEnabled ? 'success' : 'info'}
          variant="outlined"
          sx={{
            alignItems: 'flex-start',
            borderRadius: '10px',
            ...(!twoFactorEnabled && {
              bgcolor: 'var(--muted)',
              color: 'var(--foreground)',
              borderColor: 'var(--border)',
              '& .MuiAlert-icon': { color: 'var(--muted-foreground)' },
            }),
          }}
        >
          {twoFactorEnabled
            ? profilePageCopy.twoFactorActiveMessage
            : profilePageCopy.twoFactorInactiveMessage}
        </Alert>

        <ProfileSwitchField
          checked={twoFactorEnabled}
          label={profilePageCopy.twoFactorStateLabel}
          onCheckedChange={onTwoFactorChange}
        />
      </Stack>

      <ChangePasswordPanel
        open={passwordFormOpen}
        form={passwordForm}
        onOpen={onOpenPasswordForm}
        onClose={onClosePasswordForm}
        onFieldChange={onPasswordFieldChange}
        onSubmit={onSubmitPasswordChange}
      />
    </Paper>
  );
}

function EditUserInfoDialog({
  open,
  onOpenChange,
  name,
  email,
  mobileNumbers,
  onNameChange,
  onAddMobileNumber,
  onRemoveMobileNumber,
  onMobileNumberChange,
  onSave,
}: Readonly<{
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  email: string;
  mobileNumbers: readonly VerifiedMobileNumber[];
  onNameChange: (value: string) => void;
  onAddMobileNumber: () => void;
  onRemoveMobileNumber: (id: string) => void;
  onMobileNumberChange: (id: string, value: string) => void;
  onSave: () => void;
}>) {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      onClose={() => onOpenChange(false)}
      fullWidth
      maxWidth="md"
      aria-labelledby="edit-user-info-title"
    >
      <DialogTitle id="edit-user-info-title" sx={{ fontWeight: 700 }}>
        {editUserInfoCopy.title}
      </DialogTitle>

      <DialogContent dividers>
        <Alert
          severity="info"
          icon={<Info size={16} aria-hidden />}
          sx={{ mb: 2, borderRadius: '10px' }}
        >
          {editUserInfoCopy.notice}
        </Alert>

        <Stack spacing={2}>
          <TextField
            required
            fullWidth
            size="small"
            label={editUserInfoCopy.nameLabel}
            value={name}
            onChange={(event) => onNameChange(event.target.value)}
          />

          <Stack spacing={0.75}>
            <TextField
              required
              fullWidth
              size="small"
              label={editUserInfoCopy.emailLabel}
              value={email}
              slotProps={{
                input: {
                  readOnly: true,
                  startAdornment: (
                    <InputAdornment position="start">
                      <Box component="span" sx={{ color: 'text.secondary', display: 'flex' }}>
                        <Mail size={16} aria-hidden />
                      </Box>
                    </InputAdornment>
                  ),
                },
              }}
              sx={{ '& .MuiInputBase-root': { bgcolor: 'var(--muted)' } }}
            />
            <Stack
              direction="row"
              spacing={1}
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack
                direction="row"
                spacing={0.5}
                sx={{ alignItems: 'center', color: 'success.main' }}
              >
                <CheckCircle2 size={14} aria-hidden />
                <Typography sx={{ fontSize: '0.75rem', fontWeight: 600, color: 'inherit' }}>
                  {editUserInfoCopy.verified}
                </Typography>
              </Stack>
              <Button variant="text" size="small">
                {editUserInfoCopy.changeEmail}
              </Button>
            </Stack>
          </Stack>

          <Stack spacing={1}>
            <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
              <Typography
                component="h3"
                color="text.primary"
                sx={{ fontSize: '0.875rem', fontWeight: 600 }}
              >
                {editUserInfoCopy.linkedNumbersTitle}
              </Typography>
              <Button variant="text" size="small" onClick={onAddMobileNumber}>
                {editUserInfoCopy.addNumber}
              </Button>
            </Stack>

            <Box
              sx={{
                ...profileMutedSurfaceSx,
                display: 'grid',
                gridTemplateColumns: '1fr auto',
                gap: 1.5,
                px: 1.5,
                py: 1,
                borderRadius: 1,
                fontSize: '0.75rem',
                fontWeight: 600,
              }}
            >
              <span>{editUserInfoCopy.mobileNumberColumn}</span>
              <span>{editUserInfoCopy.actionColumn}</span>
            </Box>

            <Stack component="ul" spacing={1} sx={{ listStyle: 'none', m: 0, p: 0 }}>
              {mobileNumbers.map((entry) => (
                <Stack
                  key={entry.id}
                  component="li"
                  direction="row"
                  spacing={1}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '1fr auto',
                    gap: 1.5,
                    alignItems: 'center',
                  }}
                >
                  <Stack direction="row" spacing={1} sx={{ minWidth: 0, alignItems: 'center' }}>
                    <TextField
                      fullWidth
                      size="small"
                      value={entry.number}
                      onChange={(event) => onMobileNumberChange(entry.id, event.target.value)}
                      aria-label={`Mobile number ${entry.number}`}
                    />
                    {entry.verified ? (
                      <Chip
                        label={editUserInfoCopy.verified}
                        size="small"
                        sx={{
                          flexShrink: 0,
                          bgcolor: `${theme.palette.success.main}22`,
                          color: 'success.main',
                          fontWeight: 700,
                          fontSize: '0.6875rem',
                        }}
                      />
                    ) : null}
                  </Stack>
                  <IconButton
                    aria-label={`Remove ${entry.number}`}
                    onClick={() => onRemoveMobileNumber(entry.id)}
                    sx={{ ...profileIconButtonOutlineSx, borderRadius: 1 }}
                  >
                    <Trash2 size={15} aria-hidden />
                  </IconButton>
                </Stack>
              ))}
            </Stack>
          </Stack>
        </Stack>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={() => onOpenChange(false)}>{editUserInfoCopy.cancel}</Button>
        <Button variant="contained" onClick={onSave}>
          {editUserInfoCopy.save}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export function UserProfilePage() {
  const { user, isLoading } = useAuth();
  const controls = useUserProfileControls(user);

  if (isLoading) {
    return <UsersListPageSkeleton />;
  }

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        p: { xs: 2.5, md: '24px 28px 32px' },
        color: 'text.primary',
      }}
    >
      <Stack spacing={0.5}>
        <Typography
          component="h1"
          color="text.primary"
          sx={{ m: 0, fontSize: { xs: '1.35rem', md: '1.75rem' }, fontWeight: 700 }}
        >
          {profilePageCopy.title}
        </Typography>
        <Typography color="text.secondary" sx={{ m: 0, maxWidth: '42rem', fontSize: '0.875rem' }}>
          {profilePageCopy.subtitle}
        </Typography>
      </Stack>

      <Stack spacing={2}>
        <UserInfoCard
          profile={controls.profile}
          onEdit={controls.openEditDialog}
          onTwoFactorChange={controls.setTwoFactorEnabled}
        />
        <SecuritySettingsCard
          twoFactorEnabled={controls.profile.twoFactorEnabled}
          onTwoFactorChange={controls.setTwoFactorEnabled}
          passwordFormOpen={controls.passwordFormOpen}
          passwordForm={controls.passwordForm}
          onOpenPasswordForm={controls.openPasswordForm}
          onClosePasswordForm={controls.closePasswordForm}
          onPasswordFieldChange={controls.updatePasswordField}
          onSubmitPasswordChange={controls.submitPasswordChange}
        />
      </Stack>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end', pt: 1 }}>
        <Button
          variant="outlined"
          color="error"
          onClick={controls.openLogoutDialog}
          sx={{ minWidth: 96, fontWeight: 600 }}
        >
          {profilePageCopy.logout}
        </Button>
      </Box>

      <EditUserInfoDialog
        open={controls.editOpen}
        onOpenChange={(open) => {
          if (open) controls.openEditDialog();
          else controls.closeEditDialog();
        }}
        name={controls.draftName}
        email={controls.profile.email}
        mobileNumbers={controls.draftMobileNumbers}
        onNameChange={controls.setDraftName}
        onAddMobileNumber={controls.addMobileNumber}
        onRemoveMobileNumber={controls.removeMobileNumber}
        onMobileNumberChange={controls.updateMobileNumber}
        onSave={controls.saveProfileEdits}
      />

      <LogoutDialog
        open={controls.logoutOpen}
        onOpenChange={(open) => {
          if (open) controls.openLogoutDialog();
          else controls.closeLogoutDialog();
        }}
      />
    </Box>
  );
}
