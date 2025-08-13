'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { advancedTestsApi } from '@/lib/api/advancedTests';
import { AdvancedTest } from '@/types/examination';
import { Patient } from '@/types/patient';

interface TestHistoryProps {
  patient: Patient;
  onEditTest?: (test: AdvancedTest) => void;
  refreshTrigger?: number;
}

interface TrendData {
  tests: AdvancedTest[];
  trend: 'increasing' | 'decreasing' | 'stable';
  average: number;
  latest: number | null;
}

interface DateFilters {
  startDate: string;
  endDate: string;
}

export default function TestHistory({ 
  patient, 
  onEditTest,
  refreshTrigger = 0 
}: TestHistoryProps) {
  const [tests, setTests] = useState<AdvancedTest[]>([]);
  const [trendData, setTrendData] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<DateFilters>({
    startDate: '',
    endDate: ''
  });

  // Set default date range (last 3 months)
  useEffect(() => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3);
    
    setFilters({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  }, []);

  const fetchTestHistory = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch filtered tests
      const filteredTests = await advancedTestsApi.getPatientAdvancedTestsFiltered(
        patient.id,
        filters.startDate || undefined,
        filters.endDate || undefined
      );

      // Fetch trend data (last 30 days)
      const trend = await advancedTestsApi.getGlucoseTrend(patient.id, 30);

      setTests(filteredTests);
      setTrendData(trend);
    } catch (err: any) {
      console.error('Error fetching test history:', err);
      setError('Gagal memuat riwayat tes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (filters.startDate && filters.endDate) {
      fetchTestHistory();
    }
  }, [patient.id, filters, refreshTrigger]);

  const handleFilterChange = (field: keyof DateFilters, value: string) => {
    setFilters(prev => ({ ...prev, [field]: value }));
  };

  const clearFilters = () => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setMonth(endDate.getMonth() - 3);
    
    setFilters({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });
  };

  const getGlucoseStatus = (glucose: number): {
    status: string;
    color: string;
  } => {
    if (glucose < 70) {
      return { status: 'Rendah', color: 'text-blue-600 bg-blue-50' };
    } else if (glucose <= 140) {
      return { status: 'Normal', color: 'text-green-600 bg-green-50' };
    } else if (glucose <= 199) {
      return { status: 'Prediabetes', color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { status: 'Diabetes', color: 'text-red-600 bg-red-50' };
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'increasing':
        return (
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        );
      case 'decreasing':
        return (
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
          </svg>
        );
      default:
        return (
          <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
          </svg>
        );
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loading size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Trend Summary */}
      {trendData && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Analisis Tren (30 Hari Terakhir)
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="flex items-center justify-center mb-2">
                {getTrendIcon(trendData.trend)}
              </div>
              <p className="text-sm text-gray-600">Tren</p>
              <p className="font-semibold capitalize">
                {trendData.trend === 'increasing' ? 'Meningkat' : 
                 trendData.trend === 'decreasing' ? 'Menurun' : 'Stabil'}
              </p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {trendData.latest || '-'}
              </p>
              <p className="text-sm text-gray-600">Terakhir (mg/dL)</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {trendData.average}
              </p>
              <p className="text-sm text-gray-600">Rata-rata (mg/dL)</p>
            </div>
            
            <div className="text-center">
              <p className="text-2xl font-bold text-gray-900">
                {trendData.tests.length}
              </p>
              <p className="text-sm text-gray-600">Total Tes</p>
            </div>
          </div>

          {/* Simple Chart Visualization */}
          {trendData.tests.length > 1 && (
            <div className="mt-6">
              <h4 className="text-sm font-medium text-gray-900 mb-3">Grafik Tren Gula Darah</h4>
              <div className="relative h-32 bg-gray-50 rounded-lg p-4">
                <div className="flex items-end justify-between h-full">
                  {trendData.tests.slice(0, 10).reverse().map((test, index) => {
                    const glucose = test.gula_darah || 0;
                    const maxGlucose = Math.max(...trendData.tests.map(t => t.gula_darah || 0));
                    const height = Math.max((glucose / maxGlucose) * 100, 10);
                    const status = getGlucoseStatus(glucose);
                    
                    return (
                      <div key={test.id} className="flex flex-col items-center">
                        <div
                          className={`w-6 rounded-t ${status.color.split(' ')[1]} transition-all duration-300`}
                          style={{ height: `${height}%` }}
                          title={`${glucose} mg/dL - ${formatDate(test.tanggal_tes)}`}
                        />
                        <span className="text-xs text-gray-500 mt-1 transform -rotate-45 origin-left">
                          {new Date(test.tanggal_tes).getDate()}/{new Date(test.tanggal_tes).getMonth() + 1}
                        </span>
                      </div>
                    );
                  })}
                </div>
                
                {/* Reference lines */}
                <div className="absolute inset-x-4 top-1/4 border-t border-red-200 border-dashed">
                  <span className="text-xs text-red-500 bg-white px-1">200 mg/dL</span>
                </div>
                <div className="absolute inset-x-4 top-1/2 border-t border-yellow-200 border-dashed">
                  <span className="text-xs text-yellow-600 bg-white px-1">140 mg/dL</span>
                </div>
              </div>
            </div>
          )}
        </Card>
      )}

      {/* Filters */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Filter Riwayat Tes
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Input
            label="Tanggal Mulai"
            type="date"
            value={filters.startDate}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />
          
          <Input
            label="Tanggal Akhir"
            type="date"
            value={filters.endDate}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />
          
          <div className="flex items-end">
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Test History List */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Riwayat Tes Lanjutan
          </h3>
          <span className="text-sm text-gray-500">
            {tests.length} tes ditemukan
          </span>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {tests.length === 0 ? (
          <div className="text-center py-8">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada riwayat tes</h3>
            <p className="mt-1 text-sm text-gray-500">
              Belum ada tes lanjutan yang tercatat untuk periode ini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {tests.map((test) => {
              const glucoseStatus = test.gula_darah ? getGlucoseStatus(test.gula_darah) : null;
              
              return (
                <div
                  key={test.id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-4">
                        <div>
                          <p className="text-sm text-gray-600">
                            {formatDate(test.tanggal_tes)}
                          </p>
                          <div className="flex items-center space-x-2 mt-1">
                            <span className="text-lg font-semibold text-gray-900">
                              {test.gula_darah || '-'} mg/dL
                            </span>
                            {glucoseStatus && (
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${glucoseStatus.color}`}>
                                {glucoseStatus.status}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      {test.catatan && (
                        <p className="text-sm text-gray-600 mt-2">
                          <span className="font-medium">Catatan:</span> {test.catatan}
                        </p>
                      )}
                    </div>
                    
                    {onEditTest && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onEditTest(test)}
                      >
                        Edit
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </Card>
    </div>
  );
}