'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Loading } from '@/components/ui/loading';
import { treatmentsApi } from '@/lib/api/treatments';
import { TreatmentWithDetails } from '@/types/treatment';
import { Patient } from '@/types/patient';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

interface TreatmentHistoryProps {
  patient: Patient;
  refreshTrigger?: number;
}

interface TreatmentDetailModalProps {
  treatment: TreatmentWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
}

const TreatmentDetailModal: React.FC<TreatmentDetailModalProps> = ({
  treatment,
  isOpen,
  onClose
}) => {
  if (!treatment) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Resep Obat"
      size="md"
    >
      <div className="space-y-4">
        {/* Patient Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informasi Pasien</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nama:</span>
              <p className="font-medium">{treatment.nama_pasien}</p>
            </div>
            <div>
              <span className="text-gray-600">Tanggal Resep:</span>
              <p className="font-medium">
                {format(new Date(treatment.tanggal_resep), 'dd MMMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>
          </div>
        </div>

        {/* Treatment Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nama Obat
            </label>
            <p className="text-gray-900 bg-gray-50 p-2 rounded">
              {treatment.nama_obat || '-'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dosis
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {treatment.dosis || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Frekuensi
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {treatment.frekuensi || '-'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Durasi
              </label>
              <p className="text-gray-900 bg-gray-50 p-2 rounded">
                {treatment.durasi || '-'}
              </p>
            </div>
          </div>

          {treatment.instruksi && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Instruksi Penggunaan
              </label>
              <p className="text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">
                {treatment.instruksi}
              </p>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Diresepkan Oleh
            </label>
            <p className="text-gray-900 bg-gray-50 p-2 rounded">
              {treatment.admin_nama}
            </p>
          </div>

          {treatment.kategori_penilaian && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berdasarkan Penilaian
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                treatment.kategori_penilaian === 'normal' 
                  ? 'bg-green-100 text-green-800'
                  : treatment.kategori_penilaian === 'perlu_perhatian'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {treatment.kategori_penilaian === 'normal' && 'Normal'}
                {treatment.kategori_penilaian === 'perlu_perhatian' && 'Perlu Perhatian'}
                {treatment.kategori_penilaian === 'rujukan' && 'Rujukan'}
              </span>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};

export default function TreatmentHistory({ patient, refreshTrigger }: TreatmentHistoryProps) {
  const [selectedTreatment, setSelectedTreatment] = useState<TreatmentWithDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; treatment: TreatmentWithDetails | null }>({
    isOpen: false,
    treatment: null
  });
  const [isDeleting, setIsDeleting] = useState(false);

  const { 
    data: treatments, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(
    `treatments-patient-${patient.id}-${refreshTrigger || 0}`,
    () => treatmentsApi.getTreatmentsByPatient(patient.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const handleViewDetail = (treatment: TreatmentWithDetails) => {
    setSelectedTreatment(treatment);
    setIsDetailModalOpen(true);
  };

  const handleDeleteClick = (treatment: TreatmentWithDetails) => {
    setDeleteConfirm({ isOpen: true, treatment });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.treatment) return;

    setIsDeleting(true);
    try {
      await treatmentsApi.deleteTreatment(deleteConfirm.treatment.id);
      toast.success('Resep obat berhasil dihapus');
      mutate(); // Refresh data
      setDeleteConfirm({ isOpen: false, treatment: null });
    } catch (error: unknown) {
      console.error('Error deleting treatment:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { pesan?: string } } }).response?.data?.pesan || (error as Error).message
        : 'Gagal menghapus resep obat';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
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

  if (error) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-red-600 mb-2">
            <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Gagal Memuat Data</h3>
          <p className="text-gray-600 mb-4">Terjadi kesalahan saat memuat riwayat pengobatan</p>
          <Button onClick={() => mutate()} variant="outline">
            Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  if (!treatments || treatments.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Riwayat Pengobatan</h3>
          <p className="text-gray-600">
            Pasien {patient.nama} belum memiliki riwayat resep obat
          </p>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Riwayat Pengobatan
          </h3>
          <p className="text-sm text-gray-600">
            Total {treatments.length} resep obat untuk {patient.nama}
          </p>
        </div>

        <div className="space-y-4">
          {treatments.map((treatment) => (
            <div
              key={treatment.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {treatment.nama_obat || 'Obat tidak disebutkan'}
                    </h4>
                    {treatment.kategori_penilaian && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        treatment.kategori_penilaian === 'normal' 
                          ? 'bg-green-100 text-green-800'
                          : treatment.kategori_penilaian === 'perlu_perhatian'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {treatment.kategori_penilaian === 'normal' && 'Normal'}
                        {treatment.kategori_penilaian === 'perlu_perhatian' && 'Perlu Perhatian'}
                        {treatment.kategori_penilaian === 'rujukan' && 'Rujukan'}
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                    <div>
                      <span className="font-medium">Dosis:</span> {treatment.dosis || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Frekuensi:</span> {treatment.frekuensi || '-'}
                    </div>
                    <div>
                      <span className="font-medium">Durasi:</span> {treatment.durasi || '-'}
                    </div>
                  </div>

                  {treatment.instruksi && (
                    <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                      <span className="font-medium">Instruksi:</span> {treatment.instruksi}
                    </p>
                  )}

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Diresepkan oleh: <span className="font-medium">{treatment.admin_nama}</span>
                    </span>
                    <span>
                      {format(new Date(treatment.tanggal_resep), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetail(treatment)}
                  >
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(treatment)}
                  >
                    Hapus
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Detail Modal */}
      <TreatmentDetailModal
        treatment={selectedTreatment}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedTreatment(null);
        }}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, treatment: null })}
        onConfirm={handleDeleteConfirm}
        title="Hapus Resep Obat"
        message={`Apakah Anda yakin ingin menghapus resep obat "${deleteConfirm.treatment?.nama_obat}" ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}