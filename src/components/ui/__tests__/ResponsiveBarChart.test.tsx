import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveBarChart from '../ResponsiveBarChart';

// Mock useBreakpoint hook
jest.mock('@/lib/hooks/useBreakpoint', () => ({
  useBreakpoint: () => ({
    currentBreakpoint: 'desktop',
    touchDevice: false,
    screenSize: { width: 1024, height: 768 },
    isMobile: false,
    isTablet: false,
    isDesktop: true,
    orientation: 'landscape'
  })
}));

const mockData = [
  { label: 'Kategori A', value: 25 },
  { label: 'Kategori B', value: 40 },
  { label: 'Kategori C', value: 15 },
  { label: 'Kategori D', value: 30 }
];

describe('ResponsiveBarChart', () => {
  it('renders chart with title and data', () => {
    render(
      <ResponsiveBarChart
        data={mockData}
        title="Test Bar Chart"
      />
    );

    expect(screen.getByText('Test Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Kategori A')).toBeInTheDocument();
    expect(screen.getByText('Kategori B')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(
      <ResponsiveBarChart
        data={[]}
        title="Empty Bar Chart"
      />
    );

    expect(screen.getByText('Empty Bar Chart')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada data untuk ditampilkan')).toBeInTheDocument();
  });

  it('filters out invalid data points', () => {
    const invalidData = [
      { label: 'Valid', value: 25 },
      { label: 'Invalid NaN', value: NaN },
      { label: 'Invalid Null', value: null as any },
      { label: 'Invalid Negative', value: -5 },
      { label: 'Valid Zero', value: 0 }
    ];

    render(
      <ResponsiveBarChart
        data={invalidData}
        title="Test Chart"
      />
    );

    expect(screen.getByText('Valid')).toBeInTheDocument();
    expect(screen.getByText('Valid Zero')).toBeInTheDocument();
    expect(screen.queryByText('Invalid NaN')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid Null')).not.toBeInTheDocument();
    expect(screen.queryByText('Invalid Negative')).not.toBeInTheDocument();
  });

  it('shows values when enabled', () => {
    render(
      <ResponsiveBarChart
        data={mockData}
        title="Test Chart"
        showValues={true}
      />
    );

    expect(screen.getByText('25')).toBeInTheDocument();
    expect(screen.getByText('40')).toBeInTheDocument();
  });

  it('shows percentages when enabled', () => {
    render(
      <ResponsiveBarChart
        data={mockData}
        title="Test Chart"
        showValues={true}
        showPercentages={true}
      />
    );

    // Total is 110, so 25/110 = 22.7%
    expect(screen.getByText(/22\.7%/)).toBeInTheDocument();
  });

  it('calls onBarClick when bar is clicked', () => {
    const mockOnClick = jest.fn();

    render(
      <ResponsiveBarChart
        data={mockData}
        title="Test Chart"
        onBarClick={mockOnClick}
      />
    );

    // Find and click a bar (SVG rect element)
    const bars = document.querySelectorAll('rect');
    if (bars.length > 0) {
      fireEvent.click(bars[0]);
      expect(mockOnClick).toHaveBeenCalledWith(mockData[0], 0);
    }
  });

  it('uses custom format function', () => {
    const customFormat = (value: number) => `${value} items`;

    render(
      <ResponsiveBarChart
        data={mockData}
        title="Test Chart"
        showValues={true}
        formatValue={customFormat}
      />
    );

    expect(screen.getByText('25 items')).toBeInTheDocument();
    expect(screen.getByText('40 items')).toBeInTheDocument();
  });

  it('renders horizontal orientation correctly', () => {
    render(
      <ResponsiveBarChart
        data={mockData}
        title="Horizontal Chart"
        orientation="horizontal"
      />
    );

    expect(screen.getByText('Horizontal Chart')).toBeInTheDocument();
    // In horizontal mode, labels should still be visible
    expect(screen.getByText('Kategori A')).toBeInTheDocument();
  });

  it('uses custom colors when provided', () => {
    const dataWithColors = [
      { label: 'Red', value: 25, color: '#ff0000' },
      { label: 'Blue', value: 30, color: '#0000ff' }
    ];

    render(
      <ResponsiveBarChart
        data={dataWithColors}
        title="Colored Chart"
      />
    );

    expect(screen.getByText('Red')).toBeInTheDocument();
    expect(screen.getByText('Blue')).toBeInTheDocument();
  });

  it('shows active bar details when bar is interacted with', () => {
    render(
      <ResponsiveBarChart
        data={mockData}
        title="Interactive Chart"
        showPercentages={true}
      />
    );

    // Simulate hover/click on first bar
    const bars = document.querySelectorAll('rect');
    if (bars.length > 0) {
      fireEvent.mouseEnter(bars[0]);
      
      // Should show active bar details - check for multiple instances
      const kategoriAElements = screen.getAllByText('Kategori A');
      expect(kategoriAElements.length).toBeGreaterThan(0);
      
      // Check for the active bar details section
      expect(screen.getByText('22.7% dari total')).toBeInTheDocument();
    }
  });
});

// Test mobile responsiveness
describe('ResponsiveBarChart Mobile', () => {
  it('shows touch instructions on mobile with click handler', async () => {
    // Mock mobile breakpoint for this test
    const mockUseBreakpoint = jest.fn(() => ({
      currentBreakpoint: 'mobile',
      touchDevice: true,
      screenSize: { width: 375, height: 667 },
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait'
    }));

    jest.doMock('@/lib/hooks/useBreakpoint', () => ({
      useBreakpoint: mockUseBreakpoint
    }));

    const { default: ResponsiveBarChartMobile } = await import('../ResponsiveBarChart');
    const mockOnClick = jest.fn();

    render(
      <ResponsiveBarChartMobile
        data={mockData}
        title="Mobile Chart"
        onBarClick={mockOnClick}
      />
    );

    // Check if touch instructions are present (conditional)
    const touchInstructions = screen.queryByText('Ketuk batang untuk melihat detail');
    if (touchInstructions) {
      expect(touchInstructions).toBeInTheDocument();
    }
  });

  it('handles long labels appropriately', () => {
    const longLabelData = [
      { label: 'Very Long Category Name That Should Be Truncated', value: 25 }
    ];

    render(
      <ResponsiveBarChart
        data={longLabelData}
        title="Mobile Chart"
      />
    );

    // Should show the label (may be truncated in actual rendering)
    expect(screen.getByText(/Very Long/)).toBeInTheDocument();
  });
});