import type { VerifiedMobileNumber } from '@/features/profile/types/user-profile';

export const profilePageCopy = {
  title: 'User Profile Settings',
  subtitle: 'Manage your public information, safety parameters, and update security credentials.',
  userInfoTitle: 'User Info',
  twoFactorLoginLabel: '2FA For Login',
  twoFactorLoginHint: 'Keep your account safe with 2FA.',
  securityTitle: 'Two-Factor Authentication',
  securityHint: 'Keep your account safe with 2FA.',
  twoFactorActiveMessage: '2FA is currently active and protecting your account.',
  twoFactorInactiveMessage: '2FA is currently disabled for your account.',
  twoFactorStateLabel: '2FA Protection State',
  passwordSectionTitle: 'Security & Password',
  passwordSectionHint: "Choose a strong password you haven't used before",
  passwordTip:
    'For your security, we suggest regular updates and using unique alphanumeric phrases.',
  changePasswordButton: 'Change Password',
  changePasswordFormTitle: 'Change Password',
  changePasswordFormHint:
    'Update your account credentials regularly to prevent unauthorized access.',
  currentPasswordLabel: 'Current Password',
  currentPasswordPlaceholder: 'Enter your current password',
  newPasswordLabel: 'New Password',
  newPasswordPlaceholder: 'Enter your new password',
  confirmPasswordLabel: 'Confirm Password',
  confirmPasswordPlaceholder: 'Confirm your new password',
  cancel: 'Cancel',
  savePassword: 'Change Password',
  logout: 'Logout',
} as const;

export const profileMenuCopy = {
  myProfile: 'My Profile',
  helpSupport: 'Help & Support',
  privacyPolicy: 'Privacy & Policy',
  termsConditions: 'Terms & Conditions',
  blogs: 'Blogs',
  logout: 'Logout',
  menuLabel: 'User menu',
} as const;

export const editUserInfoCopy = {
  title: 'Edit User Info',
  notice: 'Important: Please Save Your Changes Before You Leave.',
  nameLabel: 'Name',
  emailLabel: 'Email',
  verified: 'Verified',
  changeEmail: 'Change Email',
  linkedNumbersTitle: 'Linked Mobile Numbers',
  addNumber: '+ Add New Number',
  mobileNumberColumn: 'Mobile Number',
  actionColumn: 'Action',
  cancel: 'Cancel',
  save: 'Save',
} as const;

export const logoutDialogCopy = {
  title: 'Logout',
  message:
    'Are you sure you want to logout? You will need to sign in again to access your account.',
  cancel: 'Cancel',
  confirm: 'Logout',
} as const;

export const profileFallbackMobileNumbers: readonly VerifiedMobileNumber[] = [
  { id: 'mobile-1', number: '+91 9934329823', verified: true },
];

export const passwordRequirementLabels = {
  minLength: 'Minimum 8 characters',
  lowercase: 'At least 1 lowercase letter (a-z)',
  special: 'At least 1 special character (! @ #)',
  number: 'At least 1 number (0-9)',
  uppercase: 'At least 1 uppercase letter (A-Z)',
} as const;
