export const AUTH_COOKIE_NAME = 'hospixo_access_token';

/** HttpOnly refresh token — sent only to `POST /api/v1/auth/logout`. */
export const AUTH_REFRESH_COOKIE_NAME = 'hospixo_refresh_token';

/** Short-lived flag so workspace layout skips must-change-password after a successful change. */
export const AUTH_PASSWORD_CHANGED_COOKIE = 'hospixo_password_changed';

export const AUTH_SESSION_MAX_AGE_FALLBACK_SECONDS = 60 * 60 * 8;

/** Refresh tokens outlive access tokens; 7 days unless the API sends an expiry. */
export const AUTH_REFRESH_COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

/** How long to trust local password-change success before re-checking `/me`. */
export const AUTH_PASSWORD_CHANGED_MAX_AGE_SECONDS = 60;
