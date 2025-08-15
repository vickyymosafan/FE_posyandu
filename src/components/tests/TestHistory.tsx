'use client';

import React, { useState, useEffect, useMemo } from 'react';
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

// Removed trend analysis to focus on clear, simple information for Posyandu

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

      setTests(filteredTests);
      
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

  // Simple status summary counts for clarity
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = { Rendah: 0, Normal: 0, Prediabetes: 0, Diabetes: 0 };
    for (const t of tests) {
      const raw = (t as any).gula_darah;
      const glucose = raw === null || raw === undefined ? NaN : Number(raw);
      if (Number.isFinite(glucose)) {
        const { status } = getGlucoseStatus(glucose);
        counts[status] = (counts[status] ?? 0) + 1;
      }
    }
    return counts;
  }, [tests]);

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
          <span className="text-sm text-gray-600">
            {tests.length} tes ditemukan
          </span>
        </div>

        {tests.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
            <div className="flex items-center justify-between px-3 py-2 rounded bg-blue-50 text-blue-800 text-xs">
              <span>Rendah</span>
              <span className="font-semibold">{statusCounts['Rendah']}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded bg-green-50 text-green-800 text-xs">
              <span>Normal</span>
              <span className="font-semibold">{statusCounts['Normal']}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded bg-yellow-50 text-yellow-800 text-xs">
              <span>Prediabetes</span>
              <span className="font-semibold">{statusCounts['Prediabetes']}</span>
            </div>
            <div className="flex items-center justify-between px-3 py-2 rounded bg-red-50 text-red-800 text-xs">
              <span>Diabetes</span>
              <span className="font-semibold">{statusCounts['Diabetes']}</span>
            </div>
          </div>
        )}

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
              const glucoseValue = Number((test as any).gula_darah);
              const glucoseStatus = Number.isFinite(glucoseValue) ? getGlucoseStatus(glucoseValue) : null;
              
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
                            <span className="text-2xl font-bold text-gray-900">
                              {Number.isFinite(glucoseValue) ? glucoseValue : '-'} mg/dL
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