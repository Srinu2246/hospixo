export const adminLoginContent = {
  form: {
    title: 'Sign In',
    description:
      'Enter your enterprise credentials to access your administrative restaurant dashboard.',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter Your Email',
    passwordLabel: 'Password',
    passwordPlaceholder: 'Enter your Password',
    submitLabel: 'Login',
    forgotPasswordLabel: 'Forgot Password?',
    securityBadge: 'SECURE ENDPOINT • 256-BIT ENCRYPTION',
    notice:
      'Notice: This is a restricted administrative system. Unauthorized login attempts are logged and strictly prohibited. Contact your network administrator for access assistance.',
  },
  errors: {
    invalidCredentials:
      'Invalid email or password. This sign-in is for platform administrators only.',
    unavailable: 'Platform sign-in is temporarily unavailable. Please try again later.',
    default: 'Unable to sign in. Please try again.',
    notConfigured: 'Admin login is not configured. Contact the system administrator.',
  },
} as const;
