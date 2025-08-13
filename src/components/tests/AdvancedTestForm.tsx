'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { advancedTestsApi } from '@/lib/api/advancedTests';
import { AdvancedTestData, AdvancedTest } from '@/types/examination';
import { Patient } from '@/types/patient';

interface AdvancedTestFormProps {
  patient: Patient;
  test?: AdvancedTest;
  onSuccess?: (test: AdvancedTest) => void;
  onCancel?: () => void;
}

interface FormData {
  gula_darah: string;
  catatan: string;
}

interface FormErrors {
  gula_darah?: string;
  catatan?: string;
}

// Medical validation ranges for blood glucose (mg/dL)
const GLUCOSE_RANGES = {
  normal_fasting: { min: 70, max: 100 },
  prediabetes_fasting: { min: 100, max: 125 },
  diabetes_fasting: { min: 126, max: 400 },
  normal_random: { min: 70, max: 140 },
  prediabetes_random: { min: 140, max: 199 },
  diabetes_random: { min: 200, max: 400 },
  absolute: { min: 20, max: 600 } // Absolute medical limits
};

export default function AdvancedTestForm({ 
  patient, 
  test, 
  onSuccess, 
  onCancel 
}: AdvancedTestFormProps) {
  const [formData, setFormData] = useState<FormData>({
    gula_darah: '',
    catatan: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing existing test
  useEffect(() => {
    if (test) {
      setFormData({
        gula_darah: test.gula_darah?.toString() || '',
        catatan: test.catatan || '',
      });
    }
  }, [test]);

  const validateGlucose = (value: string): string | undefined => {
    if (!value.trim()) {
      return 'Kadar gula darah wajib diisi';
    }
    
    const numValue = parseFloat(value);
    
    if (isNaN(numValue)) {
      return 'Kadar gula darah harus berupa angka';
    }
    
    if (numValue < GLUCOSE_RANGES.absolute.min || numValue > GLUCOSE_RANGES.absolute.max) {
      return `Kadar gula darah harus antara ${GLUCOSE_RANGES.absolute.min}-${GLUCOSE_RANGES.absolute.max} mg/dL`;
    }
    
    return undefined;
  };

  const getGlucoseCategory = (glucose: number): {
    category: string;
    color: string;
    description: string;
  } => {
    // Assuming random/non-fasting test for simplicity
    if (glucose < GLUCOSE_RANGES.normal_random.min) {
      return {
        category: 'Rendah',
        color: 'text-blue-600 bg-blue-50',
        description: 'Di bawah normal - perlu perhatian'
      };
    } else if (glucose <= GLUCOSE_RANGES.normal_random.max) {
      return {
        category: 'Normal',
        color: 'text-green-600 bg-green-50',
        description: 'Dalam rentang normal'
      };
    } else if (glucose <= GLUCOSE_RANGES.prediabetes_random.max) {
      return {
        category: 'Prediabetes',
        color: 'text-yellow-600 bg-yellow-50',
        description: 'Risiko diabetes - perlu pemantauan'
      };
    } else if (glucose >= GLUCOSE_RANGES.diabetes_random.min) {
      return {
        category: 'Diabetes',
        color: 'text-red-600 bg-red-50',
        description: 'Indikasi diabetes - perlu rujukan'
      };
    } else {
      return {
        category: 'Tinggi',
        color: 'text-orange-600 bg-orange-50',
        description: 'Di atas normal - perlu evaluasi'
      };
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation for glucose
    if (field === 'gula_darah') {
      const error = validateGlucose(value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate glucose
    const glucoseError = validateGlucose(formData.gula_darah);
    if (glucoseError) {
      newErrors.gula_darah = glucoseError;
    }

    // Validate notes length
    if (formData.catatan.length > 500) {
      newErrors.catatan = 'Catatan tidak boleh lebih dari 500 karakter';
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
      const testData: AdvancedTestData = {
        id_pasien: patient.id,
        gula_darah: parseFloat(formData.gula_darah),
        catatan: formData.catatan.trim() || undefined,
      };

      let result: AdvancedTest;
      
      if (test) {
        result = await advancedTestsApi.updateAdvancedTest(test.id, testData);
        toast.success('Tes lanjutan berhasil diperbarui');
      } else {
        result = await advancedTestsApi.createAdvancedTest(testData);
        toast.success('Tes lanjutan berhasil disimpan');
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('Error saving advanced test:', error);
      toast.error(error.response?.data?.pesan || 'Gagal menyimpan tes lanjutan');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      gula_darah: '',
      catatan: '',
    });
    setErrors({});
  };

  const currentGlucose = parseFloat(formData.gula_darah);
  const glucoseInfo = !isNaN(currentGlucose) ? getGlucoseCategory(currentGlucose) : null;

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {test ? 'Edit Tes Lanjutan' : 'Tes Kesehatan Lanjutan Baru'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Pasien: <span className="font-medium">{patient.nama}</span> (ID: {patient.id_pasien})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Blood Glucose Test */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tes Gula Darah</h3>
          
          <div className="space-y-4">
            <Input
              label="Kadar Gula Darah (mg/dL)"
              type="number"
              value={formData.gula_darah}
              onChange={(e) => handleInputChange('gula_darah', e.target.value)}
              error={!!errors.gula_darah}
              helperText={errors.gula_darah || 'Masukkan hasil tes gula darah dalam mg/dL'}
              placeholder="120"
              min={GLUCOSE_RANGES.absolute.min}
              max={GLUCOSE_RANGES.absolute.max}
              step="1"
              required
            />

            {/* Glucose Category Display */}
            {glucoseInfo && (
              <div className={`p-4 rounded-lg ${glucoseInfo.color}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      Kategori: {glucoseInfo.category}
                    </p>
                    <p className="text-sm mt-1">
                      {glucoseInfo.description}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold">
                      {currentGlucose} <span className="text-sm font-normal">mg/dL</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Reference Ranges */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <h4 className="font-medium text-gray-900 mb-2">Rentang Referensi (mg/dL):</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between">
                  <span>Normal:</span>
                  <span className="font-medium text-green-600">70-140</span>
                </div>
                <div className="flex justify-between">
                  <span>Prediabetes:</span>
                  <span className="font-medium text-yellow-600">140-199</span>
                </div>
                <div className="flex justify-between">
                  <span>Diabetes:</span>
                  <span className="font-medium text-red-600">≥200</span>
                </div>
                <div className="flex justify-between">
                  <span>Rendah:</span>
                  <span className="font-medium text-blue-600">&lt;70</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                * Nilai untuk tes gula darah sewaktu (non-puasa)
              </p>
            </div>
          </div>
        </div>

        {/* Notes */}
        <div>
          <Textarea
            label="Catatan Tes"
            value={formData.catatan}
            onChange={(e) => handleInputChange('catatan', e.target.value)}
            error={!!errors.catatan}
            helperText={errors.catatan || `${formData.catatan.length}/500 karakter`}
            placeholder="Catatan tambahan tentang tes (kondisi pasien, waktu tes, dll.)"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Critical Value Warning */}
        {glucoseInfo && (glucoseInfo.category === 'Diabetes' || glucoseInfo.category === 'Rendah') && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">
                  Nilai Kritis Terdeteksi
                </h3>
                <p className="text-sm text-red-700 mt-1">
                  {glucoseInfo.category === 'Diabetes' 
                    ? 'Kadar gula darah menunjukkan indikasi diabetes. Pertimbangkan rujukan ke dokter untuk evaluasi lebih lanjut.'
                    : 'Kadar gula darah rendah dapat berbahaya. Pastikan pasien mendapat penanganan segera.'
                  }
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="sm:order-2"
          >
            {isSubmitting ? 'Menyimpan...' : (test ? 'Perbarui Tes' : 'Simpan Tes')}
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