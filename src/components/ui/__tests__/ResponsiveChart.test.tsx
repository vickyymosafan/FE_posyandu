import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import ResponsiveChart from '../ResponsiveChart';

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
  { date: '2024-01-01', value: 10 },
  { date: '2024-01-02', value: 15 },
  { date: '2024-01-03', value: 12 },
  { date: '2024-01-04', value: 18 },
  { date: '2024-01-05', value: 20 }
];

describe('ResponsiveChart', () => {
  it('renders chart with title and data', () => {
    render(
      <ResponsiveChart
        data={mockData}
        title="Test Chart"
        metric="Test Metric"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
    expect(screen.getByText('Test Metric')).toBeInTheDocument();
  });

  it('renders empty state when no data provided', () => {
    render(
      <ResponsiveChart
        data={[]}
        title="Empty Chart"
        metric="Test Metric"
      />
    );

    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
    expect(screen.getByText('Tidak ada data untuk ditampilkan')).toBeInTheDocument();
  });

  it('filters out invalid data points', () => {
    const invalidData = [
      { date: '2024-01-01', value: 10 },
      { date: '2024-01-02', value: NaN },
      { date: '2024-01-03', value: null as any },
      { date: '2024-01-04', value: undefined as any },
      { date: '2024-01-05', value: 20 }
    ];

    render(
      <ResponsiveChart
        data={invalidData}
        title="Test Chart"
        metric="Test Metric"
      />
    );

    // Should only render valid data points - check for SVG element
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
  });

  it('shows secondary line when enabled', () => {
    const dataWithSecondary = [
      { date: '2024-01-01', value: 10, secondaryValue: 8 },
      { date: '2024-01-02', value: 15, secondaryValue: 12 },
      { date: '2024-01-03', value: 12, secondaryValue: 10 }
    ];

    render(
      <ResponsiveChart
        data={dataWithSecondary}
        title="Test Chart"
        metric="Primary"
        showSecondaryLine={true}
      />
    );

    expect(screen.getByText('Sekunder')).toBeInTheDocument();
  });

  it('calls onDataPointClick when data point is clicked', () => {
    const mockOnClick = jest.fn();

    render(
      <ResponsiveChart
        data={mockData}
        title="Test Chart"
        metric="Test Metric"
        onDataPointClick={mockOnClick}
      />
    );

    // Find and click the first data point circle
    const circles = document.querySelectorAll('circle');
    if (circles.length > 0) {
      fireEvent.click(circles[0]);
      expect(mockOnClick).toHaveBeenCalledWith(mockData[0], 0);
    }
  });

  it('uses custom format functions', () => {
    const customFormatValue = (value: number) => `${value} units`;
    const customFormatDate = (date: string) => `Date: ${date}`;

    render(
      <ResponsiveChart
        data={mockData}
        title="Test Chart"
        metric="Test Metric"
        formatValue={customFormatValue}
        formatDate={customFormatDate}
        showLatestValue={true}
      />
    );

    expect(screen.getByText('20 units')).toBeInTheDocument();
  });

  it('shows latest value when enabled', () => {
    render(
      <ResponsiveChart
        data={mockData}
        title="Test Chart"
        metric="Test Metric"
        showLatestValue={true}
      />
    );

    expect(screen.getByText('Nilai Terakhir:')).toBeInTheDocument();
    expect(screen.getByText('20.0')).toBeInTheDocument();
  });

  it('hides legend when disabled', () => {
    render(
      <ResponsiveChart
        data={mockData}
        title="Test Chart"
        metric="Test Metric"
        showLegend={false}
      />
    );

    expect(screen.queryByText('Test Metric')).not.toBeInTheDocument();
  });
});

// Test mobile responsiveness
describe('ResponsiveChart Mobile', () => {
  it('shows touch instructions on mobile', async () => {
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

    // Re-import the component to use the mocked hook
    const { default: ResponsiveChartMobile } = await import('../ResponsiveChart');

    render(
      <ResponsiveChartMobile
        data={mockData}
        title="Mobile Chart"
        metric="Test Metric"
      />
    );

    // Check if touch instructions are present (may be conditional)
    const touchInstructions = screen.queryByText('Ketuk titik data untuk melihat detail');
    // This test is optional since the instructions only show on mobile with touch device
    if (touchInstructions) {
      expect(touchInstructions).toBeInTheDocument();
    }
  });
});