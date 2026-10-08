export const inviteRejectPageContent = {
  title: 'Decline invitation',
  description: 'If you do not want to join this team, you can decline the invitation below.',
  footerPrefix: 'Changed your mind?',
  footerLinkLabel: 'Accept invitation',
  submit: 'Decline Invitation',
  submitting: 'Declining…',
  errors: {
    missingToken: 'Missing invitation token. Please use the link from your email.',
    missingTokenSubmit: 'This invite link is missing a token. Open the link from your email.',
    invalidToken: 'This invite token looks invalid. Request a new invitation.',
    fallback: 'Unable to reject invitation.',
  },
} as const;
