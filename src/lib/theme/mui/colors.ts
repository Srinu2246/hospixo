export const colors = {
  primary: {
    default: '#1976D2',
    light: '#42A5F5',
    dark: '#1565C0',
  },

  secondary: {
    default: '#9C27B0',
    light: '#BA68C8',
    dark: '#7B1FA2',
  },

  success: {
    default: '#2E7D32',
    light: '#4CAF50',
    dark: '#1B5E20',
  },

  info: {
    default: '#0288D1',
    light: '#29B6F6',
    dark: '#01579B',
  },

  warning: {
    default: '#ED6C02',
    light: '#FF9800',
    dark: '#E65100',
  },

  danger: {
    default: '#D32F2F',
    light: '#EF5350',
    dark: '#B71C1C',
  },

  white: {
    default: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#F5F5F5',
  },

  black: {
    default: '#000000',
    light: '#212121',
    dark: '#000000',
  },

  gray: {
    default: '#757575',
    light: '#BDBDBD',
    dark: '#424242',
  },

  background: {
    default: '#f8fafc',
    light: '#FAFAFA',
    dark: '#121212',
  },

  surface: {
    default: '#FFFFFF',
    light: '#F5F5F5',
    dark: '#1E1E1E',
  },

  text: {
    primary: '#212121',
    secondary: '#757575',
    disabled: '#BDBDBD',
  },

  border: {
    default: '#E0E0E0',
    light: '#EEEEEE',
    dark: '#BDBDBD',
  },

  divider: {
    default: '#E0E0E0',
    light: '#F0F0F0',
    dark: '#424242',
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
