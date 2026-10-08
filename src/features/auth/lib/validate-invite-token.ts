const MIN_INVITE_TOKEN_LENGTH = 32;

export function validateInviteTokenForSubmit(token: string): string | null {
  if (!token) {
    return 'This invite link is missing a token. Open the link from your email.';
  }
  if (token.length < MIN_INVITE_TOKEN_LENGTH) {
    return 'This invite token looks invalid. Request a new invitation.';
  }
  return null;
}
