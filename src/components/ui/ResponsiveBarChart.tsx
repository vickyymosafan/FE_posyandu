'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { getResponsiveValue, combineResponsiveClasses } from '@/lib/utils/responsive';
import { Card } from '@/components/ui/card';

export interface BarChartDataPoint {
  label: string;
  value: number;
  color?: string;
  metadata?: any;
}

export interface ResponsiveBarChartProps {
  data: BarChartDataPoint[];
  title: string;
  className?: string;
  orientation?: 'horizontal' | 'vertical';
  showValues?: boolean;
  showPercentages?: boolean;
  formatValue?: (value: number) => string;
  onBarClick?: (dataPoint: BarChartDataPoint, index: number) => void;
  // New responsive props
  height?: number;
  fontSize?: { title: string; axis: string; tooltip: string; legend?: string };
  touchTargetSize?: number;
  padding?: number;
}

export default function ResponsiveBarChart({
  data,
  title,
  className = '',
  orientation = 'vertical',
  showValues = true,
  showPercentages = false,
  formatValue,
  onBarClick,
  // New responsive props with defaults
  height,
  fontSize,
  touchTargetSize: _touchTargetSize, // eslint-disable-line @typescript-eslint/no-unused-vars
  padding
}: ResponsiveBarChartProps) {
  const { currentBreakpoint, touchDevice } = useBreakpoint();
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w && !Number.isNaN(w)) setMeasuredWidth(w);
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  const [hoveredBar, setHoveredBar] = useState<number | null>(null);
  const [touchedBar, setTouchedBar] = useState<number | null>(null);

  // Responsive dimensions with override support
  const chartDimensionsBase = getResponsiveValue(
    {
      mobile: {
        width: 280,
        height: height || (orientation === 'vertical' ? 200 : 160),
        barThickness: orientation === 'vertical' ? 24 : 16,
        fontSize: fontSize?.axis || '12px',
        padding: padding || 16
      },
      tablet: {
        width: 360,
        height: height || (orientation === 'vertical' ? 240 : 200),
        barThickness: orientation === 'vertical' ? 32 : 20,
        fontSize: fontSize?.axis || '13px',
        padding: padding || 20
      },
      desktop: {
        width: 400,
        height: height || (orientation === 'vertical' ? 280 : 240),
        barThickness: orientation === 'vertical' ? 40 : 24,
        fontSize: fontSize?.axis || '14px',
        padding: padding || 24
      }
    },
    currentBreakpoint,
    {
      width: 400,
      height: height || 280,
      barThickness: 40,
      fontSize: fontSize?.axis || '14px',
      padding: padding || 24
    }
  );

  const chartDimensions = {
    ...chartDimensionsBase,
    width: measuredWidth ? Math.max(280, measuredWidth) : chartDimensionsBase.width
  } as typeof chartDimensionsBase;

  // Responsive font sizes with override support
  const responsiveFontSize = fontSize || getResponsiveValue(
    {
      mobile: { axis: '12px', tooltip: '12px', legend: '12px', title: 'text-sm' },
      tablet: { axis: '13px', tooltip: '13px', legend: '13px', title: 'text-base' },
      desktop: { axis: '14px', tooltip: '14px', legend: '14px', title: 'text-lg' }
    },
    currentBreakpoint,
    { axis: '14px', tooltip: '14px', legend: '14px', title: 'text-lg' }
  );

  // Touch target size with override support (for future use)
  // const responsiveTouchTargetSize = touchTargetSize || (touchDevice ? 8 : 4);

  // Filter valid data
  const validData = data.filter(d => 
    d.value !== null && 
    d.value !== undefined && 
    typeof d.value === 'number' && 
    !isNaN(d.value) &&
    d.value >= 0
  );

  if (validData.length === 0) {
    return (
      <Card className={combineResponsiveClasses('p-4', className)}>
        <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
        <div className="text-center py-8 text-gray-500">
          Tidak ada data untuk ditampilkan
        </div>
      </Card>
    );
  }

  // Calculate chart metrics
  const maxValue = Math.max(...validData.map(d => d.value));
  const totalValue = validData.reduce((sum, d) => sum + d.value, 0);

  // Default colors
  const defaultColors = [
    '#3b82f6', '#ef4444', '#10b981', '#f59e0b', 
    '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'
  ];

  // Format functions
  const defaultFormatValue = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    
    return value.toString();
  };

  const valueFormatter = formatValue || defaultFormatValue;

  // Handle interactions with improved touch handling
  const handleBarInteraction = (index: number, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (touchDevice) {
      // On touch devices, toggle the touched bar
      setTouchedBar(touchedBar === index ? null : index);
      setHoveredBar(null);
      
      // Provide haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      setHoveredBar(index);
      setTouchedBar(null);
    }

    if (onBarClick) {
      onBarClick(validData[index], index);
    }
  };

  // Handle touch start for better touch responsiveness (for future use)
  // const handleTouchStart = (index: number, event: React.TouchEvent) => {
  //   event.preventDefault();
  //   if (touchDevice) {
  //     setTouchedBar(index);
  //   }
  // };

  // Handle touch end (for future use)
  // const handleTouchEnd = (index: number, event: React.TouchEvent) => {
  //   event.preventDefault();
  //   // Keep the bar selected for details display
  // };

  const handleMouseEnter = (index: number) => {
    if (!touchDevice) {
      setHoveredBar(index);
    }
  };

  const handleMouseLeave = () => {
    if (!touchDevice) {
      setHoveredBar(null);
    }
  };

  const activeBar = touchDevice ? touchedBar : hoveredBar;

  // Calculate bar dimensions and positions
  const chartArea = {
    width: chartDimensions.width - (chartDimensions.padding * 2),
    height: chartDimensions.height - (chartDimensions.padding * 2) - 40 // space for labels
  };

  const renderVerticalChart = () => {
    const barWidth = Math.min(
      chartDimensions.barThickness,
      (chartArea.width - (validData.length - 1) * 8) / validData.length
    );
    const barSpacing = (chartArea.width - (barWidth * validData.length)) / (validData.length - 1 || 1);

    return (
      <svg 
        width={chartDimensions.width} 
        height={chartDimensions.height}
        className="overflow-visible"
      >
        {validData.map((item, index) => {
          const barHeight = (item.value / maxValue) * chartArea.height;
          const x = chartDimensions.padding + (index * (barWidth + barSpacing));
          const y = chartDimensions.padding + (chartArea.height - barHeight);
          const color = item.color || defaultColors[index % defaultColors.length];
          const isActive = activeBar === index;

          return (
            <g key={index}>
              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity={isActive ? 0.8 : 1}
                className={touchDevice ? 'cursor-pointer' : 'cursor-pointer hover:opacity-80'}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleBarInteraction(index, e)}
                onTouchStart={(e) => handleBarInteraction(index, e)}
              />

              {/* Value label */}
              {showValues && (
                <text
                  x={x + barWidth / 2}
                  y={y - 4}
                  textAnchor="middle"
                  fontSize={chartDimensions.fontSize}
                  fill="#374151"
                  className="font-medium"
                >
                  {valueFormatter(item.value)}
                  {showPercentages && totalValue > 0 && (
                    <tspan className="text-gray-500">
                      {` (${((item.value / totalValue) * 100).toFixed(1)}%)`}
                    </tspan>
                  )}
                </text>
              )}

              {/* Label */}
              <text
                x={x + barWidth / 2}
                y={chartDimensions.height - 8}
                textAnchor="middle"
                fontSize={chartDimensions.fontSize}
                fill="#6b7280"
                className="max-w-full"
              >
                {item.label.length > 10 && currentBreakpoint === 'mobile' 
                  ? `${item.label.substring(0, 8)}...` 
                  : item.label}
              </text>
            </g>
          );
        })}
      </svg>
    );
  };

  const renderHorizontalChart = () => {
    const barHeight = Math.min(
      chartDimensions.barThickness,
      (chartArea.height - (validData.length - 1) * 8) / validData.length
    );
    const barSpacing = (chartArea.height - (barHeight * validData.length)) / (validData.length - 1 || 1);
    const labelWidth = 80; // Space for labels on the left

    return (
      <svg 
        width={chartDimensions.width} 
        height={chartDimensions.height}
        className="overflow-visible"
      >
        {validData.map((item, index) => {
          const barWidth = (item.value / maxValue) * (chartArea.width - labelWidth);
          const x = chartDimensions.padding + labelWidth;
          const y = chartDimensions.padding + (index * (barHeight + barSpacing));
          const color = item.color || defaultColors[index % defaultColors.length];
          const isActive = activeBar === index;

          return (
            <g key={index}>
              {/* Label */}
              <text
                x={chartDimensions.padding + labelWidth - 8}
                y={y + barHeight / 2 + 4}
                textAnchor="end"
                fontSize={chartDimensions.fontSize}
                fill="#6b7280"
              >
                {item.label.length > 12 && currentBreakpoint === 'mobile' 
                  ? `${item.label.substring(0, 10)}...` 
                  : item.label}
              </text>

              {/* Bar */}
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={barHeight}
                fill={color}
                opacity={isActive ? 0.8 : 1}
                className={touchDevice ? 'cursor-pointer' : 'cursor-pointer hover:opacity-80'}
                onMouseEnter={() => handleMouseEnter(index)}
                onMouseLeave={handleMouseLeave}
                onClick={(e) => handleBarInteraction(index, e)}
                onTouchStart={(e) => handleBarInteraction(index, e)}
              />

              {/* Value label */}
              {showValues && (
                <text
                  x={x + barWidth + 4}
                  y={y + barHeight / 2 + 4}
                  textAnchor="start"
                  fontSize={chartDimensions.fontSize}
                  fill="#374151"
                  className="font-medium"
                >
                  {valueFormatter(item.value)}
                  {showPercentages && totalValue > 0 && (
                    <tspan className="text-gray-500">
                      {` (${((item.value / totalValue) * 100).toFixed(1)}%)`}
                    </tspan>
                  )}
                </text>
              )}
            </g>
          );
        })}
      </svg>
    );
  };

  return (
    <Card className={combineResponsiveClasses('p-4', className)}>
      <h4 className={`font-medium text-gray-900 mb-4 ${responsiveFontSize.title}`}>{title}</h4>
      
      <div className="flex justify-center" ref={containerRef}>
        <div className={currentBreakpoint === 'mobile' ? 'overflow-x-auto' : ''}>
          {orientation === 'vertical' ? renderVerticalChart() : renderHorizontalChart()}
        </div>
      </div>

      {/* Touch instruction for mobile */}
      {touchDevice && currentBreakpoint === 'mobile' && onBarClick && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Ketuk batang untuk melihat detail
        </div>
      )}

      {/* Active bar details */}
      {activeBar !== null && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900">
              {validData[activeBar].label}
            </span>
            <span className="text-lg font-bold" style={{ 
              color: validData[activeBar].color || defaultColors[activeBar % defaultColors.length] 
            }}>
              {valueFormatter(validData[activeBar].value)}
            </span>
          </div>
          {showPercentages && totalValue > 0 && (
            <div className="text-sm text-gray-600 mt-1">
              {((validData[activeBar].value / totalValue) * 100).toFixed(1)}% dari total
            </div>
          )}
        </div>
      )}
    </Card>
  );
}