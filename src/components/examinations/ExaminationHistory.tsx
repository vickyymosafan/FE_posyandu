'use client';

import React, { useState, useMemo } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Loading } from '@/components/ui/loading';
import { PhysicalExamination, AdvancedTest } from '@/types/examination';
import { Patient } from '@/types/patient';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';

interface ExaminationHistoryProps {
  patient: Patient;
  examinations: PhysicalExamination[];
  advancedTests?: AdvancedTest[];
  loading?: boolean;
  onEditExamination?: (examination: PhysicalExamination) => void;
  onDeleteExamination?: (examination: PhysicalExamination) => void;
}

interface ExaminationWithBMI extends PhysicalExamination {
  bmi?: number;
  bmiCategory?: string;
}

export default function ExaminationHistory({
  patient,
  examinations,
  advancedTests = [],
  loading = false,
  onEditExamination,
  onDeleteExamination
}: ExaminationHistoryProps) {
  const [selectedExamination, setSelectedExamination] = useState<PhysicalExamination | null>(null);

  // Calculate BMI and categorize examinations
  const examinationsWithBMI = useMemo((): ExaminationWithBMI[] => {
    if (!Array.isArray(examinations)) {
      console.warn('Examinations is not an array:', examinations);
      return [];
    }
    
    return examinations.map(exam => {
      let bmi: number | undefined;
      let bmiCategory: string | undefined;

      if (exam.tinggi_badan && exam.berat_badan) {
        const tinggiMeter = exam.tinggi_badan / 100;
        bmi = exam.berat_badan / (tinggiMeter * tinggiMeter);
        
        if (bmi < 18.5) bmiCategory = 'Kurus';
        else if (bmi < 25) bmiCategory = 'Normal';
        else if (bmi < 30) bmiCategory = 'Gemuk';
        else bmiCategory = 'Obesitas';
      }

      return {
        ...exam,
        bmi,
        bmiCategory
      };
    });
  }, [examinations]);

  // Sort examinations by date (newest first)
  const sortedExaminations = useMemo(() => {
    if (!Array.isArray(examinationsWithBMI)) {
      return [];
    }
    return [...examinationsWithBMI].sort((a, b) => 
      new Date(b.tanggal_pemeriksaan).getTime() - new Date(a.tanggal_pemeriksaan).getTime()
    );
  }, [examinationsWithBMI]);

  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMMM yyyy, HH:mm', { locale: id });
    } catch {
      return dateString;
    }
  };

  const getBloodPressureCategory = (sistolik?: number, diastolik?: number): string => {
    if (!sistolik || !diastolik) return '';
    
    if (sistolik < 120 && diastolik < 80) return 'Normal';
    if (sistolik < 130 && diastolik < 80) return 'Tinggi Normal';
    if (sistolik < 140 || diastolik < 90) return 'Hipertensi Tingkat 1';
    if (sistolik < 180 || diastolik < 110) return 'Hipertensi Tingkat 2';
    return 'Krisis Hipertensi';
  };

  const getBPCategoryColor = (category: string): string => {
    switch (category) {
      case 'Normal': return 'text-green-600 bg-green-50';
      case 'Tinggi Normal': return 'text-yellow-600 bg-yellow-50';
      case 'Hipertensi Tingkat 1': return 'text-orange-600 bg-orange-50';
      case 'Hipertensi Tingkat 2': return 'text-red-600 bg-red-50';
      case 'Krisis Hipertensi': return 'text-red-800 bg-red-100';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  const getBMICategoryColor = (category?: string): string => {
    switch (category) {
      case 'Normal': return 'text-green-600 bg-green-50';
      case 'Kurus': return 'text-blue-600 bg-blue-50';
      case 'Gemuk': return 'text-orange-600 bg-orange-50';
      case 'Obesitas': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
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

  if (sortedExaminations.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">Belum Ada Riwayat Pemeriksaan</h3>
          <p className="text-gray-600">
            Pasien {patient.nama} belum memiliki riwayat pemeriksaan fisik.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">
          Riwayat Pemeriksaan Fisik ({sortedExaminations.length})
        </h3>
      </div>

      <div className="space-y-4">
        {sortedExaminations.map((examination) => {
          const bpCategory = getBloodPressureCategory(
            examination.tekanan_darah_sistolik, 
            examination.tekanan_darah_diastolik
          );

          return (
            <Card key={examination.id} className="p-4">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-medium text-gray-900">
                    Pemeriksaan {formatDate(examination.tanggal_pemeriksaan)}
                  </h4>
                  <p className="text-sm text-gray-600">
                    ID Pemeriksaan: {examination.id}
                  </p>
                </div>
                
                <div className="flex gap-2">
                  {onEditExamination && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEditExamination(examination)}
                    >
                      Edit
                    </Button>
                  )}
                  {onDeleteExamination && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteExamination(examination)}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      Hapus
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                {/* Anthropometric Measurements */}
                {examination.tinggi_badan && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Tinggi Badan</p>
                    <p className="font-medium">{examination.tinggi_badan} cm</p>
                  </div>
                )}

                {examination.berat_badan && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Berat Badan</p>
                    <p className="font-medium">{examination.berat_badan} kg</p>
                  </div>
                )}

                {examination.lingkar_perut && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Lingkar Perut</p>
                    <p className="font-medium">{examination.lingkar_perut} cm</p>
                  </div>
                )}

                {/* Blood Pressure */}
                {examination.tekanan_darah_sistolik && examination.tekanan_darah_diastolik && (
                  <div className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm text-gray-600">Tekanan Darah</p>
                    <p className="font-medium">
                      {examination.tekanan_darah_sistolik}/{examination.tekanan_darah_diastolik} mmHg
                    </p>
                    {bpCategory && (
                      <span className={`inline-block px-2 py-1 rounded text-xs mt-1 ${getBPCategoryColor(bpCategory)}`}>
                        {bpCategory}
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* BMI Display */}
              {examination.bmi && (
                <div className="mb-4">
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">BMI:</span> {examination.bmi.toFixed(1)} kg/m²
                      {examination.bmiCategory && (
                        <span className={`ml-2 px-2 py-1 rounded text-xs ${getBMICategoryColor(examination.bmiCategory)}`}>
                          {examination.bmiCategory}
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              )}

              {/* Notes */}
              {examination.catatan && (
                <div className="border-t pt-3">
                  <p className="text-sm text-gray-600 mb-1">Catatan:</p>
                  <p className="text-gray-900">{examination.catatan}</p>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {/* Trends Summary */}
      {sortedExaminations.length > 1 && (
        <Card className="p-4">
          <h4 className="font-medium text-gray-900 mb-3">Ringkasan Tren</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Pemeriksaan:</p>
              <p className="font-medium">{sortedExaminations.length} kali</p>
            </div>
            <div>
              <p className="text-gray-600">Pemeriksaan Terakhir:</p>
              <p className="font-medium">{formatDate(sortedExaminations[0].tanggal_pemeriksaan)}</p>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
}