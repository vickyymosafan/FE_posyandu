import {
  getBreakpoint,
  isBreakpoint,
  getResponsiveValue,
  getResponsiveClasses,
  getResponsiveSpacing,
  getResponsiveTypography,
  getResponsiveLayout,
  combineResponsiveClasses,
  getResponsiveGridCols
} from '../responsive';

describe('responsive utilities', () => {
  describe('getBreakpoint', () => {
    it('should return mobile for small widths', () => {
      expect(getBreakpoint(320)).toBe('mobile');
      expect(getBreakpoint(767)).toBe('mobile');
    });

    it('should return tablet for medium widths', () => {
      expect(getBreakpoint(768)).toBe('tablet');
      expect(getBreakpoint(1023)).toBe('tablet');
    });

    it('should return desktop for large widths', () => {
      expect(getBreakpoint(1024)).toBe('desktop');
      expect(getBreakpoint(1920)).toBe('desktop');
    });
  });

  describe('isBreakpoint', () => {
    it('should correctly identify mobile breakpoint', () => {
      expect(isBreakpoint(400, 'mobile')).toBe(true);
      expect(isBreakpoint(800, 'mobile')).toBe(false);
    });

    it('should correctly identify tablet breakpoint', () => {
      expect(isBreakpoint(800, 'tablet')).toBe(true);
      expect(isBreakpoint(400, 'tablet')).toBe(false);
      expect(isBreakpoint(1200, 'tablet')).toBe(false);
    });

    it('should correctly identify desktop breakpoint', () => {
      expect(isBreakpoint(1200, 'desktop')).toBe(true);
      expect(isBreakpoint(800, 'desktop')).toBe(false);
    });
  });

  describe('getResponsiveValue', () => {
    const values = {
      mobile: 'mobile-value',
      tablet: 'tablet-value',
      desktop: 'desktop-value'
    };

    it('should return correct value for each breakpoint', () => {
      expect(getResponsiveValue(values, 'mobile', 'fallback')).toBe('mobile-value');
      expect(getResponsiveValue(values, 'tablet', 'fallback')).toBe('tablet-value');
      expect(getResponsiveValue(values, 'desktop', 'fallback')).toBe('desktop-value');
    });

    it('should return fallback when value not found', () => {
      const partialValues = { tablet: 'tablet-value' };
      expect(getResponsiveValue(partialValues, 'mobile', 'fallback')).toBe('tablet-value');
      
      const emptyValues = {};
      expect(getResponsiveValue(emptyValues, 'mobile', 'fallback')).toBe('fallback');
    });

    it('should fallback to desktop, then tablet, then mobile', () => {
      const desktopOnly = { desktop: 'desktop-value' };
      expect(getResponsiveValue(desktopOnly, 'mobile', 'fallback')).toBe('desktop-value');

      const tabletOnly = { tablet: 'tablet-value' };
      expect(getResponsiveValue(tabletOnly, 'mobile', 'fallback')).toBe('tablet-value');
    });
  });

  describe('getResponsiveClasses', () => {
    const classes = {
      mobile: 'mobile-class',
      tablet: 'tablet-class',
      desktop: 'desktop-class'
    };

    it('should return correct class for each breakpoint', () => {
      expect(getResponsiveClasses(classes, 'mobile')).toBe('mobile-class');
      expect(getResponsiveClasses(classes, 'tablet')).toBe('tablet-class');
      expect(getResponsiveClasses(classes, 'desktop')).toBe('desktop-class');
    });

    it('should return empty string when class not found', () => {
      const partialClasses = { mobile: 'mobile-class' };
      expect(getResponsiveClasses(partialClasses, 'tablet')).toBe('');
    });
  });

  describe('getResponsiveSpacing', () => {
    it('should return correct spacing for each breakpoint', () => {
      expect(getResponsiveSpacing('container', 'mobile')).toBe('px-4');
      expect(getResponsiveSpacing('container', 'tablet')).toBe('px-6');
      expect(getResponsiveSpacing('container', 'desktop')).toBe('px-8');
    });

    it('should return correct spacing for different types', () => {
      expect(getResponsiveSpacing('section', 'mobile')).toBe('py-4');
      expect(getResponsiveSpacing('card', 'tablet')).toBe('p-6');
      expect(getResponsiveSpacing('gap', 'desktop')).toBe('gap-8');
    });
  });

  describe('getResponsiveTypography', () => {
    it('should return correct typography for each breakpoint', () => {
      expect(getResponsiveTypography('h1', 'mobile')).toBe('text-2xl font-bold');
      expect(getResponsiveTypography('h1', 'tablet')).toBe('text-3xl font-bold');
      expect(getResponsiveTypography('h1', 'desktop')).toBe('text-4xl font-bold');
    });

    it('should return correct typography for different types', () => {
      expect(getResponsiveTypography('body', 'mobile')).toBe('text-sm');
      expect(getResponsiveTypography('body', 'tablet')).toBe('text-base');
      expect(getResponsiveTypography('caption', 'desktop')).toBe('text-sm');
    });
  });

  describe('getResponsiveLayout', () => {
    it('should return correct layout for each breakpoint', () => {
      expect(getResponsiveLayout('maxWidth', 'mobile')).toBe('max-w-full');
      expect(getResponsiveLayout('maxWidth', 'tablet')).toBe('max-w-4xl');
      expect(getResponsiveLayout('maxWidth', 'desktop')).toBe('max-w-6xl');
    });

    it('should return correct layout for different types', () => {
      expect(getResponsiveLayout('columns', 'mobile')).toBe('grid-cols-1');
      expect(getResponsiveLayout('columns', 'tablet')).toBe('grid-cols-2');
      expect(getResponsiveLayout('columns', 'desktop')).toBe('grid-cols-3');
    });
  });

  describe('combineResponsiveClasses', () => {
    it('should combine multiple classes', () => {
      const result = combineResponsiveClasses('class1', 'class2', 'class3');
      expect(result).toBe('class1 class2 class3');
    });

    it('should filter out undefined classes', () => {
      const result = combineResponsiveClasses('class1', undefined, 'class3');
      expect(result).toBe('class1 class3');
    });

    it('should handle empty input', () => {
      const result = combineResponsiveClasses();
      expect(result).toBe('');
    });
  });

  describe('getResponsiveGridCols', () => {
    it('should return correct grid columns for each breakpoint', () => {
      expect(getResponsiveGridCols('mobile')).toBe('grid-cols-1');
      expect(getResponsiveGridCols('tablet')).toBe('grid-cols-2');
      expect(getResponsiveGridCols('desktop')).toBe('grid-cols-3');
    });

    it('should limit columns based on item count', () => {
      expect(getResponsiveGridCols('desktop', 2)).toBe('grid-cols-2');
      expect(getResponsiveGridCols('tablet', 1)).toBe('grid-cols-1');
      expect(getResponsiveGridCols('mobile', 5)).toBe('grid-cols-1');
    });
  });
});