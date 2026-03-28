import { radius, spacing, typography } from './tokens';

export const THEME_MODES = Object.freeze({
    LIGHT: 'light',
    DARK: 'dark',
    SYSTEM: 'system',
});

export const RESOLVED_THEMES = Object.freeze({
    LIGHT: 'light',
    DARK: 'dark',
});

export const STATUS_BAR_STYLE_BY_THEME = Object.freeze({
    [RESOLVED_THEMES.LIGHT]: 'dark',
    [RESOLVED_THEMES.DARK]: 'light',
});

const darkColors = Object.freeze({
    bg: '#0a0a0a',
    surface: '#161616',
    surfaceMuted: '#1a1a1a',
    textPrimary: '#ffffff',
    textSecondary: '#d1d5db',
    textMuted: '#9ca3af',
    border: '#262626',
    borderStrong: '#303036',
    accent: '#6366f1',
    accentContrast: '#ffffff',
    success: '#10b981',
    warning: '#f59e0b',
    danger: '#ef4444',
    tabBarBackground: 'rgba(26, 26, 26, 0.95)',
    tabBarInactive: '#888888',
    tabBarBorder: 'rgba(255, 255, 255, 0.1)',
    overlay: 'rgba(0, 0, 0, 0.55)',
});

const lightColors = Object.freeze({
    bg: '#f5f7fb',
    surface: '#ffffff',
    surfaceMuted: '#f3f4f6',
    textPrimary: '#111827',
    textSecondary: '#374151',
    textMuted: '#6b7280',
    border: '#e5e7eb',
    borderStrong: '#d1d5db',
    accent: '#4f46e5',
    accentContrast: '#ffffff',
    success: '#059669',
    warning: '#d97706',
    danger: '#dc2626',
    tabBarBackground: 'rgba(255, 255, 255, 0.95)',
    tabBarInactive: '#6b7280',
    tabBarBorder: 'rgba(17, 24, 39, 0.08)',
    overlay: 'rgba(15, 23, 42, 0.18)',
});

export const darkTheme = Object.freeze({
    id: 'dark',
    colors: darkColors,
    spacing,
    radius,
    typography,
});

export const lightTheme = Object.freeze({
    id: 'light',
    colors: lightColors,
    spacing,
    radius,
    typography,
});
