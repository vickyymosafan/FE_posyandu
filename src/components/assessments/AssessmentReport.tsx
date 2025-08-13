'use client';

import React from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AssessmentWithDetails, AssessmentCategory } from '@/types/assessment';
import { formatDate, formatDateTime } from '@/lib/utils';

interface AssessmentReportProps {
  assessment: AssessmentWithDetails;
  onEdit?: () => void;
  onPrint?: () => void;
  showActions?: boolean;
}

const getCategoryConfig = (category: AssessmentCategory) => {
  switch (category) {
    case 'normal':
      return {
        label: 'Normal',
        color: 'text-green-700 bg-green-100',
        icon: '✓',
        description: 'Kondisi kesehatan dalam batas normal'
      };
    case 'perlu_perhatian':
      return {
        label: 'Perlu Perhatian',
        color: 'text-yellow-700 bg-yellow-100',
        icon: '⚠',
        description: 'Memerlukan monitoring dan perawatan lanjutan'
      };
    case 'rujukan':
      return {
        label: 'Rujukan',
        color: 'text-red-700 bg-red-100',
        icon: '⚡',
        description: 'Memerlukan rujukan ke fasilitas kesehatan yang lebih lengkap'
      };
    default:
      return {
        label: 'Unknown',
        color: 'text-gray-700 bg-gray-100',
        icon: '?',
        description: 'Status tidak diketahui'
      };
  }
};

export default function AssessmentReport({ 
  assessment, 
  onEdit, 
  onPrint, 
  showActions = true 
}: AssessmentReportProps) {
  const categoryConfig = getCategoryConfig(assessment.kategori_penilaian);

  const handlePrint = () => {
    if (onPrint) {
      onPrint();
    } else {
      // Default print functionality
      window.print();
    }
  };

  return (
    <Card className="p-6 print:shadow-none print:border-none">
      {/* Header */}
      <div className="flex justify-between items-start mb-6 print:mb-4">
        <div>
          <h2 className="text-xl font-semibold text-gray-900 print:text-lg">
            Laporan Penilaian Kesehatan
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Tanggal: {formatDateTime(assessment.tanggal_penilaian)}
          </p>
        </div>
        
        {showActions && (
          <div className="flex gap-2 print:hidden">
            {onEdit && (
              <Button
                variant="outline"
                size="sm"
                onClick={onEdit}
              >
                Edit
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
            >
              Print
            </Button>
          </div>
        )}
      </div>

      {/* Patient Information */}
      <div className="mb-6 print:mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 print:text-base">
          Informasi Pasien
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700">Nama:</span>
            <span className="ml-2">{assessment.nama_pasien}</span>
          </div>
          <div>
            <span className="font-medium text-gray-700">Diperiksa oleh:</span>
            <span className="ml-2">{assessment.admin_nama}</span>
          </div>
        </div>
      </div>

      {/* Assessment Category */}
      <div className="mb-6 print:mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 print:text-base">
          Kategori Penilaian
        </h3>
        <div className={`inline-flex items-center px-4 py-2 rounded-lg ${categoryConfig.color}`}>
          <span className="text-lg mr-2">{categoryConfig.icon}</span>
          <div>
            <div className="font-medium">{categoryConfig.label}</div>
            <div className="text-xs opacity-75">{categoryConfig.description}</div>
          </div>
        </div>
      </div>

      {/* Examination Data */}
      {(assessment.pemeriksaan_fisik || assessment.tes_lanjutan) && (
        <div className="mb-6 print:mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 print:text-base">
            Data Pemeriksaan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Physical Examination */}
            {assessment.pemeriksaan_fisik && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Pemeriksaan Fisik</h4>
                <div className="space-y-1 text-sm">
                  {assessment.pemeriksaan_fisik.tinggi_badan && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tinggi Badan:</span>
                      <span>{assessment.pemeriksaan_fisik.tinggi_badan} cm</span>
                    </div>
                  )}
                  {assessment.pemeriksaan_fisik.berat_badan && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Berat Badan:</span>
                      <span>{assessment.pemeriksaan_fisik.berat_badan} kg</span>
                    </div>
                  )}
                  {assessment.pemeriksaan_fisik.tinggi_badan && assessment.pemeriksaan_fisik.berat_badan && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">BMI:</span>
                      <span>
                        {(assessment.pemeriksaan_fisik.berat_badan / 
                          Math.pow(assessment.pemeriksaan_fisik.tinggi_badan / 100, 2)
                        ).toFixed(1)} kg/m²
                      </span>
                    </div>
                  )}
                  {assessment.pemeriksaan_fisik.tekanan_darah_sistolik && 
                   assessment.pemeriksaan_fisik.tekanan_darah_diastolik && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Tekanan Darah:</span>
                      <span>
                        {assessment.pemeriksaan_fisik.tekanan_darah_sistolik}/
                        {assessment.pemeriksaan_fisik.tekanan_darah_diastolik} mmHg
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Advanced Test */}
            {assessment.tes_lanjutan && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-800">Tes Lanjutan</h4>
                <div className="space-y-1 text-sm">
                  {assessment.tes_lanjutan.gula_darah && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Gula Darah:</span>
                      <span>{assessment.tes_lanjutan.gula_darah} mg/dL</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Findings */}
      <div className="mb-6 print:mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 print:text-base">
          Temuan Pemeriksaan
        </h3>
        <div className="bg-gray-50 p-4 rounded-lg print:bg-white print:border">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {assessment.temuan || 'Tidak ada temuan yang dicatat'}
          </p>
        </div>
      </div>

      {/* Recommendations */}
      <div className="mb-6 print:mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-3 print:text-base">
          Rekomendasi
        </h3>
        <div className="bg-blue-50 p-4 rounded-lg print:bg-white print:border">
          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
            {assessment.rekomendasi || 'Tidak ada rekomendasi yang dicatat'}
          </p>
        </div>
      </div>

      {/* Priority Actions (for non-normal categories) */}
      {assessment.kategori_penilaian !== 'normal' && (
        <div className="mb-6 print:mb-4">
          <h3 className="text-lg font-medium text-gray-900 mb-3 print:text-base">
            Tindakan Prioritas
          </h3>
          <div className={`p-4 rounded-lg border-l-4 ${
            assessment.kategori_penilaian === 'rujukan' 
              ? 'bg-red-50 border-red-400' 
              : 'bg-yellow-50 border-yellow-400'
          }`}>
            <div className="flex items-start">
              <span className="text-lg mr-2">{categoryConfig.icon}</span>
              <div>
                <p className="font-medium text-sm">
                  {assessment.kategori_penilaian === 'rujukan' 
                    ? 'Segera rujuk ke fasilitas kesehatan yang lebih lengkap'
                    : 'Lakukan monitoring dan perawatan lanjutan'
                  }
                </p>
                <p className="text-xs text-gray-600 mt-1">
                  {assessment.kategori_penilaian === 'rujukan'
                    ? 'Kondisi pasien memerlukan penanganan medis yang lebih komprehensif'
                    : 'Pantau perkembangan kondisi pasien secara berkala'
                  }
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="border-t pt-4 print:pt-2">
        <div className="flex justify-between items-center text-xs text-gray-500">
          <div>
            Sistem Manajemen Posyandu
          </div>
          <div>
            Dicetak pada: {formatDateTime(new Date().toISOString())}
          </div>
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .print\\:hidden {
            display: none !important;
          }
          .print\\:shadow-none {
            box-shadow: none !important;
          }
          .print\\:border-none {
            border: none !important;
          }
          .print\\:bg-white {
            background-color: white !important;
          }
          .print\\:border {
            border: 1px solid #e5e7eb !important;
          }
          .print\\:text-lg {
            font-size: 1.125rem !important;
          }
          .print\\:text-base {
            font-size: 1rem !important;
          }
          .print\\:mb-4 {
            margin-bottom: 1rem !important;
          }
          .print\\:pt-2 {
            padding-top: 0.5rem !important;
          }
        }
      `}</style>
    </Card>
  );
}