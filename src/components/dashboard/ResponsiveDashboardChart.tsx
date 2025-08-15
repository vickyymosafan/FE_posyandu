'use client';

import React from 'react';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { getResponsiveValue } from '@/lib/utils/responsive';
import ResponsiveChart, { ChartDataPoint } from '@/components/ui/ResponsiveChart';

export interface DashboardChartData {
  date: string;
  value: number;
  label?: string;
}

export interface ResponsiveDashboardChartProps {
  data: DashboardChartData[];
  title: string;
  metric: string;
  color?: string;
  className?: string;
  showTrend?: boolean;
  trendPeriod?: number; // days to compare for trend
  // New responsive props
  height?: number;
  fontSize?: { title: string; axis: string; tooltip: string; legend?: string };
  touchTargetSize?: number;
  padding?: number;
}

export default function ResponsiveDashboardChart({
  data,
  title,
  metric,
  color = '#3b82f6',
  className = '',
  showTrend = true,
  trendPeriod = 7,
  // New responsive props
  height,
  fontSize,
  touchTargetSize,
  padding
}: ResponsiveDashboardChartProps) {
  const { currentBreakpoint } = useBreakpoint();

  // Convert dashboard data to chart format
  const chartData: ChartDataPoint[] = data.map(item => ({
    date: item.date,
    value: item.value,
    label: item.label,
    metadata: item
  }));

  // Calculate trend if requested
  const trend = showTrend && chartData.length >= 2 ? (() => {
    const recent = chartData.slice(-trendPeriod);
    const older = chartData.slice(-trendPeriod * 2, -trendPeriod);
    
    if (recent.length === 0 || older.length === 0) return null;
    
    const recentAvg = recent.reduce((sum, d) => sum + d.value, 0) / recent.length;
    const olderAvg = older.reduce((sum, d) => sum + d.value, 0) / older.length;
    
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    return {
      value: Math.abs(change),
      isPositive: change > 0,
      label: `${trendPeriod} hari terakhir`
    };
  })() : null;

  // Responsive chart height with override support
  const chartHeight = height || getResponsiveValue(
    {
      mobile: 120,
      tablet: 140,
      desktop: 160
    },
    currentBreakpoint,
    160
  );

  // Format functions
  const formatValue = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) return '0';
    
    // Format large numbers with K/M suffix
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    } else if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    
    return value.toString();
  };

  const formatDate = (dateString: string) => {
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

  return (
    <div className={className}>
      <ResponsiveChart
        data={chartData}
        title={title}
        metric={metric}
        primaryColor={color}
        formatValue={formatValue}
        formatDate={formatDate}
        showTooltip={true}
        showLegend={false}
        showLatestValue={false}
        className="h-auto"
        height={chartHeight}
        fontSize={fontSize}
        touchTargetSize={touchTargetSize}
        padding={padding}
      />
      
      {/* Trend indicator */}
      {trend && (
        <div className="mt-2 flex items-center justify-center">
          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
            trend.isPositive 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            <svg
              className={`mr-1 h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`}
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            {trend.value.toFixed(1)}%
          </div>
          <span className="ml-2 text-xs text-gray-500">
            {trend.label}
          </span>
        </div>
      )}
    </div>
  );
}