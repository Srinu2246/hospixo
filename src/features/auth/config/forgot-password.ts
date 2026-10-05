export const forgotPasswordContent = {
  request: {
    title: 'Forgot your password?',
    description:
      'Enter the email linked to your Hospixo account and we will send reset instructions.',
    emailLabel: 'Email',
    emailPlaceholder: 'Enter your work email',
    submitLabel: 'Send reset link',
    backLabel: 'Back to sign in',
  },
  sent: {
    title: 'Check your email',
    descriptionPrefix: 'If an account exists for',
    descriptionSuffix: 'you will receive password reset instructions shortly.',
    spamHint: 'Did not receive it? Check spam or contact your administrator.',
    backLabel: 'Back to sign in',
    resendLabel: 'Try another email',
  },
} as const;
