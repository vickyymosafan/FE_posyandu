'use client';

import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { assessmentsApi } from '@/lib/api/assessments';
import { AssessmentWithDetails, AssessmentCategory } from '@/types/assessment';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';

interface AssessmentHistoryProps {
  patientId: number;
  onSelectAssessment?: (assessment: AssessmentWithDetails) => void;
  showActions?: boolean;
}

interface FilterOptions {
  category?: AssessmentCategory | '';
  startDate?: string;
  endDate?: string;
}

const getCategoryConfig = (category: AssessmentCategory) => {
  switch (category) {
    case 'normal':
      return {
        label: 'Normal',
        color: 'bg-green-100 text-green-800 border-green-200',
        dotColor: 'bg-green-500',
        icon: '✓'
      };
    case 'perlu_perhatian':
      return {
        label: 'Perlu Perhatian',
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
        dotColor: 'bg-yellow-500',
        icon: '⚠'
      };
    case 'rujukan':
      return {
        label: 'Rujukan',
        color: 'bg-red-100 text-red-800 border-red-200',
        dotColor: 'bg-red-500',
        icon: '⚡'
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800 border-gray-200',
        dotColor: 'bg-gray-500',
        icon: '?'
      };
  }
};

export default function AssessmentHistory({ 
  patientId, 
  onSelectAssessment, 
  showActions = true 
}: AssessmentHistoryProps) {
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadAssessments();
  }, [patientId]);

  useEffect(() => {
    applyFilters();
  }, [assessments, filters]);

  const loadAssessments = async () => {
    try {
      setIsLoading(true);
      const data = await assessmentsApi.getPatientAssessments(patientId);
      setAssessments(data);
    } catch (error: any) {
      console.error('Error loading assessments:', error);
      toast.error('Gagal memuat riwayat penilaian');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(assessment => 
        assessment.kategori_penilaian === filters.category
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(assessment => 
        new Date(assessment.tanggal_penilaian) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(assessment => 
        new Date(assessment.tanggal_penilaian) <= new Date(filters.endDate!)
      );
    }

    setFilteredAssessments(filtered);
  };

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const toggleExpanded = (assessmentId: number) => {
    setExpandedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(assessmentId)) {
        newSet.delete(assessmentId);
      } else {
        newSet.add(assessmentId);
      }
      return newSet;
    });
  };

  const clearFilters = () => {
    setFilters({});
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <Loading size="lg" />
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Riwayat Penilaian Kesehatan
        </h3>

        {/* Filters */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Kategori
            </label>
            <select
              value={filters.category || ''}
              onChange={(e) => handleFilterChange('category', e.target.value)}
              className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Semua Kategori</option>
              <option value="normal">Normal</option>
              <option value="perlu_perhatian">Perlu Perhatian</option>
              <option value="rujukan">Rujukan</option>
            </select>
          </div>

          <Input
            label="Tanggal Mulai"
            type="date"
            value={filters.startDate || ''}
            onChange={(e) => handleFilterChange('startDate', e.target.value)}
          />

          <Input
            label="Tanggal Akhir"
            type="date"
            value={filters.endDate || ''}
            onChange={(e) => handleFilterChange('endDate', e.target.value)}
          />

          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full h-9"
            >
              Reset Filter
            </Button>
          </div>
        </div>

        {/* Results Summary */}
        <div className="text-sm text-gray-600">
          Menampilkan {filteredAssessments.length} dari {assessments.length} penilaian
        </div>
      </div>

      {/* Timeline */}
      {filteredAssessments.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-gray-400 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-gray-500">
            {assessments.length === 0 
              ? 'Belum ada riwayat penilaian kesehatan'
              : 'Tidak ada penilaian yang sesuai dengan filter'
            }
          </p>
        </div>
      ) : (
        <div className="relative">
          {/* Timeline Line */}
          <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200"></div>

          {/* Timeline Items */}
          <div className="space-y-6">
            {filteredAssessments.map((assessment, index) => {
              const categoryConfig = getCategoryConfig(assessment.kategori_penilaian);
              const isExpanded = expandedItems.has(assessment.id);
              const isLatest = index === 0;

              return (
                <div key={assessment.id} className="relative flex items-start">
                  {/* Timeline Dot */}
                  <div className={`relative z-10 flex items-center justify-center w-12 h-12 rounded-full border-4 border-white ${categoryConfig.dotColor} shadow-lg`}>
                    <span className="text-white text-sm font-bold">
                      {categoryConfig.icon}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="ml-4 flex-1 min-w-0">
                    <div className="bg-white border border-gray-200 rounded-lg shadow-sm">
                      {/* Header */}
                      <div className="p-4 border-b border-gray-100">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                              {categoryConfig.label}
                            </span>
                            {isLatest && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Terbaru
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatDateTime(assessment.tanggal_penilaian)}
                          </div>
                        </div>
                        
                        <div className="mt-2">
                          <p className="text-sm text-gray-600">
                            Diperiksa oleh: <span className="font-medium">{assessment.admin_nama}</span>
                          </p>
                        </div>
                      </div>

                      {/* Summary */}
                      <div className="p-4">
                        <div className="space-y-2">
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Temuan:</h4>
                            <p className="text-sm text-gray-700 line-clamp-2">
                              {assessment.temuan || 'Tidak ada temuan'}
                            </p>
                          </div>
                          
                          {!isExpanded && assessment.temuan && assessment.temuan.length > 100 && (
                            <button
                              onClick={() => toggleExpanded(assessment.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Lihat selengkapnya...
                            </button>
                          )}
                        </div>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div className="mt-4 space-y-3 border-t border-gray-100 pt-4">
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Temuan Lengkap:</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {assessment.temuan || 'Tidak ada temuan'}
                              </p>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-900">Rekomendasi:</h4>
                              <p className="text-sm text-gray-700 whitespace-pre-wrap">
                                {assessment.rekomendasi || 'Tidak ada rekomendasi'}
                              </p>
                            </div>

                            {/* Examination Data */}
                            {(assessment.pemeriksaan_fisik || assessment.tes_lanjutan) && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">Data Pemeriksaan:</h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
                                  {assessment.pemeriksaan_fisik && (
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-800">Pemeriksaan Fisik:</p>
                                      <ul className="text-gray-600 space-y-1">
                                        {assessment.pemeriksaan_fisik.tinggi_badan && (
                                          <li>Tinggi: {assessment.pemeriksaan_fisik.tinggi_badan} cm</li>
                                        )}
                                        {assessment.pemeriksaan_fisik.berat_badan && (
                                          <li>Berat: {assessment.pemeriksaan_fisik.berat_badan} kg</li>
                                        )}
                                        {assessment.pemeriksaan_fisik.tekanan_darah_sistolik && 
                                         assessment.pemeriksaan_fisik.tekanan_darah_diastolik && (
                                          <li>
                                            TD: {assessment.pemeriksaan_fisik.tekanan_darah_sistolik}/
                                            {assessment.pemeriksaan_fisik.tekanan_darah_diastolik} mmHg
                                          </li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                  {assessment.tes_lanjutan && (
                                    <div className="text-sm">
                                      <p className="font-medium text-gray-800">Tes Lanjutan:</p>
                                      <ul className="text-gray-600 space-y-1">
                                        {assessment.tes_lanjutan.gula_darah && (
                                          <li>Gula Darah: {assessment.tes_lanjutan.gula_darah} mg/dL</li>
                                        )}
                                      </ul>
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}

                            <button
                              onClick={() => toggleExpanded(assessment.id)}
                              className="text-sm text-blue-600 hover:text-blue-800"
                            >
                              Lihat lebih sedikit
                            </button>
                          </div>
                        )}

                        {/* Actions */}
                        {showActions && (
                          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-100">
                            {onSelectAssessment && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onSelectAssessment(assessment)}
                              >
                                Lihat Detail
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => toggleExpanded(assessment.id)}
                            >
                              {isExpanded ? 'Tutup' : 'Buka'}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}