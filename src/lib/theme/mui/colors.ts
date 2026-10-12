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

  sidebar: {
    background: '#13141F',
    surface: '#1A1C29',
    hover: 'rgba(255, 255, 255, 0.06)',
    active: '#3354F4',
    activeGlow: 'rgba(51, 84, 244, 0.35)',
    text: '#E5E7EB',
    textMuted: '#9CA3AF',
    textSection: '#6B7280',
    border: 'rgba(255, 255, 255, 0.08)',
    toggleBg: 'rgba(255, 255, 255, 0.06)',
    toggleHover: 'rgba(255, 255, 255, 0.12)',
    cardBg: '#1A1C2A',
    badgeBg: 'rgba(51, 84, 244, 0.15)',
    badgeText: '#60A5FA',
  },

  light: lightPalette,
  dark: darkPalette,
} as const;

export type Colors = typeof colors;
export type LightPalette = typeof lightPalette;
export type DarkPalette = typeof darkPalette;
