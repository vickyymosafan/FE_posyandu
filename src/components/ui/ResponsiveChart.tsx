'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { getResponsiveValue, combineResponsiveClasses } from '@/lib/utils/responsive';
import { Card } from '@/components/ui/card';
import { 
  indonesianAriaLabels, 
  getChartDataPointAriaLabel, 
  announceToScreenReader,
  focusManager
} from '@/lib/utils/accessibility';

export interface ChartDataPoint {
  date: string;
  value: number;
  secondaryValue?: number;
  label?: string;
  metadata?: any;
}

export interface ResponsiveChartProps {
  data: ChartDataPoint[];
  title: string;
  metric: string;
  primaryColor?: string;
  secondaryColor?: string;
  showSecondaryLine?: boolean;
  formatValue?: (value: number) => string;
  formatDate?: (date: string) => string;
  className?: string;
  onDataPointClick?: (dataPoint: ChartDataPoint, index: number) => void;
  showTooltip?: boolean;
  showLegend?: boolean;
  showLatestValue?: boolean;
  // New responsive props
  height?: number;
  fontSize?: { title: string; axis: string; tooltip: string; legend?: string };
  touchTargetSize?: number;
  padding?: number;
}

interface ChartDimensions {
  width: number;
  height: number;
  marginLeft: number;
  marginRight: number;
  marginTop: number;
  marginBottom: number;
  plotWidth: number;
  plotHeight: number;
}

export default function ResponsiveChart({
  data,
  title,
  metric,
  primaryColor = '#3b82f6',
  secondaryColor = '#ef4444',
  showSecondaryLine = false,
  formatValue,
  formatDate,
  className = '',
  onDataPointClick,
  showTooltip = true,
  showLegend = true,
  showLatestValue = true,
  // New responsive props with defaults
  height,
  fontSize,
  touchTargetSize,
  padding
}: ResponsiveChartProps) {
  const { currentBreakpoint, touchDevice } = useBreakpoint();
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null);
  const [touchedPoint, setTouchedPoint] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [measuredWidth, setMeasuredWidth] = useState<number | null>(null);

  // Observe container width so chart adapts responsively to parent size
  useEffect(() => {
    const el = containerRef.current;
    if (!el || typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(entries => {
      for (const entry of entries) {
        const w = Math.floor(entry.contentRect.width);
        if (w && !Number.isNaN(w)) {
          setMeasuredWidth(w);
        }
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Responsive chart dimensions with override support
  const baseDimensions = getResponsiveValue<ChartDimensions>(
    {
      mobile: {
        width: 320,
        height: height || 180,
        marginLeft: 40,
        marginRight: 16,
        marginTop: padding || 16,
        marginBottom: 32,
        plotWidth: 0,
        plotHeight: 0
      },
      tablet: {
        width: 480,
        height: height || 220,
        marginLeft: 50,
        marginRight: 20,
        marginTop: padding || 20,
        marginBottom: 40,
        plotWidth: 0,
        plotHeight: 0
      },
      desktop: {
        width: 600,
        height: height || 280,
        marginLeft: 60,
        marginRight: 24,
        marginTop: padding || 24,
        marginBottom: 48,
        plotWidth: 0,
        plotHeight: 0
      }
    },
    currentBreakpoint,
    {
      width: 600,
      height: height || 280,
      marginLeft: 60,
      marginRight: 24,
      marginTop: padding || 24,
      marginBottom: 48,
      plotWidth: 0,
      plotHeight: 0
    }
  );

  const chartDimensions = {
    ...baseDimensions,
    width: measuredWidth ? Math.max(320, measuredWidth) : baseDimensions.width
  } as ChartDimensions;

  // Calculate plot dimensions
  const dimensions: ChartDimensions = {
    ...chartDimensions,
    plotWidth: chartDimensions.width - chartDimensions.marginLeft - chartDimensions.marginRight,
    plotHeight: chartDimensions.height - chartDimensions.marginTop - chartDimensions.marginBottom
  };

  // Responsive font sizes with override support
  const responsiveFontSize = fontSize || getResponsiveValue(
    {
      mobile: { axis: '10px', tooltip: '12px', legend: '12px', title: 'text-sm' },
      tablet: { axis: '11px', tooltip: '13px', legend: '13px', title: 'text-base' },
      desktop: { axis: '12px', tooltip: '14px', legend: '14px', title: 'text-lg' }
    },
    currentBreakpoint,
    { axis: '12px', tooltip: '14px', legend: '14px', title: 'text-lg' }
  );

  // Touch target size with override support
  const responsiveTouchTargetSize = touchTargetSize || (touchDevice ? 8 : 4);

  // Filter and validate data
  const validData = data.filter(d => 
    d.value !== null && 
    d.value !== undefined && 
    typeof d.value === 'number' && 
    !isNaN(d.value)
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

  // Calculate value ranges
  const primaryValues = validData.map(d => d.value);
  const secondaryValues = validData
    .map(d => d.secondaryValue)
    .filter(v => v !== null && v !== undefined && typeof v === 'number' && !isNaN(v)) as number[];

  const allValues = showSecondaryLine && secondaryValues.length > 0 
    ? [...primaryValues, ...secondaryValues] 
    : primaryValues;

  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const valuePadding = range * 0.1;
  const chartMin = Math.max(0, minValue - valuePadding);
  const chartMax = maxValue + valuePadding;
  const chartRange = chartMax - chartMin;

  // Helper functions
  const getX = (index: number) => 
    dimensions.marginLeft + (index / Math.max(1, validData.length - 1)) * dimensions.plotWidth;
  
  const getY = (value: number) => 
    dimensions.marginTop + ((chartMax - value) / chartRange) * dimensions.plotHeight;

  const defaultFormatValue = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return 'N/A';
    return value.toFixed(1);
  };

  const defaultFormatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: '2-digit' 
      });
    } catch {
      return dateString;
    }
  };

  const valueFormatter = formatValue || defaultFormatValue;
  const dateFormatter = formatDate || defaultFormatDate;

  // Generate SVG paths
  const primaryPath = validData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value)}`)
    .join(' ');

  const secondaryPath = showSecondaryLine && secondaryValues.length > 0
    ? validData
        .filter(d => d.secondaryValue !== null && d.secondaryValue !== undefined)
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(validData.indexOf(d))} ${getY(d.secondaryValue!)}`)
        .join(' ')
    : '';

  // Handle touch/click events with improved touch handling
  const handlePointInteraction = (index: number, event: React.MouseEvent | React.TouchEvent) => {
    event.preventDefault();
    event.stopPropagation();
    
    if (touchDevice) {
      // On touch devices, toggle the touched point
      setTouchedPoint(touchedPoint === index ? null : index);
      setHoveredPoint(null);
      
      // Provide haptic feedback if available
      if ('vibrate' in navigator) {
        navigator.vibrate(50);
      }
    } else {
      setHoveredPoint(index);
      setTouchedPoint(null);
    }

    if (onDataPointClick) {
      onDataPointClick(validData[index], index);
    }
  };

  // Handle touch start for better touch responsiveness
  const handleTouchStart = (index: number, event: React.TouchEvent) => {
    event.preventDefault();
    if (touchDevice) {
      setTouchedPoint(index);
    }
  };

  // Handle touch end
  const handleTouchEnd = (index: number, event: React.TouchEvent) => {
    event.preventDefault();
    // Keep the point selected for tooltip display
  };

  const handleMouseEnter = (index: number) => {
    if (!touchDevice) {
      setHoveredPoint(index);
    }
  };

  const handleMouseLeave = () => {
    if (!touchDevice) {
      setHoveredPoint(null);
    }
  };

  const activePoint = touchDevice ? touchedPoint : hoveredPoint;

  return (
    <Card 
      className={combineResponsiveClasses('p-4', className)}
      role="img"
      aria-label={`${indonesianAriaLabels.charts.chart}: ${title}. ${indonesianAriaLabels.charts.interactive}`}
    >
      <h4 
        className={`font-medium text-gray-900 mb-4 ${responsiveFontSize.title}`}
        id={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
      >
        {title}
      </h4>
      
      <div className="relative" ref={containerRef}>
        {/* Chart container with horizontal scroll on mobile if needed */}
        <div className={currentBreakpoint === 'mobile' ? 'overflow-x-auto scrollbar-thin scrollbar-thumb-gray-300' : ''}>
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            className="border rounded select-none"
            role="img"
            aria-labelledby={`chart-title-${title.replace(/\s+/g, '-').toLowerCase()}`}
            aria-describedby={`chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}
            style={{ 
              minWidth: currentBreakpoint === 'mobile' ? '320px' : 'auto',
              touchAction: 'pan-x pinch-zoom',
              WebkitTouchCallout: 'none',
              WebkitUserSelect: 'none',
              userSelect: 'none'
            }}
          >
            {/* Screen reader description */}
            <desc id={`chart-desc-${title.replace(/\s+/g, '-').toLowerCase()}`}>
              {`Grafik garis menampilkan ${metric} dengan ${validData.length} titik data. 
               Nilai tertinggi: ${valueFormatter(Math.max(...primaryValues))}, 
               Nilai terendah: ${valueFormatter(Math.min(...primaryValues))}.
               ${touchDevice ? 'Ketuk titik data untuk melihat detail.' : 'Arahkan kursor ke titik data untuk melihat detail.'}`}
            </desc>
            {/* Grid lines */}
            {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
              const y = dimensions.marginTop + ratio * dimensions.plotHeight;
              const value = chartMax - ratio * chartRange;
              return (
                <g key={ratio}>
                  <line
                    x1={dimensions.marginLeft}
                    y1={y}
                    x2={dimensions.marginLeft + dimensions.plotWidth}
                    y2={y}
                    stroke="#e5e7eb"
                    strokeWidth={1}
                  />
                  <text
                    x={dimensions.marginLeft - 5}
                    y={y + 4}
                    textAnchor="end"
                    fontSize={responsiveFontSize.axis}
                    fill="#6b7280"
                  >
                    {valueFormatter(value)}
                  </text>
                </g>
              );
            })}

            {/* Primary line */}
            <path
              d={primaryPath}
              fill="none"
              stroke={primaryColor}
              strokeWidth={currentBreakpoint === 'mobile' ? 2 : 2.5}
            />

            {/* Secondary line */}
            {secondaryPath && (
              <path
                d={secondaryPath}
                fill="none"
                stroke={secondaryColor}
                strokeWidth={currentBreakpoint === 'mobile' ? 2 : 2.5}
              />
            )}

            {/* Data points */}
            {validData.map((d, i) => (
              <g key={i}>
                {/* Primary point */}
                <circle
                  cx={getX(i)}
                  cy={getY(d.value)}
                  r={activePoint === i ? responsiveTouchTargetSize + 2 : responsiveTouchTargetSize}
                  fill={primaryColor}
                  stroke="white"
                  strokeWidth={2}
                  className={touchDevice ? 'cursor-pointer touch-manipulation' : 'cursor-pointer hover:opacity-80 transition-opacity'}
                  onMouseEnter={() => handleMouseEnter(i)}
                  onMouseLeave={handleMouseLeave}
                  onClick={(e) => handlePointInteraction(i, e)}
                  onTouchStart={(e) => handleTouchStart(i, e)}
                  onTouchEnd={(e) => handleTouchEnd(i, e)}
                  style={{ 
                    touchAction: 'manipulation',
                    WebkitTapHighlightColor: 'transparent'
                  }}
                />

                {/* Secondary point */}
                {d.secondaryValue !== null && d.secondaryValue !== undefined && (
                  <circle
                    cx={getX(i)}
                    cy={getY(d.secondaryValue)}
                    r={activePoint === i ? responsiveTouchTargetSize + 2 : responsiveTouchTargetSize}
                    fill={secondaryColor}
                    stroke="white"
                    strokeWidth={2}
                    className={touchDevice ? 'cursor-pointer touch-manipulation' : 'cursor-pointer hover:opacity-80 transition-opacity'}
                    onMouseEnter={() => handleMouseEnter(i)}
                    onMouseLeave={handleMouseLeave}
                    onClick={(e) => handlePointInteraction(i, e)}
                    onTouchStart={(e) => handleTouchStart(i, e)}
                    onTouchEnd={(e) => handleTouchEnd(i, e)}
                    style={{ 
                      touchAction: 'manipulation',
                      WebkitTapHighlightColor: 'transparent'
                    }}
                  />
                )}

                {/* Date labels - show fewer on mobile */}
                {(currentBreakpoint !== 'mobile' || i % Math.ceil(validData.length / 4) === 0) && (
                  <text
                    x={getX(i)}
                    y={dimensions.height - 10}
                    textAnchor="middle"
                    fontSize={responsiveFontSize.axis}
                    fill="#6b7280"
                  >
                    {dateFormatter(d.date)}
                  </text>
                )}
              </g>
            ))}
          </svg>
        </div>

        {/* Tooltip */}
        {showTooltip && activePoint !== null && (
          <div
            className="absolute z-10 bg-white border border-gray-200 rounded-lg shadow-lg p-3 pointer-events-none"
            style={{
              left: Math.min(
                getX(activePoint) + (containerRef.current?.offsetLeft || 0),
                (containerRef.current?.offsetWidth || 0) - 150
              ),
              top: Math.max(
                getY(validData[activePoint].value) - 60,
                10
              ),
              fontSize: responsiveFontSize.tooltip
            }}
          >
            <div className="font-medium text-gray-900">
              {dateFormatter(validData[activePoint].date)}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: primaryColor }}
                />
                {valueFormatter(validData[activePoint].value)}
              </div>
              {validData[activePoint].secondaryValue !== null && 
               validData[activePoint].secondaryValue !== undefined && (
                <div className="flex items-center gap-2 mt-1">
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: secondaryColor }}
                  />
                  {valueFormatter(validData[activePoint].secondaryValue!)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      {showLegend && (
        <div className="mt-4 flex flex-wrap gap-4" style={{ fontSize: responsiveFontSize.legend || responsiveFontSize.tooltip }}>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: primaryColor }}
            />
            <span>{metric}</span>
          </div>
          {showSecondaryLine && secondaryValues.length > 0 && (
            <div className="flex items-center gap-2">
              <div 
                className="w-3 h-3 rounded-full" 
                style={{ backgroundColor: secondaryColor }}
              />
              <span>Sekunder</span>
            </div>
          )}
        </div>
      )}

      {/* Latest value */}
      {showLatestValue && validData.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Nilai Terakhir:</p>
          <p className="font-medium">
            {valueFormatter(validData[validData.length - 1].value)}
            {validData[validData.length - 1].secondaryValue !== null && 
             validData[validData.length - 1].secondaryValue !== undefined && (
              <span style={{ color: secondaryColor }} className="ml-2">
                / {valueFormatter(validData[validData.length - 1].secondaryValue!)}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {dateFormatter(validData[validData.length - 1].date)}
          </p>
        </div>
      )}

      {/* Touch instruction for mobile */}
      {touchDevice && currentBreakpoint === 'mobile' && (
        <div className="mt-2 text-xs text-gray-500 text-center">
          Ketuk titik data untuk melihat detail
        </div>
      )}
    </Card>
  );
}