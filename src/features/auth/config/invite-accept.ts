export const inviteAcceptPageContent = {
  title: 'Accept invitation',
  description: 'Create your password to join your team on Hospixo.',
  footerPrefix: 'Already have an account?',
  footerLinkLabel: 'Sign in',
  fields: {
    firstName: { label: 'First name', placeholder: 'First name' },
    lastName: { label: 'Last name', placeholder: 'Last name' },
    password: { label: 'Create password', placeholder: 'At least 8 characters' },
    confirmPassword: { label: 'Confirm password', placeholder: 'Re-enter your password' },
  },
  submit: 'Accept invitation',
  submitting: 'Creating account…',
  errors: {
    missingToken: 'Invalid or missing invite link.',
    missingTokenSubmit: 'This invite link is missing a token. Open the link from your email.',
    invalidToken: 'This invite token looks invalid. Request a new invitation.',
    validation: 'Enter your first name and a password with at least 8 characters.',
    passwordMismatch: 'Passwords do not match.',
    fallback: 'Unable to accept invitation.',
  },
} as const;
