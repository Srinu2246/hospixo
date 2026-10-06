'use client';

import { useCallback, useMemo, useState } from 'react';

import { buildUserProfile } from '@/features/profile/lib/build-user-profile';
import {
  canSubmitPasswordChange,
  type ChangePasswordForm,
  type UserProfile,
  type VerifiedMobileNumber,
} from '@/features/profile/types/user-profile';
import type { AuthUser } from '@/lib/auth';

const emptyPasswordForm: ChangePasswordForm = {
  currentPassword: '',
  newPassword: '',
  confirmPassword: '',
};

export function useUserProfileControls(user: AuthUser | null) {
  const initialProfile = useMemo(() => buildUserProfile(user), [user]);

  const [profile, setProfile] = useState<UserProfile>(initialProfile);
  const [editOpen, setEditOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [passwordFormOpen, setPasswordFormOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState<ChangePasswordForm>(emptyPasswordForm);
  const [draftName, setDraftName] = useState(initialProfile.name);
  const [draftMobileNumbers, setDraftMobileNumbers] = useState<VerifiedMobileNumber[]>([
    ...initialProfile.mobileNumbers,
  ]);

  const syncFromUser = useCallback(() => {
    const nextProfile = buildUserProfile(user);
    setProfile(nextProfile);
    setDraftName(nextProfile.name);
    setDraftMobileNumbers([...nextProfile.mobileNumbers]);
  }, [user]);

  const setTwoFactorEnabled = useCallback((enabled: boolean) => {
    setProfile((current) => ({ ...current, twoFactorEnabled: enabled }));
  }, []);

  const openEditDialog = useCallback(() => {
    setDraftName(profile.name);
    setDraftMobileNumbers([...profile.mobileNumbers]);
    setEditOpen(true);
  }, [profile.mobileNumbers, profile.name]);

  const closeEditDialog = useCallback(() => {
    setEditOpen(false);
  }, []);

  const saveProfileEdits = useCallback(() => {
    setProfile((current) => ({
      ...current,
      name: draftName.trim() || current.name,
      mobileNumbers: draftMobileNumbers,
    }));
    setEditOpen(false);
  }, [draftMobileNumbers, draftName]);

  const addMobileNumber = useCallback(() => {
    setDraftMobileNumbers((current) => [
      ...current,
      {
        id: `mobile-${Date.now()}`,
        number: '+91 ',
        verified: false,
      },
    ]);
  }, []);

  const removeMobileNumber = useCallback((id: string) => {
    setDraftMobileNumbers((current) => current.filter((entry) => entry.id !== id));
  }, []);

  const updateMobileNumber = useCallback((id: string, number: string) => {
    setDraftMobileNumbers((current) =>
      current.map((entry) => (entry.id === id ? { ...entry, number } : entry)),
    );
  }, []);

  const openPasswordForm = useCallback(() => {
    setPasswordForm(emptyPasswordForm);
    setPasswordFormOpen(true);
  }, []);

  const closePasswordForm = useCallback(() => {
    setPasswordForm(emptyPasswordForm);
    setPasswordFormOpen(false);
  }, []);

  const updatePasswordField = useCallback((field: keyof ChangePasswordForm, value: string) => {
    setPasswordForm((current) => ({ ...current, [field]: value }));
  }, []);

  const submitPasswordChange = useCallback(() => {
    if (!canSubmitPasswordChange(passwordForm)) return;
    closePasswordForm();
  }, [closePasswordForm, passwordForm]);

  return {
    profile,
    editOpen,
    logoutOpen,
    passwordFormOpen,
    passwordForm,
    draftName,
    draftMobileNumbers,
    setDraftName,
    setTwoFactorEnabled,
    openEditDialog,
    closeEditDialog,
    saveProfileEdits,
    addMobileNumber,
    removeMobileNumber,
    updateMobileNumber,
    openPasswordForm,
    closePasswordForm,
    updatePasswordField,
    submitPasswordChange,
    openLogoutDialog: () => setLogoutOpen(true),
    closeLogoutDialog: () => setLogoutOpen(false),
    syncFromUser,
  };
}
