'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input, Textarea } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { referralsApi } from '@/lib/api/referrals';
import { ReferralData } from '@/types/referral';
import { Patient } from '@/types/patient';

interface ReferralFormProps {
  patient: Patient;
  assessmentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface ReferralFormData {
  nama_fasilitas: string;
  alasan: string;
}

const COMMON_FACILITIES = [
  'Puskesmas Kecamatan',
  'RSUD Kabupaten',
  'RS Swasta Terdekat',
  'Klinik Spesialis',
  'Rumah Sakit Rujukan',
  'Puskesmas Rawat Inap'
];

export default function ReferralForm({ 
  patient, 
  assessmentId, 
  onSuccess, 
  onCancel 
}: ReferralFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  // selectedFacility state removed as it's not needed

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setValue,
    watch
  } = useForm<ReferralFormData>();

  const watchedFacility = watch('nama_fasilitas');

  const onSubmit = async (data: ReferralFormData) => {
    setIsSubmitting(true);
    
    try {
      const referralData: ReferralData = {
        id_pasien: patient.id,
        id_penilaian: assessmentId,
        nama_fasilitas: data.nama_fasilitas,
        alasan: data.alasan,
      };

      await referralsApi.createReferral(referralData);
      
      toast.success('Rujukan berhasil dibuat');
      reset();
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error creating referral:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { pesan?: string } } }).response?.data?.pesan || (error as Error).message
        : 'Gagal membuat rujukan';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFacilitySelect = (facility: string) => {
    setValue('nama_fasilitas', facility);
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Rujukan Pasien
        </h3>
        <div className="text-sm text-gray-600">
          <p><strong>Pasien:</strong> {patient.nama}</p>
          <p><strong>NIK:</strong> {patient.nik}</p>
          <p><strong>ID Pasien:</strong> {patient.id_pasien}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Facility Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Fasilitas Kesehatan Tujuan <span className="text-red-500">*</span>
          </label>
          
          {/* Quick Select Buttons */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {COMMON_FACILITIES.map((facility) => (
              <button
                key={facility}
                type="button"
                onClick={() => handleFacilitySelect(facility)}
                className={`p-2 text-xs border rounded-md transition-colors ${
                  watchedFacility === facility
                    ? 'bg-blue-50 border-blue-300 text-blue-700'
                    : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                }`}
              >
                {facility}
              </button>
            ))}
          </div>

          {/* Manual Input */}
          <Input
            {...register('nama_fasilitas', { 
              required: 'Nama fasilitas kesehatan wajib diisi',
              minLength: { value: 3, message: 'Nama fasilitas minimal 3 karakter' }
            })}
            placeholder="Atau ketik nama fasilitas kesehatan lainnya..."
            error={!!errors.nama_fasilitas}
            helperText={errors.nama_fasilitas?.message}
          />
        </div>

        {/* Reason for Referral */}
        <div>
          <Textarea
            label="Alasan Rujukan"
            {...register('alasan', { 
              required: 'Alasan rujukan wajib diisi',
              minLength: { value: 10, message: 'Alasan rujukan minimal 10 karakter' }
            })}
            placeholder="Jelaskan alasan rujukan berdasarkan hasil pemeriksaan dan penilaian kesehatan..."
            error={!!errors.alasan}
            helperText={errors.alasan?.message || 'Jelaskan kondisi pasien dan mengapa perlu dirujuk'}
            rows={4}
            maxLength={500}
            required
          />
          <div className="text-xs text-gray-500 mt-1">
            {watch('alasan')?.length || 0}/500 karakter
          </div>
        </div>

        {/* Critical Health Indicators Warning */}
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start">
            <svg className="w-5 h-5 text-yellow-600 mt-0.5 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h4 className="text-sm font-medium text-yellow-800">Perhatian</h4>
              <p className="text-sm text-yellow-700 mt-1">
                Pastikan rujukan dibuat berdasarkan indikator kesehatan yang memerlukan penanganan lebih lanjut. 
                Sertakan hasil pemeriksaan dan penilaian kesehatan yang mendukung keputusan rujukan.
              </p>
            </div>
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
            {isSubmitting ? 'Membuat Rujukan...' : 'Buat Rujukan'}
          </Button>
          
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              reset();
            }}
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