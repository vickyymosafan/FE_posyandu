'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { examinationsApi } from '@/lib/api/examinations';
import { PhysicalExaminationData, PhysicalExamination } from '@/types/examination';
import { Patient } from '@/types/patient';

interface PhysicalExamFormProps {
  patient: Patient;
  examination?: PhysicalExamination;
  onSuccess?: (examination: PhysicalExamination) => void;
  onCancel?: () => void;
}

interface FormData {
  tinggi_badan: string;
  berat_badan: string;
  lingkar_perut: string;
  tekanan_darah_sistolik: string;
  tekanan_darah_diastolik: string;
  catatan: string;
}

interface FormErrors {
  tinggi_badan?: string;
  berat_badan?: string;
  lingkar_perut?: string;
  tekanan_darah_sistolik?: string;
  tekanan_darah_diastolik?: string;
  catatan?: string;
}

// Validation ranges for physical measurements
const VALIDATION_RANGES = {
  tinggi_badan: { min: 100, max: 250, unit: 'cm' },
  berat_badan: { min: 20, max: 200, unit: 'kg' },
  lingkar_perut: { min: 50, max: 200, unit: 'cm' },
  tekanan_darah_sistolik: { min: 70, max: 250, unit: 'mmHg' },
  tekanan_darah_diastolik: { min: 40, max: 150, unit: 'mmHg' }
};

export default function PhysicalExamForm({ 
  patient, 
  examination, 
  onSuccess, 
  onCancel 
}: PhysicalExamFormProps) {
  const [formData, setFormData] = useState<FormData>({
    tinggi_badan: '',
    berat_badan: '',
    lingkar_perut: '',
    tekanan_darah_sistolik: '',
    tekanan_darah_diastolik: '',
    catatan: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Populate form if editing existing examination
  useEffect(() => {
    if (examination) {
      setFormData({
        tinggi_badan: examination.tinggi_badan?.toString() || '',
        berat_badan: examination.berat_badan?.toString() || '',
        lingkar_perut: examination.lingkar_perut?.toString() || '',
        tekanan_darah_sistolik: examination.tekanan_darah_sistolik?.toString() || '',
        tekanan_darah_diastolik: examination.tekanan_darah_diastolik?.toString() || '',
        catatan: examination.catatan || '',
      });
    }
  }, [examination]);

  const validateMeasurement = (field: keyof typeof VALIDATION_RANGES, value: string): string | undefined => {
    if (!value) return undefined; // Optional fields
    
    const numValue = parseFloat(value);
    const range = VALIDATION_RANGES[field];
    
    if (isNaN(numValue)) {
      return `${field.replace('_', ' ')} harus berupa angka`;
    }
    
    if (numValue < range.min || numValue > range.max) {
      return `${field.replace('_', ' ')} harus antara ${range.min}-${range.max} ${range.unit}`;
    }
    
    return undefined;
  };

  const validateBloodPressure = (): string | undefined => {
    const sistolik = parseFloat(formData.tekanan_darah_sistolik);
    const diastolik = parseFloat(formData.tekanan_darah_diastolik);
    
    if (!isNaN(sistolik) && !isNaN(diastolik) && sistolik <= diastolik) {
      return 'Tekanan darah sistolik harus lebih tinggi dari diastolik';
    }
    
    return undefined;
  };

  const calculateBMI = (): number | null => {
    const tinggi = parseFloat(formData.tinggi_badan);
    const berat = parseFloat(formData.berat_badan);
    
    if (!isNaN(tinggi) && !isNaN(berat) && tinggi > 0) {
      const tinggiMeter = tinggi / 100;
      return berat / (tinggiMeter * tinggiMeter);
    }
    
    return null;
  };

  const getBMICategory = (bmi: number): string => {
    if (bmi < 18.5) return 'Kurus';
    if (bmi < 25) return 'Normal';
    if (bmi < 30) return 'Gemuk';
    return 'Obesitas';
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Real-time validation for measurements
    if (field in VALIDATION_RANGES) {
      const error = validateMeasurement(field as keyof typeof VALIDATION_RANGES, value);
      if (error) {
        setErrors(prev => ({ ...prev, [field]: error }));
      }
    }

    // Real-time blood pressure validation
    if (field === 'tekanan_darah_sistolik' || field === 'tekanan_darah_diastolik') {
      setTimeout(() => {
        const bpError = validateBloodPressure();
        if (bpError) {
          setErrors(prev => ({ ...prev, tekanan_darah_sistolik: bpError }));
        } else {
          setErrors(prev => ({ 
            ...prev, 
            tekanan_darah_sistolik: prev.tekanan_darah_sistolik === validateBloodPressure() ? undefined : prev.tekanan_darah_sistolik 
          }));
        }
      }, 100);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate measurements
    Object.keys(VALIDATION_RANGES).forEach(field => {
      const error = validateMeasurement(field as keyof typeof VALIDATION_RANGES, formData[field as keyof FormData]);
      if (error) {
        newErrors[field as keyof FormErrors] = error;
      }
    });

    // Validate blood pressure relationship
    const bpError = validateBloodPressure();
    if (bpError) {
      newErrors.tekanan_darah_sistolik = bpError;
    }

    // Check if at least one measurement is provided
    const hasMeasurement = Object.keys(VALIDATION_RANGES).some(field => 
      formData[field as keyof FormData].trim() !== ''
    );
    
    if (!hasMeasurement) {
      toast.error('Minimal satu pengukuran harus diisi');
      return false;
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
      const examData: PhysicalExaminationData = {
        id_pasien: patient.id,
        tinggi_badan: formData.tinggi_badan ? parseFloat(formData.tinggi_badan) : undefined,
        berat_badan: formData.berat_badan ? parseFloat(formData.berat_badan) : undefined,
        lingkar_perut: formData.lingkar_perut ? parseFloat(formData.lingkar_perut) : undefined,
        tekanan_darah_sistolik: formData.tekanan_darah_sistolik ? parseInt(formData.tekanan_darah_sistolik) : undefined,
        tekanan_darah_diastolik: formData.tekanan_darah_diastolik ? parseInt(formData.tekanan_darah_diastolik) : undefined,
        catatan: formData.catatan.trim() || undefined,
      };

      let result: PhysicalExamination;
      
      if (examination) {
        result = await examinationsApi.updatePhysicalExamination(examination.id, examData);
        toast.success('Pemeriksaan fisik berhasil diperbarui');
      } else {
        result = await examinationsApi.createPhysicalExamination(examData);
        toast.success('Pemeriksaan fisik berhasil disimpan');
      }
      
      if (onSuccess) {
        onSuccess(result);
      }
    } catch (error: any) {
      console.error('Error saving examination:', error);
      toast.error(error.response?.data?.pesan || 'Gagal menyimpan pemeriksaan fisik');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      tinggi_badan: '',
      berat_badan: '',
      lingkar_perut: '',
      tekanan_darah_sistolik: '',
      tekanan_darah_diastolik: '',
      catatan: '',
    });
    setErrors({});
  };

  const bmi = calculateBMI();

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">
          {examination ? 'Edit Pemeriksaan Fisik' : 'Pemeriksaan Fisik Baru'}
        </h2>
        <p className="text-sm text-gray-600 mt-1">
          Pasien: <span className="font-medium">{patient.nama}</span> (ID: {patient.id_pasien})
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Anthropometric Measurements */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Pengukuran Antropometri</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              label="Tinggi Badan (cm)"
              type="number"
              value={formData.tinggi_badan}
              onChange={(e) => handleInputChange('tinggi_badan', e.target.value)}
              error={!!errors.tinggi_badan}
              helperText={errors.tinggi_badan || 'Rentang normal: 100-250 cm'}
              placeholder="170"
              min="100"
              max="250"
              step="0.1"
            />

            <Input
              label="Berat Badan (kg)"
              type="number"
              value={formData.berat_badan}
              onChange={(e) => handleInputChange('berat_badan', e.target.value)}
              error={!!errors.berat_badan}
              helperText={errors.berat_badan || 'Rentang normal: 20-200 kg'}
              placeholder="65"
              min="20"
              max="200"
              step="0.1"
            />

            <Input
              label="Lingkar Perut (cm)"
              type="number"
              value={formData.lingkar_perut}
              onChange={(e) => handleInputChange('lingkar_perut', e.target.value)}
              error={!!errors.lingkar_perut}
              helperText={errors.lingkar_perut || 'Rentang normal: 50-200 cm'}
              placeholder="90"
              min="50"
              max="200"
              step="0.1"
            />
          </div>

          {/* BMI Display */}
          {bmi && (
            <div className="mt-4 p-3 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-800">
                <span className="font-medium">BMI:</span> {bmi.toFixed(1)} kg/m² 
                <span className="ml-2 px-2 py-1 bg-blue-100 rounded text-xs">
                  {getBMICategory(bmi)}
                </span>
              </p>
            </div>
          )}
        </div>

        {/* Vital Signs */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Tanda Vital</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              label="Tekanan Darah Sistolik (mmHg)"
              type="number"
              value={formData.tekanan_darah_sistolik}
              onChange={(e) => handleInputChange('tekanan_darah_sistolik', e.target.value)}
              error={!!errors.tekanan_darah_sistolik}
              helperText={errors.tekanan_darah_sistolik || 'Rentang normal: 70-250 mmHg'}
              placeholder="120"
              min="70"
              max="250"
            />

            <Input
              label="Tekanan Darah Diastolik (mmHg)"
              type="number"
              value={formData.tekanan_darah_diastolik}
              onChange={(e) => handleInputChange('tekanan_darah_diastolik', e.target.value)}
              error={!!errors.tekanan_darah_diastolik}
              helperText={errors.tekanan_darah_diastolik || 'Rentang normal: 40-150 mmHg'}
              placeholder="80"
              min="40"
              max="150"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <Textarea
            label="Catatan Pemeriksaan"
            value={formData.catatan}
            onChange={(e) => handleInputChange('catatan', e.target.value)}
            error={!!errors.catatan}
            helperText={errors.catatan}
            placeholder="Catatan tambahan tentang pemeriksaan (opsional)"
            rows={3}
            maxLength={500}
          />
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting}
            className="sm:order-2"
          >
            {isSubmitting ? 'Menyimpan...' : (examination ? 'Perbarui Pemeriksaan' : 'Simpan Pemeriksaan')}
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