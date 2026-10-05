/**
 * Admin control-plane design tokens (auth split layout + sidebar shell).
 * Single source of truth — exposed as CSS variables via AdminChromeCssVars and MUI theme palette.
 */
export const adminChrome = {
  /** Hex/rgb only — MUI palette and CssBaseline do not support oklch(). */
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
  shellBackground: '#f8fafc',
} as const;

/** CSS custom property names consumed by admin CSS modules. */
export function adminChromeCssVariableMap(): Record<string, string> {
  const { surface, auth, sidebar } = adminChrome;

  return {
    '--background': surface.background,
    '--foreground': surface.foreground,
    '--card': surface.card,
    '--card-foreground': surface.cardForeground,
    '--muted': surface.muted,
    '--muted-foreground': surface.mutedForeground,
    '--destructive': surface.destructive,
    '--success': surface.success,
    '--success-foreground': surface.successForeground,
    '--info': surface.info,
    '--border': surface.border,
    '--primary-foreground': surface.primaryForeground,
    '--auth-accent': auth.accent,
    '--auth-accent-foreground': auth.accentForeground,
    '--auth-info-foreground': auth.infoForeground,
    '--auth-hero-gradient-1': auth.heroGradient1,
    '--auth-hero-gradient-2': auth.heroGradient2,
    '--auth-hero-gradient-3': auth.heroGradient3,
    '--auth-hero-glow-1': auth.heroGlow1,
    '--auth-hero-glow-2': auth.heroGlow2,
    '--auth-hero-foreground': auth.heroForeground,
    '--auth-hero-foreground-muted': auth.heroForegroundMuted,
    '--auth-hero-foreground-faint': auth.heroForegroundFaint,
    '--admin-sidebar-bg': sidebar.background,
    '--admin-sidebar-border': sidebar.border,
    '--admin-sidebar-fg': sidebar.foreground,
    '--admin-sidebar-fg-muted': sidebar.foregroundMuted,
    '--admin-sidebar-fg-strong': sidebar.foregroundStrong,
    '--admin-sidebar-fg-brand': sidebar.foregroundBrand,
    '--admin-sidebar-hover-bg': sidebar.hoverBackground,
    '--admin-sidebar-active-bg': sidebar.activeBackground,
    '--admin-sidebar-brand-start': sidebar.brandStart,
    '--admin-sidebar-divider': sidebar.divider,
    '--admin-sidebar-width': sidebar.width,
    '--shell-background-color': adminChrome.shellBackground,
  };
}
