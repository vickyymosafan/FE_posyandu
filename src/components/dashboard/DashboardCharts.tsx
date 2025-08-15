'use client';

import React, { useMemo, useCallback } from 'react';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { getResponsiveValue } from '@/lib/utils/responsive';
import { LazyResponsiveChart, LazyResponsiveBarChart, LazyResponsiveDashboardChart, ProgressiveChart } from '@/components/ui/LazyChart';
import { usePerformanceMonitoring } from '@/lib/utils/performance';

interface DashboardChartsProps {
  statisticsData?: {
    dailyExaminations: Array<{ date: string; value: number }>;
    monthlyPatients: Array<{ date: string; value: number }>;
    categoryDistribution: Array<{ label: string; value: number; color?: string }>;
    trendData: Array<{ date: string; value: number }>;
  };
  loading?: boolean;
}

export default function DashboardCharts({
  statisticsData,
  loading = false
}: DashboardChartsProps) {
  const { currentBreakpoint, touchDevice } = useBreakpoint();
  const { startMeasurement, endMeasurement } = usePerformanceMonitoring('DashboardCharts', currentBreakpoint);

  // Performance monitoring
  React.useEffect(() => {
    startMeasurement();
    return () => {
      endMeasurement('render');
    };
  }, [startMeasurement, endMeasurement]);

  // Responsive grid configuration with improved sizing
  const gridCols = getResponsiveValue(
    {
      mobile: 'grid-cols-1',
      tablet: 'grid-cols-2',
      desktop: 'grid-cols-2'
    },
    currentBreakpoint,
    'grid-cols-2'
  );

  const spacing = getResponsiveValue(
    {
      mobile: 'gap-3',
      tablet: 'gap-4',
      desktop: 'gap-6'
    },
    currentBreakpoint,
    'gap-6'
  );

  // Responsive chart dimensions
  const chartConfig = getResponsiveValue(
    {
      mobile: {
        height: 200,
        fontSize: { title: 'text-sm', axis: '10px', tooltip: '12px', legend: '12px' },
        padding: 12,
        touchTarget: 8,
        showLabels: 'minimal'
      },
      tablet: {
        height: 240,
        fontSize: { title: 'text-base', axis: '11px', tooltip: '13px', legend: '13px' },
        padding: 16,
        touchTarget: 6,
        showLabels: 'standard'
      },
      desktop: {
        height: 280,
        fontSize: { title: 'text-lg', axis: '12px', tooltip: '14px', legend: '14px' },
        padding: 20,
        touchTarget: 4,
        showLabels: 'full'
      }
    },
    currentBreakpoint,
    {
      height: 280,
      fontSize: { title: 'text-lg', axis: '12px', tooltip: '14px', legend: '14px' },
      padding: 20,
      touchTarget: 4,
      showLabels: 'full'
    }
  );

  // Sample data for demonstration
  const sampleData = {
    dailyExaminations: [
      { date: '2024-01-01', value: 12 },
      { date: '2024-01-02', value: 15 },
      { date: '2024-01-03', value: 8 },
      { date: '2024-01-04', value: 22 },
      { date: '2024-01-05', value: 18 },
      { date: '2024-01-06', value: 25 },
      { date: '2024-01-07', value: 20 }
    ],
    monthlyPatients: [
      { date: '2023-07', value: 145 },
      { date: '2023-08', value: 162 },
      { date: '2023-09', value: 138 },
      { date: '2023-10', value: 175 },
      { date: '2023-11', value: 189 },
      { date: '2023-12', value: 201 },
      { date: '2024-01', value: 223 }
    ],
    categoryDistribution: [
      { label: 'Sehat', value: 45, color: '#10b981' },
      { label: 'Perlu Perhatian', value: 23, color: '#f59e0b' },
      { label: 'Berisiko', value: 12, color: '#ef4444' },
      { label: 'Belum Dinilai', value: 8, color: '#6b7280' }
    ],
    trendData: [
      { date: '2024-01-01', value: 85 },
      { date: '2024-01-02', value: 92 },
      { date: '2024-01-03', value: 78 },
      { date: '2024-01-04', value: 95 },
      { date: '2024-01-05', value: 88 },
      { date: '2024-01-06', value: 102 },
      { date: '2024-01-07', value: 96 }
    ]
  };

  const data = statisticsData || sampleData;

  // Memoize expensive calculations for better performance
  const memoizedData = useMemo(() => ({
    dailyExaminations: data.dailyExaminations.map(item => ({
      date: item.date,
      value: item.value
    })),
    monthlyPatients: data.monthlyPatients,
    categoryDistribution: data.categoryDistribution,
    trendData: data.trendData.map(item => ({
      date: item.date,
      value: item.value
    }))
  }), [data]);

  // Memoize format functions for better performance
  const memoizedFormatValue = useCallback((value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }, []);

  const memoizedFormatDate = useCallback((dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        day: '2-digit',
        month: '2-digit'
      });
    } catch {
      return dateString;
    }
  }, []);



  if (loading) {
    return (
      <div className={`grid ${gridCols} ${spacing}`}>
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-100 animate-pulse" style={{ padding: chartConfig.padding }}>
            <div className={`h-3 bg-gray-200 rounded w-3/4 mb-3 ${chartConfig.fontSize.title}`}></div>
            <div className="bg-gray-200 rounded" style={{ height: chartConfig.height - 60 }}></div>
            <div className="mt-2 flex gap-2">
              <div className="h-2 bg-gray-200 rounded w-1/4"></div>
              <div className="h-2 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Chart Title */}
      <div className="text-center">
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Analisis Data Posyandu
        </h3>
        <p className="text-gray-600">
          Grafik dan statistik kesehatan pasien lansia
        </p>
      </div>

      {/* Charts Grid */}
      <div className={`grid ${gridCols} ${spacing}`}>
        {/* Daily Examinations Line Chart */}
        <ProgressiveChart rootMargin="100px" threshold={0.1}>
          <LazyResponsiveChart
            data={memoizedData.dailyExaminations}
            title="Pemeriksaan Harian"
            metric="Jumlah Pemeriksaan"
            primaryColor="#3b82f6"
            formatValue={memoizedFormatValue}
            formatDate={memoizedFormatDate}
            showTooltip={true}
            showLegend={chartConfig.showLabels !== 'minimal'}
            showLatestValue={true}
            height={chartConfig.height}
            fontSize={chartConfig.fontSize}
            touchTargetSize={chartConfig.touchTarget}
            padding={chartConfig.padding}
          />
        </ProgressiveChart>

        {/* Monthly Patients Growth */}
        <ProgressiveChart rootMargin="100px" threshold={0.1}>
          <LazyResponsiveDashboardChart
            data={memoizedData.monthlyPatients}
            title="Pertumbuhan Pasien Bulanan"
            metric="Total Pasien"
            color="#10b981"
            showTrend={true}
            trendPeriod={3}
            height={chartConfig.height}
            fontSize={chartConfig.fontSize}
            touchTargetSize={chartConfig.touchTarget}
            padding={chartConfig.padding}
          />
        </ProgressiveChart>

        {/* Category Distribution Bar Chart */}
        <ProgressiveChart rootMargin="100px" threshold={0.1}>
          <LazyResponsiveBarChart
            data={memoizedData.categoryDistribution}
            title="Distribusi Kategori Kesehatan"
            orientation={currentBreakpoint === 'mobile' ? 'vertical' : 'horizontal'}
            showValues={chartConfig.showLabels !== 'minimal'}
            showPercentages={chartConfig.showLabels === 'full'}
            formatValue={memoizedFormatValue}
            height={chartConfig.height}
            fontSize={chartConfig.fontSize}
            touchTargetSize={chartConfig.touchTarget}
            padding={chartConfig.padding}
            onBarClick={(dataPoint) => {
              console.log('Category clicked:', dataPoint.label, dataPoint.value);
            }}
          />
        </ProgressiveChart>

        {/* Health Trend Chart */}
        <ProgressiveChart rootMargin="100px" threshold={0.1}>
          <LazyResponsiveChart
            data={memoizedData.trendData}
            title="Tren Kesehatan Mingguan"
            metric="Skor Kesehatan"
            primaryColor="#8b5cf6"
            formatValue={(value) => `${value}%`}
            formatDate={memoizedFormatDate}
            showTooltip={true}
            showLegend={chartConfig.showLabels !== 'minimal'}
            showLatestValue={true}
            height={chartConfig.height}
            fontSize={chartConfig.fontSize}
            touchTargetSize={chartConfig.touchTarget}
            padding={chartConfig.padding}
          />
        </ProgressiveChart>
      </div>

      {/* Chart Instructions for Mobile */}
      {currentBreakpoint === 'mobile' && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-4 w-4 text-blue-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-2">
              <h4 className="text-xs font-medium text-blue-800">
                Tips Navigasi Grafik
              </h4>
              <div className="mt-1 text-xs text-blue-700">
                <ul className="list-disc list-inside space-y-0.5">
                  <li>Ketuk titik/batang untuk melihat detail</li>
                  <li>Geser horizontal untuk grafik yang lebih lebar</li>
                  <li>Putar perangkat untuk tampilan landscape</li>
                  <li>Ketuk lagi untuk menyembunyikan detail</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Performance indicator for mobile */}
      {currentBreakpoint === 'mobile' && touchDevice && (
        <div className="mt-4 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full text-xs bg-green-100 text-green-800">
            <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Grafik dioptimalkan untuk perangkat sentuh
          </div>
        </div>
      )}
    </div>
  );
}