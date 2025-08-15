'use client';

import React from 'react';
import { PhysicalExamination } from '@/types/examination';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import ResponsiveChart, { ChartDataPoint } from '@/components/ui/ResponsiveChart';

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
      // Convert string values to numbers for comparison
      const beratBadan = parseFloat(exam.berat_badan as any) || 0;
      const tinggiBadan = parseFloat(exam.tinggi_badan as any) || 0;
      const tekananSistolik = parseFloat(exam.tekanan_darah_sistolik as any) || 0;
      const tekananDiastolik = parseFloat(exam.tekanan_darah_diastolik as any) || 0;
      
      if (metric === 'berat_badan') return beratBadan > 0;
      if (metric === 'tinggi_badan') return tinggiBadan > 0;
      if (metric === 'tekanan_darah') return tekananSistolik > 0 && tekananDiastolik > 0;
      if (metric === 'bmi') return beratBadan > 0 && tinggiBadan > 0;
      return false;
    })
    .sort((a, b) => new Date(a.tanggal_pemeriksaan).getTime() - new Date(b.tanggal_pemeriksaan).getTime());

  // Convert examinations to chart data format
  const chartData: ChartDataPoint[] = sortedExaminations.map(exam => {
    let value: number | null = null;
    let secondaryValue: number | null = null;

    // Convert string values to numbers
    const beratBadan = parseFloat(exam.berat_badan as any) || 0;
    const tinggiBadan = parseFloat(exam.tinggi_badan as any) || 0;
    const tekananSistolik = parseFloat(exam.tekanan_darah_sistolik as any) || 0;
    const tekananDiastolik = parseFloat(exam.tekanan_darah_diastolik as any) || 0;

    if (metric === 'berat_badan') {
      value = beratBadan > 0 ? beratBadan : null;
    } else if (metric === 'tinggi_badan') {
      value = tinggiBadan > 0 ? tinggiBadan : null;
    } else if (metric === 'tekanan_darah') {
      value = tekananSistolik > 0 ? tekananSistolik : null;
      secondaryValue = tekananDiastolik > 0 ? tekananDiastolik : null;
    } else if (metric === 'bmi' && beratBadan > 0 && tinggiBadan > 0) {
      const tinggiMeter = tinggiBadan / 100;
      value = beratBadan / (tinggiMeter * tinggiMeter);
    }

    return {
      date: exam.tanggal_pemeriksaan,
      value: value!,
      secondaryValue: secondaryValue || undefined,
      metadata: exam
    };
  }).filter(item => item.value !== null && typeof item.value === 'number' && !isNaN(item.value));

  // Format functions
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM', { locale: id });
    } catch {
      return dateString;
    }
  };

  const formatValue = (value: number) => {
    if (typeof value !== 'number' || isNaN(value)) {
      return 'N/A';
    }
    
    if (metric === 'berat_badan') return `${value.toFixed(1)} kg`;
    if (metric === 'tinggi_badan') return `${value.toFixed(1)} cm`;
    if (metric === 'tekanan_darah') return `${value.toFixed(0)} mmHg`;
    if (metric === 'bmi') return `${value.toFixed(1)} kg/m²`;
    return value.toString();
  };

  // Get metric display name for legend
  const getMetricName = () => {
    switch (metric) {
      case 'berat_badan': return 'Berat Badan';
      case 'tinggi_badan': return 'Tinggi Badan';
      case 'tekanan_darah': return 'Sistolik';
      case 'bmi': return 'BMI';
      default: return title;
    }
  };

  return (
    <ResponsiveChart
      data={chartData}
      title={title}
      metric={getMetricName()}
      primaryColor="#3b82f6"
      secondaryColor="#ef4444"
      showSecondaryLine={metric === 'tekanan_darah'}
      formatValue={formatValue}
      formatDate={formatDate}
      showTooltip={true}
      showLegend={true}
      showLatestValue={true}
      onDataPointClick={(dataPoint, index) => {
        // Optional: Handle data point clicks for detailed view
        console.log('Chart data point clicked:', dataPoint, index);
      }}
    />
  );
}