'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { toast } from 'react-hot-toast';
import { patientsApi } from '@/lib/api/patients';
import { PatientRegistrationData } from '@/types/patient';
import { 
  validateRequired, 
  validateNIK, 
  validateKK, 
  validateBirthDate, 
  validatePhoneNumber 
} from '@/lib/validations';
import { SUCCESS_MESSAGES } from '@/lib/constants';

interface PatientRegistrationFormProps {
  onSuccess?: (patient: any) => void;
  onCancel?: () => void;
}

interface FormData {
  nama: string;
  nik: string;
  nomor_kk: string;
  tanggal_lahir: string;
  nomor_hp: string;
  alamat: string;
}

interface FormErrors {
  nama?: string;
  nik?: string;
  nomor_kk?: string;
  tanggal_lahir?: string;
  nomor_hp?: string;
  alamat?: string;
}

export default function PatientRegistrationForm({ 
  onSuccess, 
  onCancel 
}: PatientRegistrationFormProps) {
  const [formData, setFormData] = useState<FormData>({
    nama: '',
    nik: '',
    nomor_kk: '',
    tanggal_lahir: '',
    nomor_hp: '',
    alamat: '',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCheckingNIK, setIsCheckingNIK] = useState(false);

  // Real-time NIK validation
  const checkNIKDuplication = async (nik: string) => {
    if (!nik || nik.length !== 16) return;
    
    setIsCheckingNIK(true);
    try {
      // Search for existing patient with this NIK
      const response = await patientsApi.getPatients({ query: nik, limit: 1 });
      const existingPatient = response.data.pasien.find(p => p.nik === nik);
      
      if (existingPatient) {
        setErrors(prev => ({
          ...prev,
          nik: 'NIK sudah terdaftar dalam sistem'
        }));
      } else {
        setErrors(prev => ({
          ...prev,
          nik: undefined
        }));
      }
    } catch (error) {
      console.error('Error checking NIK:', error);
    } finally {
      setIsCheckingNIK(false);
    }
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }

    // Real-time NIK validation
    if (field === 'nik' && value.length === 16) {
      checkNIKDuplication(value);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Validate required fields
    const namaValidation = validateRequired(formData.nama, 'Nama');
    if (!namaValidation.isValid) newErrors.nama = namaValidation.error;

    const nikValidation = validateNIK(formData.nik);
    if (!nikValidation.isValid) newErrors.nik = nikValidation.error;

    const kkValidation = validateKK(formData.nomor_kk);
    if (!kkValidation.isValid) newErrors.nomor_kk = kkValidation.error;

    const birthDateValidation = validateBirthDate(formData.tanggal_lahir);
    if (!birthDateValidation.isValid) newErrors.tanggal_lahir = birthDateValidation.error;

    // Validate optional phone number
    if (formData.nomor_hp) {
      const phoneValidation = validatePhoneNumber(formData.nomor_hp);
      if (!phoneValidation.isValid) newErrors.nomor_hp = phoneValidation.error;
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
      const registrationData: PatientRegistrationData = {
        nama: formData.nama.trim(),
        nik: formData.nik.trim(),
        nomor_kk: formData.nomor_kk.trim(),
        tanggal_lahir: formData.tanggal_lahir,
        nomor_hp: formData.nomor_hp.trim() || undefined,
        alamat: formData.alamat.trim() || undefined,
      };

      const newPatient = await patientsApi.createPatient(registrationData);
      
      toast.success(SUCCESS_MESSAGES.PATIENT_CREATED);
      
      // Reset form
      setFormData({
        nama: '',
        nik: '',
        nomor_kk: '',
        tanggal_lahir: '',
        nomor_hp: '',
        alamat: '',
      });
      setErrors({});
      
      if (onSuccess) {
        onSuccess(newPatient);
      }
    } catch (error: any) {
      console.error('Error creating patient:', error);
      
      if (error.response?.status === 409) {
        toast.error('NIK sudah terdaftar dalam sistem');
        setErrors(prev => ({ ...prev, nik: 'NIK sudah terdaftar dalam sistem' }));
      } else {
        toast.error(error.response?.data?.pesan || 'Gagal mendaftarkan pasien');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      nik: '',
      nomor_kk: '',
      tanggal_lahir: '',
      nomor_hp: '',
      alamat: '',
    });
    setErrors({});
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h2 className="text-xl font-semibold text-gray-900">Pendaftaran Pasien Baru</h2>
        <p className="text-sm text-gray-600 mt-1">
          Lengkapi data pasien untuk mendaftarkan ke sistem posyandu
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Nama Lengkap */}
          <div className="md:col-span-2">
            <Input
              label="Nama Lengkap *"
              type="text"
              value={formData.nama}
              onChange={(e) => handleInputChange('nama', e.target.value)}
              error={!!errors.nama}
              helperText={errors.nama}
              placeholder="Masukkan nama lengkap pasien"
              maxLength={100}
            />
          </div>

          {/* NIK */}
          <div>
            <Input
              label="NIK (Nomor Induk Kependudukan) *"
              type="text"
              value={formData.nik}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                handleInputChange('nik', value);
              }}
              error={!!errors.nik}
              helperText={errors.nik || 'NIK harus 16 digit'}
              placeholder="1234567890123456"
              maxLength={16}
              rightIcon={isCheckingNIK ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
              ) : null}
            />
          </div>

          {/* Nomor KK */}
          <div>
            <Input
              label="Nomor Kartu Keluarga *"
              type="text"
              value={formData.nomor_kk}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                handleInputChange('nomor_kk', value);
              }}
              error={!!errors.nomor_kk}
              helperText={errors.nomor_kk || 'Nomor KK harus 16 digit'}
              placeholder="1234567890123456"
              maxLength={16}
            />
          </div>

          {/* Tanggal Lahir */}
          <div>
            <Input
              label="Tanggal Lahir *"
              type="date"
              value={formData.tanggal_lahir}
              onChange={(e) => handleInputChange('tanggal_lahir', e.target.value)}
              error={!!errors.tanggal_lahir}
              helperText={errors.tanggal_lahir}
              max={new Date().toISOString().split('T')[0]}
            />
          </div>

          {/* Nomor HP */}
          <div>
            <Input
              label="Nomor HP"
              type="text"
              value={formData.nomor_hp}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '').slice(0, 15);
                handleInputChange('nomor_hp', value);
              }}
              error={!!errors.nomor_hp}
              helperText={errors.nomor_hp || 'Opsional, 10-15 digit'}
              placeholder="081234567890"
              maxLength={15}
            />
          </div>

          {/* Alamat */}
          <div className="md:col-span-2">
            <Input
              label="Alamat"
              type="text"
              value={formData.alamat}
              onChange={(e) => handleInputChange('alamat', e.target.value)}
              error={!!errors.alamat}
              helperText={errors.alamat}
              placeholder="Masukkan alamat lengkap (opsional)"
              maxLength={255}
            />
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
          <Button
            type="submit"
            loading={isSubmitting}
            disabled={isSubmitting || isCheckingNIK}
            className="sm:order-2"
          >
            {isSubmitting ? 'Mendaftarkan...' : 'Daftarkan Pasien'}
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