'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { PhysicalExamination } from '@/types/examination';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ExaminationChartProps {
  examinations: PhysicalExamination[];
  metric: 'berat_badan' | 'tinggi_badan' | 'tekanan_darah' | 'bmi';
  title: string;
}

export default function ExaminationChart({ 
  examinations, 
  metric, 
  title 
}: ExaminationChartProps) {
  // Sort examinations by date (oldest first for chart)
  const sortedExaminations = [...examinations]
    .filter(exam => {
      if (metric === 'berat_badan') return exam.berat_badan;
      if (metric === 'tinggi_badan') return exam.tinggi_badan;
      if (metric === 'tekanan_darah') return exam.tekanan_darah_sistolik && exam.tekanan_darah_diastolik;
      if (metric === 'bmi') return exam.berat_badan && exam.tinggi_badan;
      return false;
    })
    .sort((a, b) => new Date(a.tanggal_pemeriksaan).getTime() - new Date(b.tanggal_pemeriksaan).getTime());

  if (sortedExaminations.length === 0) {
    return (
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
        <div className="text-center py-8 text-gray-500">
          Tidak ada data untuk ditampilkan
        </div>
      </Card>
    );
  }

  // Calculate values for chart
  const chartData = sortedExaminations.map(exam => {
    let value: number | null = null;
    let secondaryValue: number | null = null;

    if (metric === 'berat_badan') {
      value = exam.berat_badan || null;
    } else if (metric === 'tinggi_badan') {
      value = exam.tinggi_badan || null;
    } else if (metric === 'tekanan_darah') {
      value = exam.tekanan_darah_sistolik || null;
      secondaryValue = exam.tekanan_darah_diastolik || null;
    } else if (metric === 'bmi' && exam.berat_badan && exam.tinggi_badan) {
      const tinggiMeter = exam.tinggi_badan / 100;
      value = exam.berat_badan / (tinggiMeter * tinggiMeter);
    }

    return {
      date: exam.tanggal_pemeriksaan,
      value,
      secondaryValue,
      exam
    };
  }).filter(item => item.value !== null);

  if (chartData.length === 0) {
    return (
      <Card className="p-4">
        <h4 className="font-medium text-gray-900 mb-2">{title}</h4>
        <div className="text-center py-8 text-gray-500">
          Tidak ada data untuk ditampilkan
        </div>
      </Card>
    );
  }

  // Find min and max values for scaling
  const values = chartData.map(d => d.value!);
  const secondaryValues = chartData.map(d => d.secondaryValue).filter(v => v !== null) as number[];
  
  const allValues = metric === 'tekanan_darah' ? [...values, ...secondaryValues] : values;
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const range = maxValue - minValue;
  const padding = range * 0.1; // 10% padding
  const chartMin = Math.max(0, minValue - padding);
  const chartMax = maxValue + padding;
  const chartRange = chartMax - chartMin;

  // Chart dimensions
  const chartWidth = 400;
  const chartHeight = 200;
  const marginLeft = 50;
  const marginRight = 20;
  const marginTop = 20;
  const marginBottom = 40;
  const plotWidth = chartWidth - marginLeft - marginRight;
  const plotHeight = chartHeight - marginTop - marginBottom;

  // Helper functions
  const getX = (index: number) => marginLeft + (index / (chartData.length - 1)) * plotWidth;
  const getY = (value: number) => marginTop + ((chartMax - value) / chartRange) * plotHeight;

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM', { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatValue = (value: number) => {
    if (metric === 'berat_badan') return `${value.toFixed(1)} kg`;
    if (metric === 'tinggi_badan') return `${value.toFixed(1)} cm`;
    if (metric === 'tekanan_darah') return `${value.toFixed(0)} mmHg`;
    if (metric === 'bmi') return `${value.toFixed(1)} kg/m²`;
    return value.toString();
  };

  // Generate path for line chart
  const primaryPath = chartData
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.value!)}`)
    .join(' ');

  const secondaryPath = metric === 'tekanan_darah' && secondaryValues.length > 0
    ? chartData
        .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d.secondaryValue!)}`)
        .join(' ')
    : '';

  return (
    <Card className="p-4">
      <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
      
      <div className="overflow-x-auto">
        <svg width={chartWidth} height={chartHeight} className="border rounded">
          {/* Grid lines */}
          {[0, 0.25, 0.5, 0.75, 1].map(ratio => {
            const y = marginTop + ratio * plotHeight;
            const value = chartMax - ratio * chartRange;
            return (
              <g key={ratio}>
                <line
                  x1={marginLeft}
                  y1={y}
                  x2={marginLeft + plotWidth}
                  y2={y}
                  stroke="#e5e7eb"
                  strokeWidth={1}
                />
                <text
                  x={marginLeft - 5}
                  y={y + 4}
                  textAnchor="end"
                  fontSize="12"
                  fill="#6b7280"
                >
                  {formatValue(value)}
                </text>
              </g>
            );
          })}

          {/* Primary line */}
          <path
            d={primaryPath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth={2}
          />

          {/* Secondary line (for blood pressure) */}
          {secondaryPath && (
            <path
              d={secondaryPath}
              fill="none"
              stroke="#ef4444"
              strokeWidth={2}
            />
          )}

          {/* Data points */}
          {chartData.map((d, i) => (
            <g key={i}>
              <circle
                cx={getX(i)}
                cy={getY(d.value!)}
                r={4}
                fill="#3b82f6"
                stroke="white"
                strokeWidth={2}
              />
              {d.secondaryValue && (
                <circle
                  cx={getX(i)}
                  cy={getY(d.secondaryValue)}
                  r={4}
                  fill="#ef4444"
                  stroke="white"
                  strokeWidth={2}
                />
              )}
              
              {/* Date labels */}
              <text
                x={getX(i)}
                y={chartHeight - 10}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {formatDate(d.date)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-4 flex flex-wrap gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
          <span>
            {metric === 'tekanan_darah' ? 'Sistolik' : title}
          </span>
        </div>
        {metric === 'tekanan_darah' && (
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span>Diastolik</span>
          </div>
        )}
      </div>

      {/* Latest value */}
      {chartData.length > 0 && (
        <div className="mt-4 p-3 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">Nilai Terakhir:</p>
          <p className="font-medium">
            {formatValue(chartData[chartData.length - 1].value!)}
            {chartData[chartData.length - 1].secondaryValue && (
              <span className="text-red-600 ml-2">
                / {formatValue(chartData[chartData.length - 1].secondaryValue!)}
              </span>
            )}
          </p>
          <p className="text-xs text-gray-500">
            {formatDate(chartData[chartData.length - 1].date)}
          </p>
        </div>
      )}
    </Card>
  );
}