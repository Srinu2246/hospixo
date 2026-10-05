/** Server-side upstream API root (no trailing slash). */
export function getApiBaseUrl(): string | null {
  const candidates = [
    process.env.API_BASE_URL,
    process.env.API_URL,
    process.env.BACKEND_API_URL,
    process.env.NEXT_PUBLIC_API_BASE_URL,
    process.env.NEXT_PUBLIC_API_URL,
  ];

  for (const value of candidates) {
    const trimmed = value?.trim();
    if (trimmed) {
      return trimmed.replace(/\/+$/, '');
    }
  }

  return null;
}

export function isAuthDevMockEnabled(): boolean {
  if (process.env.NODE_ENV !== 'development') {
    return false;
  }
  if (process.env.AUTH_DEV_MOCK === 'false') {
    return false;
  }
  return getApiBaseUrl() === null;
}
