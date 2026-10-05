/**
 * Admin control-plane tokens for MUI layouts (admin login split).
 * CSS variables for admin sidebar / auth live in `styles/theme-tokens.css`.
 */
export const adminChrome = {
  surface: {
    background: '#ffffff',
    foreground: '#252525',
    card: '#ffffff',
    cardForeground: '#252525',
    muted: '#f5f5f5',
    mutedForeground: '#737373',
    destructive: '#dc2626',
    border: '#e5e5e5',
    primaryForeground: '#fafafa',
    success: '#16a34a',
    successForeground: '#ffffff',
    info: '#2563eb',
  },
  auth: {
    accent: '#2563eb',
    accentForeground: '#ffffff',
    infoForeground: '#1d4ed8',
    heroGradient1: '#081326',
    heroGradient2: '#0f172a',
    heroGradient3: '#111827',
    heroGlow1: 'rgb(37 99 235 / 0.22)',
    heroGlow2: 'rgb(59 130 246 / 0.12)',
    heroForeground: '#ffffff',
    heroForegroundMuted: 'rgb(255 255 255 / 0.78)',
    heroForegroundFaint: 'rgb(255 255 255 / 0.55)',
  },
  sidebar: {
    background: '#0b1220',
    border: '#111827',
    foreground: '#e2e8f0',
    foregroundMuted: '#94a3b8',
    foregroundStrong: '#f8fafc',
    foregroundBrand: '#ffffff',
    hoverBackground: '#1e293b',
    activeBackground: '#2563eb',
    brandStart: '#1d4ed8',
    divider: 'rgb(255 255 255 / 0.08)',
    width: '15.5rem',
  },
} as const;
