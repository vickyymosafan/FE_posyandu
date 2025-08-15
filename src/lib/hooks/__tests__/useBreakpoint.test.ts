import { renderHook, act } from '@testing-library/react';
import { useBreakpoint, useMediaQuery, useOrientation } from '../useBreakpoint';

// Mock window object
const mockWindow = {
  innerWidth: 1024,
  innerHeight: 768,
  addEventListener: jest.fn(),
  removeEventListener: jest.fn(),
  matchMedia: jest.fn()
};

// Mock window properties
Object.defineProperty(window, 'innerWidth', {
  writable: true,
  configurable: true,
  get: () => mockWindow.innerWidth,
});

Object.defineProperty(window, 'innerHeight', {
  writable: true,
  configurable: true,
  get: () => mockWindow.innerHeight,
});

Object.defineProperty(window, 'addEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.addEventListener,
});

Object.defineProperty(window, 'removeEventListener', {
  writable: true,
  configurable: true,
  value: mockWindow.removeEventListener,
});

Object.defineProperty(window, 'matchMedia', {
  writable: true,
  configurable: true,
  value: mockWindow.matchMedia,
});

describe('useBreakpoint', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
  });

  it('should return desktop breakpoint for large screens', () => {
    mockWindow.innerWidth = 1200;
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.currentBreakpoint).toBe('desktop');
    expect(result.current.isDesktop).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isTablet).toBe(false);
  });

  it('should return tablet breakpoint for medium screens', () => {
    mockWindow.innerWidth = 800;
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.currentBreakpoint).toBe('tablet');
    expect(result.current.isTablet).toBe(true);
    expect(result.current.isMobile).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should return mobile breakpoint for small screens', () => {
    mockWindow.innerWidth = 400;
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.currentBreakpoint).toBe('mobile');
    expect(result.current.isMobile).toBe(true);
    expect(result.current.isTablet).toBe(false);
    expect(result.current.isDesktop).toBe(false);
  });

  it('should detect landscape orientation', () => {
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.orientation).toBe('landscape');
  });

  it('should detect portrait orientation', () => {
    mockWindow.innerWidth = 768;
    mockWindow.innerHeight = 1024;
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.orientation).toBe('portrait');
  });

  it('should return correct screen size', () => {
    mockWindow.innerWidth = 1200;
    mockWindow.innerHeight = 800;
    const { result } = renderHook(() => useBreakpoint());

    expect(result.current.screenSize.width).toBe(1200);
    expect(result.current.screenSize.height).toBe(800);
  });

  it('should add resize event listener', () => {
    renderHook(() => useBreakpoint());
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should remove resize event listener on unmount', () => {
    const { unmount } = renderHook(() => useBreakpoint());
    unmount();
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});

describe('useMediaQuery', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return media query match result', () => {
    const mockMediaQuery = {
      matches: true,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockWindow.matchMedia.mockReturnValue(mockMediaQuery);

    const { result } = renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(result.current).toBe(true);
    expect(mockWindow.matchMedia).toHaveBeenCalledWith('(min-width: 768px)');
  });

  it('should add change event listener to media query', () => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockWindow.matchMedia.mockReturnValue(mockMediaQuery);

    renderHook(() => useMediaQuery('(min-width: 768px)'));

    expect(mockMediaQuery.addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });

  it('should remove change event listener on unmount', () => {
    const mockMediaQuery = {
      matches: false,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn()
    };

    mockWindow.matchMedia.mockReturnValue(mockMediaQuery);

    const { unmount } = renderHook(() => useMediaQuery('(min-width: 768px)'));
    unmount();

    expect(mockMediaQuery.removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
  });
});

describe('useOrientation', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
  });

  it('should return landscape for wider screens', () => {
    mockWindow.innerWidth = 1024;
    mockWindow.innerHeight = 768;
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('landscape');
  });

  it('should return portrait for taller screens', () => {
    mockWindow.innerWidth = 768;
    mockWindow.innerHeight = 1024;
    const { result } = renderHook(() => useOrientation());

    expect(result.current).toBe('portrait');
  });

  it('should add resize event listener', () => {
    renderHook(() => useOrientation());
    expect(mockWindow.addEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });

  it('should remove resize event listener on unmount', () => {
    const { unmount } = renderHook(() => useOrientation());
    unmount();
    expect(mockWindow.removeEventListener).toHaveBeenCalledWith('resize', expect.any(Function));
  });
});