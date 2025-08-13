'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { treatmentsApi } from '@/lib/api/treatments';
import { TreatmentData } from '@/types/treatment';
import { Patient } from '@/types/patient';

interface TreatmentFormProps {
  patient: Patient;
  assessmentId?: number;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface TreatmentFormData {
  nama_obat: string;
  dosis: string;
  frekuensi: string;
  durasi: string;
  instruksi: string;
}

export default function TreatmentForm({ 
  patient, 
  assessmentId, 
  onSuccess, 
  onCancel 
}: TreatmentFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm<TreatmentFormData>();

  const onSubmit = async (data: TreatmentFormData) => {
    setIsSubmitting(true);
    
    try {
      const treatmentData: TreatmentData = {
        id_pasien: patient.id,
        id_penilaian: assessmentId,
        nama_obat: data.nama_obat,
        dosis: data.dosis,
        frekuensi: data.frekuensi,
        durasi: data.durasi,
        instruksi: data.instruksi,
      };

      await treatmentsApi.createTreatment(treatmentData);
      
      toast.success('Resep obat berhasil dibuat');
      reset();
      onSuccess?.();
    } catch (error: unknown) {
      console.error('Error creating treatment:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal membuat resep obat';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Resep Obat
        </h3>
        <div className="text-sm text-gray-600">
          <p><strong>Pasien:</strong> {patient.nama}</p>
          <p><strong>NIK:</strong> {patient.nik}</p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nama Obat *
          </label>
          <Input
            {...register('nama_obat', { 
              required: 'Nama obat wajib diisi',
              minLength: { value: 2, message: 'Nama obat minimal 2 karakter' }
            })}
            placeholder="Masukkan nama obat"
            error={!!errors.nama_obat}
            helperText={errors.nama_obat?.message}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dosis *
            </label>
            <Input
              {...register('dosis', { 
                required: 'Dosis wajib diisi',
                minLength: { value: 1, message: 'Dosis minimal 1 karakter' }
              })}
              placeholder="Contoh: 500mg"
              error={!!errors.dosis}
              helperText={errors.dosis?.message}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Frekuensi *
            </label>
            <Input
              {...register('frekuensi', { 
                required: 'Frekuensi wajib diisi',
                minLength: { value: 1, message: 'Frekuensi minimal 1 karakter' }
              })}
              placeholder="Contoh: 3x sehari"
              error={!!errors.frekuensi}
              helperText={errors.frekuensi?.message}
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Durasi *
          </label>
          <Input
            {...register('durasi', { 
              required: 'Durasi wajib diisi',
              minLength: { value: 1, message: 'Durasi minimal 1 karakter' }
            })}
            placeholder="Contoh: 7 hari"
            error={!!errors.durasi}
            helperText={errors.durasi?.message}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Instruksi Penggunaan
          </label>
          <textarea
            {...register('instruksi')}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
            placeholder="Instruksi tambahan untuk penggunaan obat..."
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            type="submit"
            disabled={isSubmitting}
            className="flex-1"
          >
            {isSubmitting ? 'Menyimpan...' : 'Simpan Resep'}
          </Button>
          {onCancel && (
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={isSubmitting}
            >
              Batal
            </Button>
          )}
        </div>
      </form>
    </Card>
  );
}