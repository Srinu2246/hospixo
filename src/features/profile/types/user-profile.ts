import { passwordRequirementLabels } from '@/features/profile/config/profile';

export type VerifiedMobileNumber = Readonly<{
  id: string;
  number: string;
  verified: boolean;
}>;

export type UserProfile = Readonly<{
  name: string;
  email: string;
  mobileNumbers: readonly VerifiedMobileNumber[];
  twoFactorEnabled: boolean;
  roleLabel: string;
}>;

export type PasswordRequirementId = 'minLength' | 'lowercase' | 'special' | 'number' | 'uppercase';

export type PasswordRequirement = Readonly<{
  id: PasswordRequirementId;
  label: string;
  met: boolean;
}>;

export type ChangePasswordForm = Readonly<{
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}>;

export function getPasswordRequirements(password: string): PasswordRequirement[] {
  return [
    {
      id: 'minLength',
      label: passwordRequirementLabels.minLength,
      met: password.length >= 8,
    },
    {
      id: 'lowercase',
      label: passwordRequirementLabels.lowercase,
      met: /[a-z]/.test(password),
    },
    {
      id: 'special',
      label: passwordRequirementLabels.special,
      met: /[!@#]/.test(password),
    },
    {
      id: 'number',
      label: passwordRequirementLabels.number,
      met: /\d/.test(password),
    },
    {
      id: 'uppercase',
      label: passwordRequirementLabels.uppercase,
      met: /[A-Z]/.test(password),
    },
  ];
}

export function isPasswordValid(password: string): boolean {
  return getPasswordRequirements(password).every((rule) => rule.met);
}

export function canSubmitPasswordChange(form: ChangePasswordForm): boolean {
  if (!form.currentPassword.trim()) return false;
  if (!isPasswordValid(form.newPassword)) return false;
  return form.newPassword === form.confirmPassword;
}
