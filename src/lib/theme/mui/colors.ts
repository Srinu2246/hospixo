/**
 * Hospixo Centralized Color Palette
 *
 * Supports both Light and Dark theme semantics, derived from the Hospixo Design System.
 * - Primary: Hospixo Royal / Electric Blue (#2952E3 / #2563EB)
 * - Surfaces & Borders: Refined neutral & slate scales
 * - Dark: High-contrast obsidian & slate navy (#13141F, #1A1C29)
 * - Light: Modern crisp white & cloud slate (#FFFFFF, #F8F9FA, #E2E4EC)
 */

export const lightPalette = {
  primary: {
    default: '#3354F4',
    light: '#5975F7',
    dark: '#223ecb',
    hover: '#223ecb',
    contrastText: '#FFFFFF',
  },
  secondary: {
    default: '#4F46E5',
    light: '#6366F1',
    dark: '#3730A3',
    contrastText: '#FFFFFF',
  },
  success: {
    default: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  info: {
    default: '#0284C7',
    light: '#38BDF8',
    dark: '#0369A1',
    contrastText: '#FFFFFF',
  },
  warning: {
    default: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  danger: {
    default: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#F8F9FA',
    light: '#FFFFFF',
    dark: '#F1F3F5',
  },
  surface: {
    default: '#FFFFFF',
    light: '#F8F9FA',
    dark: '#EDEFF2',
    muted: '#F4F5F7',
  },
  border: {
    default: '#E2E4EC',
    light: '#EDF0F5',
    dark: '#CBD5E1',
  },
  divider: {
    default: '#E5E7EB',
    light: '#F3F4F6',
    dark: '#D1D5DB',
  },
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
  },
} as const;

export const darkPalette = {
  primary: {
    default: '#3354F4',
    light: '#5975F7',
    dark: '#223ecb',
    hover: '#223ecb',
    contrastText: '#FFFFFF',
  },
  secondary: {
    default: '#6366F1',
    light: '#818CF8',
    dark: '#4F46E5',
    contrastText: '#FFFFFF',
  },
  success: {
    default: '#10B981',
    light: '#34D399',
    dark: '#059669',
    contrastText: '#FFFFFF',
  },
  info: {
    default: '#38BDF8',
    light: '#7DD3FC',
    dark: '#0284C7',
    contrastText: '#FFFFFF',
  },
  warning: {
    default: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
    contrastText: '#FFFFFF',
  },
  danger: {
    default: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
    contrastText: '#FFFFFF',
  },
  background: {
    default: '#0F1017',
    light: '#13141F',
    dark: '#090A0F',
  },
  surface: {
    default: '#161824',
    light: '#1F2232',
    dark: '#10111A',
    muted: '#1A1C29',
  },
  border: {
    default: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(255, 255, 255, 0.05)',
  },
  divider: {
    default: 'rgba(255, 255, 255, 0.08)',
    light: 'rgba(255, 255, 255, 0.12)',
    dark: 'rgba(255, 255, 255, 0.05)',
  },
  text: {
    primary: '#F9FAFB',
    secondary: '#9CA3AF',
    disabled: '#6B7280',
  },
} as const;

export const colors = {
  primary: {
    default: '#3354F4',
    light: '#5975F7',
    dark: '#223ecb',
    hover: '#223ecb',
  },

  secondary: {
    default: '#4F46E5',
    light: '#6366F1',
    dark: '#3730A3',
  },

  success: {
    default: '#10B981',
    light: '#34D399',
    dark: '#059669',
  },

  info: {
    default: '#0284C7',
    light: '#38BDF8',
    dark: '#0369A1',
  },

  warning: {
    default: '#F59E0B',
    light: '#FBBF24',
    dark: '#D97706',
  },

  danger: {
    default: '#EF4444',
    light: '#F87171',
    dark: '#DC2626',
  },

  white: {
    default: '#FFFFFF',
    light: '#FFFFFF',
    dark: '#F5F5F5',
  },

  black: {
    default: '#000000',
    light: '#111827',
    dark: '#000000',
  },

  gray: {
    default: '#6B7280',
    light: '#9CA3AF',
    dark: '#374151',
  },

  background: {
    default: '#F8F9FA',
    light: '#FFFFFF',
    dark: '#13141F',
    obsidian: '#0F1017',
  },

  surface: {
    default: '#FFFFFF',
    light: '#F8F9FA',
    dark: '#161824',
    muted: '#F4F5F7',
    darkMuted: '#1A1C29',
  },

  text: {
    primary: '#111827',
    secondary: '#6B7280',
    disabled: '#9CA3AF',
    darkPrimary: '#F9FAFB',
    darkSecondary: '#9CA3AF',
    darkDisabled: '#6B7280',
  },

  border: {
    default: '#E2E4EC',
    light: '#EDF0F5',
    dark: '#2A2D3E',
    darkSubtle: 'rgba(255, 255, 255, 0.08)',
  },

  divider: {
    default: '#E2E4EC',
    light: '#F3F4F6',
    dark: 'rgba(255, 255, 255, 0.08)',
  },

  login: {
    panel: '#0C1228',
    panelGlow: '#1C2B66',
    headline: '#FFFFFF',
    body: '#C9D0DE',
    muted: '#9AA3B5',
    check: '#3D6BFF',
    inactiveSurface: '#FDF2F4',
    inactiveBorder: '#E11D48',
    branchSurface: '#FFF8EB',
    branchBorder: '#F59E0B',
  },

  captainFlow: {
    pageBackground: '#F4F7FE',
    primary: '#2563EB',
    navInactive: '#6B7280',
    kotAction: '#EA580C',
    kotActionHover: '#C2410C',
  },

  entityList: {
    canvas: '#F8FAFC',
    infoTint: 'rgba(2, 132, 199, 0.08)',
    infoTintStrong: 'rgba(2, 132, 199, 0.1)',
    successTint: 'rgba(22, 163, 74, 0.1)',
    cardShadow: '0 1px 2px rgb(0 0 0 / 0.04)',
  },

  sidebar: {
    background: '#0B0D12',
    surface: '#1E293B',
    hover: '#1E293B',
    active: '#2563EB',
    activeGlow: 'rgba(37, 99, 235, 0.35)',
    text: '#F8FAFC',
    textMuted: '#CBD5E1',
    textSection: '#94A3B8',
    border: 'rgba(255, 255, 255, 0.06)',
    toggleBg: '#1A1F2B',
    toggleHover: '#242B3A',
    cardBg: '#334155',
    badgeBg: 'rgba(37, 99, 235, 0.15)',
    badgeText: '#93C5FD',
  },

  light: lightPalette,
  dark: darkPalette,
} as const;
