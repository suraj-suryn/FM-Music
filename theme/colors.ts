/** Shared design tokens. Import this everywhere instead of raw hex values. */
export const Colors = {
  // Base backgrounds
  background: {
    dark: '#09090b',   // zinc-950
    light: '#ffffff',
  },
  surface: {
    dark: '#18181b',   // zinc-900
    light: '#f4f4f5',  // zinc-100
  },
  surfaceMuted: {
    dark: '#27272a',   // zinc-800
    light: '#e4e4e7',  // zinc-200
  },
  border: {
    dark: '#3f3f46',   // zinc-700
    light: '#d4d4d8',  // zinc-300
  },

  // Text
  text: {
    primary: { dark: '#fafafa', light: '#09090b' },
    secondary: { dark: '#a1a1aa', light: '#52525b' },
    muted: { dark: '#71717a', light: '#71717a' },
  },

  // Brand accent (indigo)
  brand: '#6366f1',
  brandLight: '#818cf8',
  brandDark: '#4f46e5',

  // Semantic
  live: '#ef4444',    // red-500 — used on LIVE badge
  success: '#22c55e', // green-500
  warning: '#f59e0b', // amber-500
} as const;
