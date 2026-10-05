import { authPromoContent } from '@/features/auth/config/promo';

export const loginPageContent = {
  promo: authPromoContent,
  form: {
    title: 'Welcome back to Hospixo',
    description:
      'Sign in to manage your hospitality operations, teams, branches, inventory, billing, and daily workflows.',
    emailLabel: 'Email / Mobile Number',
    emailPlaceholder: 'Enter your email or mobile number',
    domainLabel: 'Organization',
    domainPlaceholder: 'Enter your organization domain',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your password',
    submitLabel: 'Sign In',
    submittingLabel: 'Signing in...',
    forgotPasswordLabel: 'Forgot Password?',
    dividerLabel: 'OR',
    otpLabel: 'Sign in with OTP',
    ssoLabel: 'Sign in with SSO',
    footerPrefix: "Don't have an account?",
    footerLinkLabel: 'Contact your administrator',
  },
} as const;
