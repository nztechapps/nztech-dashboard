export const colors = {
  // Fondos
  bg: '#F9FAFB',
  surface: '#FFFFFF',
  surfaceHover: '#F3F4F6',
  surfaceActive: '#E5E7EB',

  // Acento NZTech
  accent: '#00E5A0',
  accentHover: '#00C98A',
  accentDark: '#003D2B',
  accentLight: '#D1FAE5',

  // Texto
  text: {
    primary: '#111827',
    secondary: '#6B7280',
    tertiary: '#9CA3AF',
    inverse: '#FFFFFF',
  },

  // Bordes
  border: {
    default: 'rgba(0,0,0,0.08)',
    strong: 'rgba(0,0,0,0.15)',
    light: 'rgba(0,0,0,0.04)',
  },

  // Estados semánticos
  success: {
    bg: '#ECFDF5',
    text: '#065F46',
    border: '#6EE7B7',
    dark: '#059669',
  },
  warning: {
    bg: '#FFFBEB',
    text: '#92400E',
    border: '#FCD34D',
    dark: '#D97706',
  },
  error: {
    bg: '#FEF2F2',
    text: '#991B1B',
    border: '#FCA5A5',
    dark: '#DC2626',
  },
  info: {
    bg: '#EFF6FF',
    text: '#1E40AF',
    border: '#93C5FD',
    dark: '#2563EB',
  },

  // Pipeline / IA
  pipeline: {
    bg: '#F5F3FF',
    text: '#4C1D95',
    border: '#C4B5FD',
    dark: '#7C3AED',
  },

  // Morado (secondary)
  purple: {
    50: '#F5F3FF',
    100: '#EDE9FE',
    500: '#8B5CF6',
    600: '#7C3AED',
    700: '#6D28D9',
  },
};

export const typography = {
  display: "'Syne', sans-serif",
  mono: "'DM Mono', monospace",
  body: "system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
};

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
};

export const radius = {
  sm: '6px',
  md: '8px',
  lg: '12px',
  xl: '16px',
  full: '9999px',
};

export const shadows = {
  sm: '0 1px 3px rgba(0,0,0,0.08)',
  md: '0 4px 12px rgba(0,0,0,0.08)',
  lg: '0 8px 24px rgba(0,0,0,0.10)',
};

export const z = {
  hide: -1,
  base: 0,
  overlay: 1000,
  dropdown: 1100,
  sticky: 1020,
  fixed: 1030,
  modal: 1040,
  popover: 1050,
  tooltip: 1060,
};
