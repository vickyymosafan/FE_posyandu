/**
 * Enhanced color system with accessibility support for elderly users
 */

// Base color palette optimized for elderly users
const tintColorLight = '#2563eb'; // High contrast blue
const tintColorDark = '#60a5fa';

// Static colors for backward compatibility and elderly-friendly design
export const Colors = {
  light: {
    text: '#1e293b',
    background: '#f8fafc',
    tint: tintColorLight,
    icon: '#64748b',
    tabIconDefault: '#64748b',
    tabIconSelected: tintColorLight,
    surface: '#ffffff',
    border: '#e2e8f0',
    error: '#ef4444',
    success: '#10b981',
    warning: '#f59e0b',
    // Elderly-friendly colors
    primaryButton: '#2563eb',
    secondaryButton: '#64748b',
    dangerButton: '#dc2626',
    successButton: '#059669',
    // High contrast variants
    textHighContrast: '#000000',
    backgroundHighContrast: '#ffffff',
    borderHighContrast: '#000000',
  },
  dark: {
    text: '#f1f5f9',
    background: '#0f172a',
    tint: tintColorDark,
    icon: '#94a3b8',
    tabIconDefault: '#94a3b8',
    tabIconSelected: tintColorDark,
    surface: '#1e293b',
    border: '#334155',
    error: '#f87171',
    success: '#34d399',
    warning: '#fbbf24',
    // Elderly-friendly colors
    primaryButton: '#3b82f6',
    secondaryButton: '#6b7280',
    dangerButton: '#ef4444',
    successButton: '#10b981',
    // High contrast variants
    textHighContrast: '#ffffff',
    backgroundHighContrast: '#000000',
    borderHighContrast: '#ffffff',
  },
};
