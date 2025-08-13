'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { assessmentsApi } from '@/lib/api/assessments';
import { examinationsApi } from '@/lib/api/examinations';
import { 
  HealthAssessmentData, 
  HealthAssessment, 
  AssessmentCategory 
} from '@/types/assessment';
import { Patient } from '@/types/patient';
import { PhysicalExamination, AdvancedTest } from '@/types/examination';

interface HealthAssessmentFormProps {
  patient: Patient;
  assessment?: HealthAssessment;
  onSuccess?: (assessment: HealthAssessment) => void;
  onCancel?: () => void;
}

interface FormData {
  kategori_penilaian: AssessmentCategory;
  temuan: string;
  rekomendasi: string;
  id_pemeriksaan_fisik?: number;
  id_tes_lanjutan?: number;
}

interface FormErrors {
  kategori_penilaian?: string;
  temuan?: string;
  rekomendasi?: string;
}

const CATEGORY_OPTIONS: { value: AssessmentCategory; label: string; description: string; color: string }[] = [
  {
    value: 'normal',
    label: 'Normal',
    description: 'Kondisi kesehatan dalam batas normal',
    color: 'text-green-700 bg-green-50 border-green-200'
  },
  {
    value: 'perlu_perhatian',
    label: 'Perlu Perhatian',
    description: 'Memerlukan monitoring dan perawatan lanjutan',
    color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
  },
  {
    value: 'rujukan',
    label: 'Rujukan',
    description: 'Memerlukan rujukan ke fasilitas kesehatan yang lebih lengkap',
    color: 'text-red-700 bg-red-50 border-red-200'
  }
];

export default function HealthAssessmentForm({ 
  patient, 
  assessment, 
  onSuccess, 
  onCancel 
}: HealthAssessmentFormProps) {
  const [formData, setFormData] = useState<FormData>({
    kategori_penilaian: 'normal',
    temuan: '',
    rekomendasi: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [latestExamination, setLatestExamination] = useState<PhysicalExamination | null>(null);
  const [latestAdvancedTest, setLatestAdvancedTest] = useState<AdvancedTest | null>(null);

  // Load latest examination data for auto-population
  useEffect(() => {
    const loadLatestData = async () => {
      try {
        setIsLoadingData(true);
        
        // Get patient's latest examinations
        const [physicalExams, advancedTests] = await Promise.all([
          examinationsApi.getPatientExaminations(patient.id),
          examinationsApi.getPatientAdvancedTests(patient.id)
        ]);

        const latestPhysical = physicalExams.length > 0 ? physicalExams[0] : null;
        const latestAdvanced = advancedTests.length > 0 ? advancedTests[0] : null;

        setLatestExamination(latestPhysical);
        setLatestAdvancedTest(latestAdvanced);

        // Auto-populate form data if editing existing assessment
        if (assessment) {
          setFormData({
            kategori_penilaian: assessment.kategori_penilaian,
            temuan: assessment.temuan || '',
            rekomendasi: assessment.rekomendasi || '',
            id_pemeriksaan_fisik: assessment.id_pemeriksaan_fisik,
            id_tes_lanjutan: assessment.id_tes_lanjutan,
          });
        } else {
          // Auto-populate with latest examination data for new assessment
          setFormData(prev => ({
            ...prev,
            id_pemeriksaan_fisik: latestPhysical?.id,
            id_tes_lanjutan: latestAdvanced?.id,
          }));

          // Generate auto-suggestions based on examination data
          await generateAutoSuggestions(latestPhysical, latestAdvanced);
        }
      } catch (error) {
        console.error('Error loading examination data:', error);
        toast.error('Gagal memuat data pemeriksaan');
      } finally {
        setIsLoadingData(false);
      }
    };

    loadLatestData();
  }, [patient.id, assessment]);

  const generateAutoSuggestions = async (
    physicalExam: PhysicalExamination | null,
    advancedTest: AdvancedTest | null
  ) => {
    try {
      if (!physicalExam && !advancedTest) return;

      // Try to get recommendations from backend
      const recommendations = await assessmentsApi.getAssessmentRecommendations(
        physicalExam?.id,
        advancedTest?.id
      );

      setFormData(prev => ({
        ...prev,
        kategori_penilaian: recommendations.suggestedCategory,
        temuan: recommendations.findings.join('; '),
        rekomendasi: recommendations.recommendations.join('; '),
      }));
    } catch (error) {
      // If backend doesn't have recommendation endpoint, generate basic suggestions
      generateBasicSuggestions(physicalExam, advancedTest);
    }
  };

  const generateBasicSuggestions = (
    physicalExam: PhysicalExamination | null,
    advancedTest: AdvancedTest | null
  ) => {
    const findings: string[] = [];
    const recommendations: string[] = [];
    let suggestedCategory: AssessmentCategory = 'normal';

    // Analyze physical examination
    if (physicalExam) {
      // BMI Analysis
      if (physicalExam.tinggi_badan && physicalExam.berat_badan) {
        const tinggiMeter = physicalExam.tinggi_badan / 100;
        const bmi = physicalExam.berat_badan / (tinggiMeter * tinggiMeter);
        
        if (bmi < 18.5) {
          findings.push('BMI rendah (kurus)');
          recommendations.push('Konsultasi gizi untuk peningkatan berat badan');
          suggestedCategory = 'perlu_perhatian';
        } else if (bmi >= 30) {
          findings.push('BMI tinggi (obesitas)');
          recommendations.push('Program penurunan berat badan dan konsultasi gizi');
          suggestedCategory = 'perlu_perhatian';
        } else if (bmi >= 25) {
          findings.push('BMI sedikit tinggi (gemuk)');
          recommendations.push('Monitoring berat badan dan pola makan sehat');
        }
      }

      // Blood Pressure Analysis
      if (physicalExam.tekanan_darah_sistolik && physicalExam.tekanan_darah_diastolik) {
        const sistolik = physicalExam.tekanan_darah_sistolik;
        const diastolik = physicalExam.tekanan_darah_diastolik;
        
        if (sistolik >= 180 || diastolik >= 110) {
          findings.push('Hipertensi berat');
          recommendations.push('Rujukan segera ke dokter spesialis');
          suggestedCategory = 'rujukan';
        } else if (sistolik >= 140 || diastolik >= 90) {
          findings.push('Hipertensi');
          recommendations.push('Monitoring tekanan darah rutin dan konsultasi dokter');
          suggestedCategory = 'perlu_perhatian';
        } else if (sistolik >= 120 || diastolik >= 80) {
          findings.push('Prehipertensi');
          recommendations.push('Monitoring tekanan darah dan gaya hidup sehat');
        }
      }
    }

    // Analyze advanced test (glucose)
    if (advancedTest?.gula_darah) {
      const glucose = advancedTest.gula_darah;
      
      if (glucose >= 200) {
        findings.push('Gula darah sangat tinggi');
        recommendations.push('Rujukan segera ke dokter untuk evaluasi diabetes');
        suggestedCategory = 'rujukan';
      } else if (glucose >= 140) {
        findings.push('Gula darah tinggi');
        recommendations.push('Konsultasi dokter dan monitoring gula darah rutin');
        suggestedCategory = 'perlu_perhatian';
      } else if (glucose >= 100) {
        findings.push('Gula darah sedikit tinggi');
        recommendations.push('Monitoring gula darah dan diet rendah gula');
      }
    }

    // Set default findings if none found
    if (findings.length === 0) {
      findings.push('Pemeriksaan dalam batas normal');
      recommendations.push('Lanjutkan gaya hidup sehat dan pemeriksaan rutin');
    }

    setFormData(prev => ({
      ...prev,
      kategori_penilaian: suggestedCategory,
      temuan: findings.join('; '),
      rekomendasi: recommendations.join('; '),
    }));
  };

  const handleInputChange = (field: keyof FormData, value: string | AssessmentCategory) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.kategori_penilaian) {
      newErrors.kategori_penilaian = 'Kategori penilaian harus dipilih';
    }

    if (!formData.temuan.trim()) {
      newErrors.temuan = 'Temuan pemeriksaan harus diisi';
    } else if (formData.temuan.trim().length < 10) {
      newErrors.temuan = 'Temuan minimal 10 karakter';
    }

    if (!formData.rekomendasi.trim()) {
      newErrors.rekomendasi = 'Rekomendasi harus diisi';
    } else if (formData.rekomendasi.trim().length < 10) {
      newErrors.rekomendasi = 'Rekomendasi minimal 10 karakter';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error('Mohon perbaiki kesalahan pada form');
      return;
    }

    setIsSubmitting(true);
    try {
      const assessmentData: HealthAssessmentData = {
        id_pasien: patient.id,
        kategori_penilaian: formData.kategori_penilaian,
        temuan: formData.temuan.trim(),
        rekomendasi: formData.rekomendasi.trim(),
        id_pemeriksaan_fisik: formData.id_pemeriksaan_fisik,
        id_tes_lanjutan: formData.id_tes_lanjutan,
      };

      let result: HealthAssessment;
      
      if (assessment) {
        result = await assessmentsApi.updateAssessment(assessment.id, assessmentData);
        toast.success('Penilaian kesehatan berhasil diperbarui');
      } else {
        result = await assessmentsApi.createAssessment(assessmentData);
        toast.success('Penilaian kesehatan berhasil disimpan');
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('Error saving assessment:', error);
      toast.error(error.response?.data?.pesan || 'Gagal menyimpan penilaian kesehatan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      kategori_penilaian: 'normal',
      temuan: '',
      rekomendasi: '',
      id_pemeriksaan_fisik: latestExamination?.id,
      id_tes_lanjutan: latestAdvancedTest?.id,
    });
    setErrors({});
  };

  if (isLoadingData) {
    return (
      <Card className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/3"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-3">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {assessment ? 'Edit Penilaian Kesehatan' : 'Penilaian Kesehatan Baru'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Pasien: <span className="font-medium">{patient.nama}</span> (ID: {patient.id_pasien})
        </p>
      </div>

      {/* Latest Examination Summary */}
      {(latestExamination || latestAdvancedTest) && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Data Pemeriksaan Terbaru</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {latestExamination && (
              <div>
                <p className="font-medium text-blue-800">Pemeriksaan Fisik:</p>
                <ul className="text-blue-700 space-y-1">
                  {latestExamination.tinggi_badan && (
                    <li>Tinggi: {latestExamination.tinggi_badan} cm</li>
                  )}
                  {latestExamination.berat_badan && (
                    <li>Berat: {latestExamination.berat_badan} kg</li>
                  )}
                  {latestExamination.tekanan_darah_sistolik && latestExamination.tekanan_darah_diastolik && (
                    <li>TD: {latestExamination.tekanan_darah_sistolik}/{latestExamination.tekanan_darah_diastolik} mmHg</li>
                  )}
                </ul>
              </div>
            )}
            {latestAdvancedTest && (
              <div>
                <p className="font-medium text-blue-800">Tes Lanjutan:</p>
                <ul className="text-blue-700 space-y-1">
                  {latestAdvancedTest.gula_darah && (
                    <li>Gula Darah: {latestAdvancedTest.gula_darah} mg/dL</li>
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Assessment Category */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Kategori Penilaian <span className="text-red-500">*</span>
          </label>
          <div className="space-y-3">
            {CATEGORY_OPTIONS.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  formData.kategori_penilaian === option.value
                    ? option.color
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="kategori_penilaian"
                  value={option.value}
                  checked={formData.kategori_penilaian === option.value}
                  onChange={(e) => handleInputChange('kategori_penilaian', e.target.value as AssessmentCategory)}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-75">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
          {errors.kategori_penilaian && (
            <p className="mt-1 text-xs text-red-600">{errors.kategori_penilaian}</p>
          )}
        </div>

        {/* Findings */}
        <div>
          <Textarea
            label="Temuan Pemeriksaan"
            value={formData.temuan}
            onChange={(e) => handleInputChange('temuan', e.target.value)}
            error={!!errors.temuan}
            helperText={errors.temuan || 'Jelaskan hasil temuan dari pemeriksaan fisik dan tes lanjutan'}
            placeholder="Contoh: BMI dalam batas normal, tekanan darah sedikit tinggi, gula darah normal..."
            rows={4}
            maxLength={1000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.temuan.length}/1000 karakter
          </div>
        </div>

        {/* Recommendations */}
        <div>
          <Textarea
            label="Rekomendasi"
            value={formData.rekomendasi}
            onChange={(e) => handleInputChange('rekomendasi', e.target.value)}
            error={!!errors.rekomendasi}
            helperText={errors.rekomendasi || 'Berikan rekomendasi tindak lanjut berdasarkan hasil penilaian'}
            placeholder="Contoh: Lanjutkan gaya hidup sehat, monitoring tekanan darah rutin, konsultasi dokter jika diperlukan..."
            rows={4}
            maxLength={1000}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {formData.rekomendasi.length}/1000 karakter
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="sm:order-2"
          >
            {isSubmitting ? 'Menyimpan...' : (assessment ? 'Perbarui Penilaian' : 'Simpan Penilaian')}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            className="sm:order-1"
          >
            Reset Form
          </Button>
          
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              onClick={onCancel}
              disabled={isSubmitting}
              className="sm:order-3"
            >
              Batal
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}