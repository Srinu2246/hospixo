'use client';

import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

import { LogoutModal } from '@/components/shared/app/Logout';
import { ActionButton } from '@/components/shared/form-fields/ActionButton';
import { Toast, type ToastSeverity } from '@/components/shared/ui/Toast';
import { MOCK_ADMIN_PROFILE } from '@/lib/mocks/admin/useAdminProfile.mocks';
import type {
  EditUserInfoValues,
  UserProfile,
} from '@/lib/schemas/admin/profile/adminProfileSchema';
import { useSidebarStore } from '@/stores/sidebarStore';

import { EditUserInfoModal } from './EditUserInfoModal';
import { SecurityPasswordCard } from './SecurityPasswordCard';
import { UserInfoCard } from './UserInfoCard';

export interface AdminProfilePageProps {
  initialProfile?: UserProfile;
}

/**
 * AdminProfilePage
 *
 * User Profile Settings screen matching Hospixo design reference.
 * Sections:
 * - Page Header (Title + Subtitle)
 * - User info card with edit modal trigger and 2FA login toggle
 * - Two-factor authentication status and Security & Password management
 * - Account Logout action trigger
 */
export function AdminProfilePage({ initialProfile }: Readonly<AdminProfilePageProps> = {}) {
  const storeUser = useSidebarStore((state) => state.user);
  const storeAccount = useSidebarStore((state) => state.account);
  const setUser = useSidebarStore((state) => state.setUser);

  const [profile, setProfile] = useState<UserProfile>(() => {
    if (initialProfile) return initialProfile;
    const resolvedName = storeUser.name || MOCK_ADMIN_PROFILE.name;
    const resolvedEmail = storeUser.email || storeAccount?.email || MOCK_ADMIN_PROFILE.email;
    return {
      ...MOCK_ADMIN_PROFILE,
      name: resolvedName,
      email: resolvedEmail,
    };
  });

  const [editModalOpen, setEditModalOpen] = useState(false);
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);

  // Toast state
  const [toastOpen, setToastOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastSeverity, setToastSeverity] = useState<ToastSeverity>('success');

  function showToast(message: string, severity: ToastSeverity = 'success') {
    setToastMessage(message);
    setToastSeverity(severity);
    setToastOpen(true);
  }

  function handleSaveUserInfo(updated: EditUserInfoValues) {
    setProfile((prev) => ({
      ...prev,
      name: updated.name,
      mobileNumbers: updated.mobileNumbers,
    }));
    setUser({ name: updated.name });
    showToast('Profile information updated successfully');
  }

  function handleToggleTwoFactorLogin(checked: boolean) {
    setProfile((prev) => ({
      ...prev,
      twoFactorLogin: checked,
    }));
    if (checked) {
      showToast('2FA for login has been enabled');
    } else {
      showToast('2FA for login has been disabled', 'info');
    }
  }

  function handleToggleTwoFactorProtection(checked: boolean) {
    setProfile((prev) => ({
      ...prev,
      twoFactorProtection: checked,
    }));
    if (checked) {
      showToast('2FA protection is now active');
    } else {
      showToast('2FA protection has been deactivated', 'warning');
    }
  }

  function handleChangePassword() {
    showToast('Password updated successfully');
  }

  function handleChangeEmailNotice() {
    showToast('To change your verified email, please contact system administration.', 'info');
  }

  return (
    <Box
      sx={{
        width: '100%',
        boxSizing: 'border-box',
        display: 'flex',
        flexDirection: 'column',
        gap: 2.5,
        pb: 4,
      }}
    >
      {/* Page Header */}
      <Box sx={{ mb: 0.5 }}>
        <Typography
          variant="h4"
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.375rem', md: '1.5rem' },
            fontWeight: 700,
            color: 'text.primary',
            letterSpacing: '-0.01em',
            mb: 0.5,
          }}
        >
          User Profile Settings
        </Typography>
        <Typography
          sx={{
            fontSize: '0.8125rem',
            color: 'text.secondary',
          }}
        >
          Manage your profile information, safety parameters and update security credentials.
        </Typography>
      </Box>

      {/* Card 1: User info */}
      <UserInfoCard
        profile={profile}
        onEdit={() => setEditModalOpen(true)}
        onToggleTwoFactorLogin={handleToggleTwoFactorLogin}
      />

      {/* Card 2: Two-Factor Authentication & Password */}
      <SecurityPasswordCard
        profile={profile}
        onToggleTwoFactorProtection={handleToggleTwoFactorProtection}
        onChangePassword={handleChangePassword}
      />

      {/* Page-level Logout Action */}
      <Stack direction="row" sx={{ justifyContent: 'flex-end', mt: 1 }}>
        <ActionButton
          variant="outlined"
          onClick={() => setLogoutModalOpen(true)}
          sx={{
            px: 2.5,
            borderColor: 'divider',
            color: 'text.secondary',
            '&:hover': {
              borderColor: 'error.main',
              color: 'error.main',
              bgcolor: 'action.hover',
            },
          }}
        >
          Logout
        </ActionButton>
      </Stack>

      {/* Edit User Info Modal */}
      <EditUserInfoModal
        open={editModalOpen}
        onClose={() => setEditModalOpen(false)}
        profile={profile}
        onSave={handleSaveUserInfo}
        onChangeEmailRequest={handleChangeEmailNotice}
      />

      {/* Logout Confirmation Modal */}
      <LogoutModal open={logoutModalOpen} onClose={() => setLogoutModalOpen(false)} />

      {/* Notification Toast */}
      <Toast
        open={toastOpen}
        message={toastMessage}
        severity={toastSeverity}
        onClose={() => setToastOpen(false)}
      />
    </Box>
  );
}
