/** Upstream Hospixo-style auth paths (BFF forwards here). */
export const UPSTREAM_AUTH_PATHS = {
  login: '/api/v1/auth/login',
  pinLogin: '/api/v1/auth/pin-login',
  otpSend: '/api/v1/auth/otp/send',
  forgotPassword: '/api/v1/auth/forgot-password',
} as const;
