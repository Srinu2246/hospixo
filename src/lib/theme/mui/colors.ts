export const colors = {
  primary: {
    default: '#2563EB',
    light: '#3B82F6',
    dark: '#1D4ED8',
  },

  secondary: {
    default: '#9C27B0',
    light: '#BA68C8',
    dark: '#7B1FA2',
  },

  success: {
    default: '#16A34A',
    light: '#22C55E',
    dark: '#15803D',
  },

  info: {
    default: '#0288D1',
    light: '#29B6F6',
    dark: '#01579B',
  },

  warning: {
    default: '#D97706',
    light: '#F59E0B',
    dark: '#B45309',
  },

  danger: {
    default: '#DC2626',
    light: '#EF4444',
    dark: '#B91C1C',
  },

  white: {
    default: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#F5F5F5',
  },

  black: {
    default: '#000000',
    light: '#0F172A',
    dark: '#000000',
  },

  gray: {
    default: '#64748B',
    light: '#94A3B8',
    dark: '#334155',
  },

  background: {
    default: '#F8FAFC',
    light: '#FAFAFA',
    dark: '#0B0D12',
  },

  surface: {
    default: '#FFFFFF',
    light: '#F8FAFC',
    dark: '#111827',
  },

  text: {
    primary: '#0F172A',
    secondary: '#475569',
    disabled: '#94A3B8',
  },

  border: {
    default: '#E2E8F0',
    light: '#F1F5F9',
    dark: '#CBD5E1',
  },

  divider: {
    default: '#E2E8F0',
    light: '#F1F5F9',
    dark: '#334155',
  },

  /** Platform auth screens — dedicated accent (matches Hospixo platform login). */
  auth: {
    accent: '#2563EB',
    accentForeground: '#FFFFFF',
    formPanel: '#F5F5F5',
    warningBg: '#FFFBEB',
    warningBorder: '#FDE68A',
    warningForeground: '#92400E',
    infoBg: '#EFF6FF',
    infoBorder: '#BFDBFE',
    infoForeground: '#1D4ED8',
    hero: {
      gradient1: '#081326',
      gradient2: '#0F172A',
      gradient3: '#111827',
      glow1: 'rgb(37 99 235 / 0.22)',
      glow2: 'rgb(59 130 246 / 0.12)',
      foreground: '#FFFFFF',
      foregroundMuted: 'rgb(255 255 255 / 0.78)',
      foregroundSubtle: 'rgb(255 255 255 / 0.68)',
      foregroundFaint: 'rgb(255 255 255 / 0.55)',
    },
  },

  /** Platform workspace shell (sidebar + topbar). */
  workspace: {
    canvas: '#F8FAFC',
    header: '#FFFFFF',
    sidebar: {
      bg: '#0B0D12',
      border: 'rgb(255 255 255 / 0.06)',
      foreground: '#F8FAFC',
      foregroundMuted: '#94A3B8',
      hoverBg: '#1E293B',
      activeBg: '#2563EB',
    },
  },
} as const;
