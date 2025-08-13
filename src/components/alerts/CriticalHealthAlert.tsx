'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { Patient } from '@/types/patient';
import { PhysicalExamination, AdvancedTest } from '@/types/examination';
import { HealthAssessment } from '@/types/assessment';

interface CriticalHealthAlertProps {
  patient: Patient;
  latestExamination?: PhysicalExamination | null;
  latestAdvancedTest?: AdvancedTest | null;
  latestAssessment?: HealthAssessment | null;
  onReferralRecommended?: () => void;
  onTreatmentRecommended?: () => void;
}

interface CriticalIndicator {
  type: 'critical' | 'warning' | 'info';
  title: string;
  message: string;
  recommendation: string;
  action?: 'referral' | 'treatment' | 'monitoring';
}

export default function CriticalHealthAlert({
  patient,
  latestExamination,
  latestAdvancedTest,
  latestAssessment,
  onReferralRecommended,
  onTreatmentRecommended
}: CriticalHealthAlertProps) {
  const [indicators, setIndicators] = useState<CriticalIndicator[]>([]);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [hasShownToast, setHasShownToast] = useState(false);

  const analyzeCriticalIndicators = React.useCallback((): CriticalIndicator[] => {
    const indicators: CriticalIndicator[] = [];

    // Analyze Physical Examination
    if (latestExamination) {
      // Blood Pressure Analysis
      if (latestExamination.tekanan_darah_sistolik && latestExamination.tekanan_darah_diastolik) {
        const sistolik = latestExamination.tekanan_darah_sistolik;
        const diastolik = latestExamination.tekanan_darah_diastolik;

        if (sistolik >= 180 || diastolik >= 110) {
          indicators.push({
            type: 'critical',
            title: 'Hipertensi Berat',
            message: `Tekanan darah ${sistolik}/${diastolik} mmHg sangat tinggi dan berbahaya`,
            recommendation: 'Rujukan segera ke dokter spesialis atau rumah sakit untuk penanganan darurat',
            action: 'referral'
          });
        } else if (sistolik >= 160 || diastolik >= 100) {
          indicators.push({
            type: 'warning',
            title: 'Hipertensi Sedang',
            message: `Tekanan darah ${sistolik}/${diastolik} mmHg tinggi`,
            recommendation: 'Konsultasi dokter dan monitoring ketat, pertimbangkan rujukan',
            action: 'treatment'
          });
        }
      }

      // BMI Analysis
      if (latestExamination.tinggi_badan && latestExamination.berat_badan) {
        const tinggiMeter = latestExamination.tinggi_badan / 100;
        const bmi = latestExamination.berat_badan / (tinggiMeter * tinggiMeter);

        if (bmi < 16) {
          indicators.push({
            type: 'critical',
            title: 'Kekurangan Berat Badan Berat',
            message: `BMI ${bmi.toFixed(1)} menunjukkan malnutrisi berat`,
            recommendation: 'Rujukan ke ahli gizi dan evaluasi medis komprehensif',
            action: 'referral'
          });
        } else if (bmi >= 35) {
          indicators.push({
            type: 'warning',
            title: 'Obesitas Berat',
            message: `BMI ${bmi.toFixed(1)} menunjukkan obesitas kelas II`,
            recommendation: 'Program penurunan berat badan intensif dan monitoring kesehatan',
            action: 'treatment'
          });
        }
      }
    }

    // Analyze Advanced Tests
    if (latestAdvancedTest?.gula_darah) {
      const glucose = latestAdvancedTest.gula_darah;

      if (glucose >= 300) {
        indicators.push({
          type: 'critical',
          title: 'Gula Darah Sangat Tinggi',
          message: `Kadar gula darah ${glucose} mg/dL dalam kondisi berbahaya`,
          recommendation: 'Rujukan segera ke IGD untuk penanganan ketoasidosis diabetik',
          action: 'referral'
        });
      } else if (glucose >= 250) {
        indicators.push({
          type: 'warning',
          title: 'Gula Darah Tinggi',
          message: `Kadar gula darah ${glucose} mg/dL sangat tinggi`,
          recommendation: 'Konsultasi dokter segera untuk penyesuaian terapi diabetes',
          action: 'treatment'
        });
      } else if (glucose <= 70) {
        indicators.push({
          type: 'critical',
          title: 'Hipoglikemia',
          message: `Kadar gula darah ${glucose} mg/dL terlalu rendah`,
          recommendation: 'Berikan glukosa segera dan rujuk untuk evaluasi',
          action: 'referral'
        });
      }
    }

    // Analyze Assessment Category
    if (latestAssessment?.kategori_penilaian === 'rujukan') {
      indicators.push({
        type: 'warning',
        title: 'Kategori Rujukan',
        message: 'Penilaian kesehatan terakhir menunjukkan perlu rujukan',
        recommendation: 'Segera buat rujukan ke fasilitas kesehatan yang sesuai',
        action: 'referral'
      });
    }

    // Age-related indicators for elderly patients
    const age = calculateAge(patient.tanggal_lahir);
    if (age >= 70) {
      // Additional monitoring for elderly
      if (latestExamination?.tekanan_darah_sistolik && latestExamination.tekanan_darah_sistolik < 90) {
        indicators.push({
          type: 'warning',
          title: 'Hipotensi pada Lansia',
          message: `Tekanan darah sistolik ${latestExamination.tekanan_darah_sistolik} mmHg rendah untuk usia ${age} tahun`,
          recommendation: 'Evaluasi penyebab hipotensi dan risiko jatuh',
          action: 'monitoring'
        });
      }
    }

    return indicators;
  }, [latestExamination, latestAdvancedTest, latestAssessment, patient.tanggal_lahir]);

  useEffect(() => {
    const criticalIndicators = analyzeCriticalIndicators();
    setIndicators(criticalIndicators);

    // Show toast notification for critical indicators
    const criticalCount = criticalIndicators.filter(i => i.type === 'critical').length;
    if (criticalCount > 0 && !hasShownToast) {
      toast.error(
        `${criticalCount} indikator kesehatan kritis terdeteksi untuk ${patient.nama}`,
        {
          duration: 6000,
          position: 'top-right',
        }
      );
      setHasShownToast(true);
    }
  }, [analyzeCriticalIndicators, patient.nama, hasShownToast]);

  // analyzeCriticalIndicators function moved to useCallback above

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const handleActionClick = (action: string) => {
    switch (action) {
      case 'referral':
        onReferralRecommended?.();
        break;
      case 'treatment':
        onTreatmentRecommended?.();
        break;
      default:
        break;
    }
    setIsAlertModalOpen(false);
  };

  const getIndicatorIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return (
          <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
      case 'warning':
        return (
          <svg className="w-6 h-6 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      default:
        return (
          <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        );
    }
  };

  const getIndicatorColor = (type: string) => {
    switch (type) {
      case 'critical':
        return 'bg-red-50 border-red-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (indicators.length === 0) {
    return null;
  }

  const criticalCount = indicators.filter(i => i.type === 'critical').length;
  const warningCount = indicators.filter(i => i.type === 'warning').length;

  return (
    <>
      {/* Alert Summary Card */}
      <div className={`p-4 rounded-lg border-2 ${
        criticalCount > 0 ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
      }`}>
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            {criticalCount > 0 ? (
              <svg className="w-6 h-6 text-red-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            ) : (
              <svg className="w-6 h-6 text-yellow-600 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            )}
            <div>
              <h3 className={`font-semibold ${
                criticalCount > 0 ? 'text-red-800' : 'text-yellow-800'
              }`}>
                Indikator Kesehatan Memerlukan Perhatian
              </h3>
              <p className={`text-sm mt-1 ${
                criticalCount > 0 ? 'text-red-700' : 'text-yellow-700'
              }`}>
                {criticalCount > 0 && `${criticalCount} indikator kritis, `}
                {warningCount > 0 && `${warningCount} peringatan `}
                terdeteksi untuk pasien {patient.nama}
              </p>
            </div>
          </div>
          <Button
            size="sm"
            variant={criticalCount > 0 ? "destructive" : "warning"}
            onClick={() => setIsAlertModalOpen(true)}
          >
            Lihat Detail
          </Button>
        </div>
      </div>

      {/* Detailed Alert Modal */}
      <Modal
        isOpen={isAlertModalOpen}
        onClose={() => setIsAlertModalOpen(false)}
        title="Indikator Kesehatan Kritis"
        size="lg"
      >
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-medium text-gray-900 mb-1">Pasien: {patient.nama}</h4>
            <p className="text-sm text-gray-600">
              Usia: {calculateAge(patient.tanggal_lahir)} tahun | NIK: {patient.nik}
            </p>
          </div>

          <div className="space-y-3">
            {indicators.map((indicator, index) => (
              <div
                key={index}
                className={`p-4 rounded-lg border ${getIndicatorColor(indicator.type)}`}
              >
                <div className="flex items-start space-x-3">
                  {getIndicatorIcon(indicator.type)}
                  <div className="flex-1">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {indicator.title}
                    </h4>
                    <p className="text-sm text-gray-700 mb-2">
                      {indicator.message}
                    </p>
                    <p className="text-sm font-medium text-gray-800 mb-3">
                      Rekomendasi: {indicator.recommendation}
                    </p>
                    
                    {indicator.action && (
                      <div className="flex gap-2">
                        {indicator.action === 'referral' && (
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleActionClick('referral')}
                          >
                            Buat Rujukan
                          </Button>
                        )}
                        {indicator.action === 'treatment' && (
                          <Button
                            size="sm"
                            variant="warning"
                            onClick={() => handleActionClick('treatment')}
                          >
                            Buat Resep
                          </Button>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t">
            <p className="text-xs text-gray-500">
              * Indikator ini dihasilkan berdasarkan data pemeriksaan terbaru. 
              Selalu konsultasikan dengan tenaga medis yang kompeten untuk keputusan klinis.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
}