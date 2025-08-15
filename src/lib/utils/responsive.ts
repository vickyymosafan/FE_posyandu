import { type Breakpoint, breakpointConfig } from '../hooks/useBreakpoint';

/**
 * Utility functions untuk responsive behavior
 */

/**
 * Mendapatkan breakpoint berdasarkan lebar layar
 */
export function getBreakpoint(width: number): Breakpoint {
  if (width <= breakpointConfig.mobile.max) {
    return 'mobile';
  } else if (width <= breakpointConfig.tablet.max) {
    return 'tablet';
  }
  return 'desktop';
}

/**
 * Mengecek apakah lebar layar sesuai dengan breakpoint tertentu
 */
export function isBreakpoint(width: number, breakpoint: Breakpoint): boolean {
  const config = breakpointConfig[breakpoint];
  return width >= config.min && width <= config.max;
}

/**
 * Mendapatkan nilai responsif berdasarkan breakpoint
 */
export function getResponsiveValue<T>(
  values: Partial<Record<Breakpoint, T>>,
  currentBreakpoint: Breakpoint,
  fallback: T
): T {
  return values[currentBreakpoint] ?? values.desktop ?? values.tablet ?? values.mobile ?? fallback;
}

/**
 * Menghasilkan class CSS responsif berdasarkan breakpoint
 */
export function getResponsiveClasses(
  classes: Partial<Record<Breakpoint, string>>,
  currentBreakpoint: Breakpoint
): string {
  const baseClasses = classes[currentBreakpoint] || '';
  return baseClasses;
}

/**
 * Konfigurasi spacing responsif
 */
export const responsiveSpacing = {
  mobile: {
    container: 'px-4',
    section: 'py-4',
    card: 'p-4',
    gap: 'gap-4'
  },
  tablet: {
    container: 'px-6',
    section: 'py-6',
    card: 'p-6',
    gap: 'gap-6'
  },
  desktop: {
    container: 'px-8',
    section: 'py-8',
    card: 'p-8',
    gap: 'gap-8'
  }
} as const;

/**
 * Konfigurasi typography responsif
 */
export const responsiveTypography = {
  mobile: {
    h1: 'text-2xl font-bold',
    h2: 'text-xl font-semibold',
    h3: 'text-lg font-medium',
    body: 'text-sm',
    caption: 'text-xs'
  },
  tablet: {
    h1: 'text-3xl font-bold',
    h2: 'text-2xl font-semibold',
    h3: 'text-xl font-medium',
    body: 'text-base',
    caption: 'text-sm'
  },
  desktop: {
    h1: 'text-4xl font-bold',
    h2: 'text-3xl font-semibold',
    h3: 'text-2xl font-medium',
    body: 'text-base',
    caption: 'text-sm'
  }
} as const;

/**
 * Konfigurasi layout responsif
 */
export const responsiveLayout = {
  mobile: {
    maxWidth: 'max-w-full',
    columns: 'grid-cols-1',
    padding: 'p-4',
    margin: 'm-4'
  },
  tablet: {
    maxWidth: 'max-w-4xl',
    columns: 'grid-cols-2',
    padding: 'p-6',
    margin: 'm-6'
  },
  desktop: {
    maxWidth: 'max-w-6xl',
    columns: 'grid-cols-3',
    padding: 'p-8',
    margin: 'm-8'
  }
} as const;

/**
 * Konfigurasi form responsif
 */
export const responsiveForm = {
  mobile: {
    inputHeight: 'h-12',
    fontSize: 'text-base', // 16px untuk mencegah zoom di iOS
    padding: 'px-4 py-3',
    borderRadius: 'rounded-lg',
    spacing: 'space-y-4'
  },
  tablet: {
    inputHeight: 'h-11',
    fontSize: 'text-sm',
    padding: 'px-3 py-2.5',
    borderRadius: 'rounded-md',
    spacing: 'space-y-5'
  },
  desktop: {
    inputHeight: 'h-10',
    fontSize: 'text-sm',
    padding: 'px-3 py-2',
    borderRadius: 'rounded-md',
    spacing: 'space-y-6'
  }
} as const;

/**
 * Konfigurasi button responsif
 */
export const responsiveButton = {
  mobile: {
    height: 'h-12',
    padding: 'px-6 py-3',
    fontSize: 'text-base',
    minTouchTarget: 'min-h-[44px] min-w-[44px]'
  },
  tablet: {
    height: 'h-11',
    padding: 'px-5 py-2.5',
    fontSize: 'text-sm',
    minTouchTarget: 'min-h-[44px] min-w-[44px]'
  },
  desktop: {
    height: 'h-10',
    padding: 'px-4 py-2',
    fontSize: 'text-sm',
    minTouchTarget: ''
  }
} as const;

/**
 * Mendapatkan spacing class berdasarkan breakpoint
 */
export function getResponsiveSpacing(
  type: keyof typeof responsiveSpacing.mobile,
  breakpoint: Breakpoint
): string {
  return responsiveSpacing[breakpoint][type];
}

/**
 * Mendapatkan typography class berdasarkan breakpoint
 */
export function getResponsiveTypography(
  type: keyof typeof responsiveTypography.mobile,
  breakpoint: Breakpoint
): string {
  return responsiveTypography[breakpoint][type];
}

/**
 * Mendapatkan layout class berdasarkan breakpoint
 */
export function getResponsiveLayout(
  type: keyof typeof responsiveLayout.mobile,
  breakpoint: Breakpoint
): string {
  return responsiveLayout[breakpoint][type];
}

/**
 * Utility untuk menggabungkan class responsif
 */
export function combineResponsiveClasses(...classes: (string | undefined)[]): string {
  return classes.filter(Boolean).join(' ');
}

/**
 * Mendapatkan grid columns berdasarkan breakpoint dan jumlah item
 */
export function getResponsiveGridCols(breakpoint: Breakpoint, itemCount?: number): string {
  const baseCols = {
    mobile: 1,
    tablet: 2,
    desktop: 3
  };

  const cols = itemCount ? Math.min(baseCols[breakpoint], itemCount) : baseCols[breakpoint];
  return `grid-cols-${cols}`;
}

/**
 * Mendapatkan konfigurasi table responsif
 */
export const responsiveTable = {
  mobile: {
    strategy: 'card-layout',
    showColumns: 2,
    stackVertical: true
  },
  tablet: {
    strategy: 'horizontal-scroll',
    showColumns: 4,
    stackVertical: false
  },
  desktop: {
    strategy: 'full-table',
    showColumns: Infinity,
    stackVertical: false
  }
} as const;

/**
 * Mendapatkan konfigurasi navigation responsif
 */
export const responsiveNavigation = {
  mobile: {
    type: 'hamburger-menu',
    position: 'overlay',
    width: 'w-64',
    backdrop: true
  },
  tablet: {
    type: 'collapsible-sidebar',
    position: 'fixed',
    width: 'w-16 hover:w-64',
    backdrop: false
  },
  desktop: {
    type: 'persistent-sidebar',
    position: 'fixed',
    width: 'w-64',
    backdrop: false
  }
} as const;