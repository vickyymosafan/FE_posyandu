/**
 * Accessibility utilities for responsive components with Indonesian language support
 */

export interface AriaLabels {
  // Navigation
  navigation: {
    mainMenu: string;
    openMenu: string;
    closeMenu: string;
    skipToContent: string;
    breadcrumb: string;
    currentPage: string;
    subMenu: string;
  };
  
  // Forms
  forms: {
    required: string;
    optional: string;
    invalid: string;
    valid: string;
    loading: string;
    submit: string;
    cancel: string;
    clear: string;
    search: string;
    filter: string;
  };
  
  // Tables
  tables: {
    sortAscending: string;
    sortDescending: string;
    sortable: string;
    rowSelected: string;
    selectAll: string;
    deselectAll: string;
    pagination: string;
    currentPage: string;
    totalPages: string;
    itemsPerPage: string;
  };
  
  // Charts
  charts: {
    chart: string;
    dataPoint: string;
    trend: string;
    increase: string;
    decrease: string;
    noChange: string;
    loading: string;
    noData: string;
    interactive: string;
    tooltip: string;
    legend: string;
  };
  
  // Modals and Dialogs
  modals: {
    dialog: string;
    close: string;
    confirm: string;
    alert: string;
    warning: string;
    error: string;
    success: string;
    info: string;
  };
  
  // Status and Feedback
  status: {
    loading: string;
    success: string;
    error: string;
    warning: string;
    info: string;
    offline: string;
    online: string;
    saving: string;
    saved: string;
  };
  
  // Interactive Elements
  interactive: {
    button: string;
    link: string;
    tab: string;
    accordion: string;
    dropdown: string;
    checkbox: string;
    radio: string;
    slider: string;
    toggle: string;
  };
}

/**
 * Indonesian ARIA labels for accessibility
 */
export const indonesianAriaLabels: AriaLabels = {
  navigation: {
    mainMenu: 'Menu utama',
    openMenu: 'Buka menu',
    closeMenu: 'Tutup menu',
    skipToContent: 'Lewati ke konten utama',
    breadcrumb: 'Navigasi breadcrumb',
    currentPage: 'Halaman saat ini',
    subMenu: 'Sub menu'
  },
  
  forms: {
    required: 'Wajib diisi',
    optional: 'Opsional',
    invalid: 'Input tidak valid',
    valid: 'Input valid',
    loading: 'Memuat...',
    submit: 'Kirim formulir',
    cancel: 'Batal',
    clear: 'Hapus',
    search: 'Cari',
    filter: 'Saring'
  },
  
  tables: {
    sortAscending: 'Urutkan naik',
    sortDescending: 'Urutkan turun',
    sortable: 'Dapat diurutkan',
    rowSelected: 'Baris dipilih',
    selectAll: 'Pilih semua',
    deselectAll: 'Batalkan pilihan semua',
    pagination: 'Navigasi halaman',
    currentPage: 'Halaman saat ini',
    totalPages: 'Total halaman',
    itemsPerPage: 'Item per halaman'
  },
  
  charts: {
    chart: 'Grafik',
    dataPoint: 'Titik data',
    trend: 'Tren',
    increase: 'Meningkat',
    decrease: 'Menurun',
    noChange: 'Tidak berubah',
    loading: 'Memuat grafik...',
    noData: 'Tidak ada data untuk ditampilkan',
    interactive: 'Grafik interaktif',
    tooltip: 'Tooltip informasi',
    legend: 'Legenda grafik'
  },
  
  modals: {
    dialog: 'Dialog',
    close: 'Tutup dialog',
    confirm: 'Konfirmasi',
    alert: 'Peringatan',
    warning: 'Peringatan',
    error: 'Kesalahan',
    success: 'Berhasil',
    info: 'Informasi'
  },
  
  status: {
    loading: 'Sedang memuat',
    success: 'Berhasil',
    error: 'Terjadi kesalahan',
    warning: 'Peringatan',
    info: 'Informasi',
    offline: 'Tidak terhubung',
    online: 'Terhubung',
    saving: 'Menyimpan...',
    saved: 'Tersimpan'
  },
  
  interactive: {
    button: 'Tombol',
    link: 'Tautan',
    tab: 'Tab',
    accordion: 'Akordion',
    dropdown: 'Dropdown',
    checkbox: 'Kotak centang',
    radio: 'Tombol radio',
    slider: 'Slider',
    toggle: 'Saklar'
  }
};

/**
 * Generate ARIA label for form fields
 */
export function getFormFieldAriaLabel(
  fieldName: string,
  isRequired: boolean = false,
  hasError: boolean = false,
  errorMessage?: string
): string {
  let label = fieldName;
  
  if (isRequired) {
    label += `, ${indonesianAriaLabels.forms.required}`;
  } else {
    label += `, ${indonesianAriaLabels.forms.optional}`;
  }
  
  if (hasError && errorMessage) {
    label += `, ${indonesianAriaLabels.forms.invalid}: ${errorMessage}`;
  } else if (hasError) {
    label += `, ${indonesianAriaLabels.forms.invalid}`;
  }
  
  return label;
}

/**
 * Generate ARIA label for chart data points
 */
export function getChartDataPointAriaLabel(
  value: number,
  date: string,
  metric: string,
  formatValue?: (value: number) => string
): string {
  const formattedValue = formatValue ? formatValue(value) : value.toString();
  return `${indonesianAriaLabels.charts.dataPoint}: ${metric} ${formattedValue} pada ${date}`;
}

/**
 * Generate ARIA label for trend indicators
 */
export function getTrendAriaLabel(
  currentValue: number,
  previousValue: number,
  metric: string
): string {
  const change = currentValue - previousValue;
  const percentage = previousValue !== 0 ? Math.abs((change / previousValue) * 100) : 0;
  
  let trendLabel = '';
  if (change > 0) {
    trendLabel = `${indonesianAriaLabels.charts.increase} ${percentage.toFixed(1)}%`;
  } else if (change < 0) {
    trendLabel = `${indonesianAriaLabels.charts.decrease} ${percentage.toFixed(1)}%`;
  } else {
    trendLabel = indonesianAriaLabels.charts.noChange;
  }
  
  return `${indonesianAriaLabels.charts.trend} ${metric}: ${trendLabel}`;
}

/**
 * Generate ARIA label for table sorting
 */
export function getTableSortAriaLabel(
  columnName: string,
  sortDirection?: 'asc' | 'desc' | null
): string {
  let label = `${columnName}, ${indonesianAriaLabels.tables.sortable}`;
  
  if (sortDirection === 'asc') {
    label += `, ${indonesianAriaLabels.tables.sortAscending}`;
  } else if (sortDirection === 'desc') {
    label += `, ${indonesianAriaLabels.tables.sortDescending}`;
  }
  
  return label;
}

/**
 * Generate ARIA label for pagination
 */
export function getPaginationAriaLabel(
  currentPage: number,
  totalPages: number,
  itemsPerPage: number
): string {
  return `${indonesianAriaLabels.tables.pagination}: ${indonesianAriaLabels.tables.currentPage} ${currentPage} dari ${totalPages}, ${itemsPerPage} ${indonesianAriaLabels.tables.itemsPerPage}`;
}

/**
 * Focus management utilities
 */
export class FocusManager {
  private focusStack: HTMLElement[] = [];
  private trapElement: HTMLElement | null = null;
  private previousActiveElement: Element | null = null;

  /**
   * Trap focus within an element
   */
  trapFocus(element: HTMLElement): void {
    this.previousActiveElement = document.activeElement;
    this.trapElement = element;
    
    // Get all focusable elements
    const focusableElements = this.getFocusableElements(element);
    
    if (focusableElements.length === 0) return;
    
    // Focus first element
    focusableElements[0].focus();
    
    // Add event listener for tab key
    element.addEventListener('keydown', this.handleTrapKeydown);
  }

  /**
   * Release focus trap
   */
  releaseFocus(): void {
    if (this.trapElement) {
      this.trapElement.removeEventListener('keydown', this.handleTrapKeydown);
      this.trapElement = null;
    }
    
    // Restore previous focus
    if (this.previousActiveElement && 'focus' in this.previousActiveElement) {
      (this.previousActiveElement as HTMLElement).focus();
    }
    
    this.previousActiveElement = null;
  }

  /**
   * Push current focus to stack
   */
  pushFocus(): void {
    const activeElement = document.activeElement as HTMLElement;
    if (activeElement) {
      this.focusStack.push(activeElement);
    }
  }

  /**
   * Pop and restore focus from stack
   */
  popFocus(): void {
    const element = this.focusStack.pop();
    if (element) {
      element.focus();
    }
  }

  /**
   * Move focus to next focusable element
   */
  focusNext(): void {
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex < focusableElements.length - 1) {
      focusableElements[currentIndex + 1].focus();
    }
  }

  /**
   * Move focus to previous focusable element
   */
  focusPrevious(): void {
    const focusableElements = this.getFocusableElements(document.body);
    const currentIndex = focusableElements.indexOf(document.activeElement as HTMLElement);
    
    if (currentIndex > 0) {
      focusableElements[currentIndex - 1].focus();
    }
  }

  private getFocusableElements(element: HTMLElement): HTMLElement[] {
    const focusableSelectors = [
      'button:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      'a[href]',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    return Array.from(element.querySelectorAll(focusableSelectors)) as HTMLElement[];
  }

  private handleTrapKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab' || !this.trapElement) return;
    
    const focusableElements = this.getFocusableElements(this.trapElement);
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];
    
    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      }
    } else {
      // Tab
      if (document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }
  };
}

/**
 * Color contrast utilities
 */
export class ColorContrastChecker {
  /**
   * Calculate relative luminance of a color
   */
  private getRelativeLuminance(r: number, g: number, b: number): number {
    const [rs, gs, bs] = [r, g, b].map(c => {
      c = c / 255;
      return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    });
    
    return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
  }

  /**
   * Calculate contrast ratio between two colors
   */
  getContrastRatio(color1: string, color2: string): number {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);
    
    if (!rgb1 || !rgb2) return 0;
    
    const l1 = this.getRelativeLuminance(rgb1.r, rgb1.g, rgb1.b);
    const l2 = this.getRelativeLuminance(rgb2.r, rgb2.g, rgb2.b);
    
    const lighter = Math.max(l1, l2);
    const darker = Math.min(l1, l2);
    
    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Check if color combination meets WCAG AA standards
   */
  meetsWCAGAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 3 : ratio >= 4.5;
  }

  /**
   * Check if color combination meets WCAG AAA standards
   */
  meetsWCAGAAA(foreground: string, background: string, isLargeText: boolean = false): boolean {
    const ratio = this.getContrastRatio(foreground, background);
    return isLargeText ? ratio >= 4.5 : ratio >= 7;
  }

  /**
   * Convert hex color to RGB
   */
  private hexToRgb(hex: string): { r: number; g: number; b: number } | null {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Get accessible color suggestions
   */
  getAccessibleColorSuggestions(
    baseColor: string,
    backgroundColor: string = '#ffffff',
    targetRatio: number = 4.5
  ): string[] {
    const suggestions: string[] = [];
    const baseRgb = this.hexToRgb(baseColor);
    
    if (!baseRgb) return suggestions;
    
    // Try different lightness values
    for (let lightness = 0; lightness <= 100; lightness += 5) {
      const hsl = this.rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
      const adjustedRgb = this.hslToRgb(hsl.h, hsl.s, lightness / 100);
      const adjustedHex = this.rgbToHex(adjustedRgb.r, adjustedRgb.g, adjustedRgb.b);
      
      if (this.getContrastRatio(adjustedHex, backgroundColor) >= targetRatio) {
        suggestions.push(adjustedHex);
      }
    }
    
    return suggestions.slice(0, 5); // Return top 5 suggestions
  }

  private rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }
    
    return { h: h * 360, s: s * 100, l: l * 100 };
  }

  private hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
    h /= 360;
    s /= 100;
    l /= 100;
    
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  }

  private rgbToHex(r: number, g: number, b: number): string {
    return "#" + [r, g, b].map(x => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    }).join("");
  }
}

// Singleton instances
export const focusManager = new FocusManager();
export const colorContrastChecker = new ColorContrastChecker();

/**
 * Screen reader utilities
 */
export function announceToScreenReader(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
  const announcement = document.createElement('div');
  announcement.setAttribute('aria-live', priority);
  announcement.setAttribute('aria-atomic', 'true');
  announcement.className = 'sr-only';
  announcement.textContent = message;
  
  document.body.appendChild(announcement);
  
  // Remove after announcement
  setTimeout(() => {
    document.body.removeChild(announcement);
  }, 1000);
}

/**
 * Skip link component for keyboard navigation
 */
export function createSkipLink(targetId: string, text: string = indonesianAriaLabels.navigation.skipToContent): HTMLElement {
  const skipLink = document.createElement('a');
  skipLink.href = `#${targetId}`;
  skipLink.textContent = text;
  skipLink.className = 'sr-only focus:not-sr-only focus:absolute focus:top-0 focus:left-0 focus:z-50 focus:p-2 focus:bg-blue-600 focus:text-white';
  
  skipLink.addEventListener('click', (e) => {
    e.preventDefault();
    const target = document.getElementById(targetId);
    if (target) {
      target.focus();
      target.scrollIntoView({ behavior: 'smooth' });
    }
  });
  
  return skipLink;
}