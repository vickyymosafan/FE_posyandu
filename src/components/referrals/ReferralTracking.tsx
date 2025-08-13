'use client';

import React, { useState } from 'react';
import { format } from 'date-fns';
import { id } from 'date-fns/locale';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Modal, ConfirmModal } from '@/components/ui/modal';
import { Loading } from '@/components/ui/loading';
import { referralsApi } from '@/lib/api/referrals';
import { ReferralWithDetails, ReferralStatus } from '@/types/referral';
import { Patient } from '@/types/patient';
import { toast } from 'react-hot-toast';
import useSWR from 'swr';

interface ReferralTrackingProps {
  patient: Patient;
  refreshTrigger?: number;
}

interface ReferralDetailModalProps {
  referral: ReferralWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onStatusUpdate?: () => void;
}

interface StatusUpdateModalProps {
  referral: ReferralWithDetails | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: number, status: ReferralStatus) => void;
  isUpdating: boolean;
}

const StatusUpdateModal: React.FC<StatusUpdateModalProps> = ({
  referral,
  isOpen,
  onClose,
  onUpdate,
  isUpdating
}) => {
  const [selectedStatus, setSelectedStatus] = useState<ReferralStatus>('menunggu');

  React.useEffect(() => {
    if (referral) {
      setSelectedStatus(referral.status);
    }
  }, [referral]);

  const handleUpdate = () => {
    if (referral) {
      onUpdate(referral.id, selectedStatus);
    }
  };

  if (!referral) return null;

  const statusOptions: { value: ReferralStatus; label: string; description: string; color: string }[] = [
    {
      value: 'menunggu',
      label: 'Menunggu',
      description: 'Rujukan sedang dalam proses atau menunggu tindak lanjut',
      color: 'text-yellow-700 bg-yellow-50 border-yellow-200'
    },
    {
      value: 'selesai',
      label: 'Selesai',
      description: 'Pasien telah mendapat penanganan di fasilitas rujukan',
      color: 'text-green-700 bg-green-50 border-green-200'
    },
    {
      value: 'dibatalkan',
      label: 'Dibatalkan',
      description: 'Rujukan dibatalkan karena alasan tertentu',
      color: 'text-red-700 bg-red-50 border-red-200'
    }
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Status Rujukan"
      size="md"
      closeOnOverlayClick={!isUpdating}
      closeOnEscape={!isUpdating}
    >
      <div className="space-y-4">
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-1">Rujukan ke:</h4>
          <p className="text-gray-700">{referral.nama_fasilitas}</p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Pilih Status Baru
          </label>
          <div className="space-y-3">
            {statusOptions.map((option) => (
              <label
                key={option.value}
                className={`flex items-start p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedStatus === option.value
                    ? option.color
                    : 'border-gray-200 hover:bg-gray-50'
                }`}
              >
                <input
                  type="radio"
                  name="status"
                  value={option.value}
                  checked={selectedStatus === option.value}
                  onChange={(e) => setSelectedStatus(e.target.value as ReferralStatus)}
                  className="mt-1 mr-3"
                  disabled={isUpdating}
                />
                <div>
                  <div className="font-medium">{option.label}</div>
                  <div className="text-sm opacity-75">{option.description}</div>
                </div>
              </label>
            ))}
          </div>
        </div>

        <div className="flex justify-end space-x-2 pt-4 border-t">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isUpdating}
          >
            Batal
          </Button>
          <Button
            onClick={handleUpdate}
            loading={isUpdating}
            disabled={isUpdating || selectedStatus === referral.status}
          >
            Update Status
          </Button>
        </div>
      </div>
    </Modal>
  );
};

const ReferralDetailModal: React.FC<ReferralDetailModalProps> = ({
  referral,
  isOpen,
  onClose,
  onStatusUpdate
}) => {
  if (!referral) return null;

  const getStatusBadge = (status: ReferralStatus) => {
    const statusConfig = {
      menunggu: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
      selesai: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
      dibatalkan: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Detail Rujukan"
      size="md"
    >
      <div className="space-y-4">
        {/* Patient Info */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium text-gray-900 mb-2">Informasi Pasien</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Nama:</span>
              <p className="font-medium">{referral.nama_pasien}</p>
            </div>
            <div>
              <span className="text-gray-600">Tanggal Rujukan:</span>
              <p className="font-medium">
                {format(new Date(referral.tanggal_rujukan), 'dd MMMM yyyy, HH:mm', { locale: id })}
              </p>
            </div>
          </div>
        </div>

        {/* Referral Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Fasilitas Kesehatan Tujuan
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded font-medium">
              {referral.nama_fasilitas}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status Rujukan
            </label>
            <div className="bg-gray-50 p-3 rounded">
              {getStatusBadge(referral.status)}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Alasan Rujukan
            </label>
            <p className="text-gray-900 bg-gray-50 p-3 rounded whitespace-pre-wrap">
              {referral.alasan}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Dirujuk Oleh
            </label>
            <p className="text-gray-900 bg-gray-50 p-2 rounded">
              {referral.admin_nama}
            </p>
          </div>

          {referral.kategori_penilaian && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Berdasarkan Penilaian
              </label>
              <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                referral.kategori_penilaian === 'normal' 
                  ? 'bg-green-100 text-green-800'
                  : referral.kategori_penilaian === 'perlu_perhatian'
                  ? 'bg-yellow-100 text-yellow-800'
                  : 'bg-red-100 text-red-800'
              }`}>
                {referral.kategori_penilaian === 'normal' && 'Normal'}
                {referral.kategori_penilaian === 'perlu_perhatian' && 'Perlu Perhatian'}
                {referral.kategori_penilaian === 'rujukan' && 'Rujukan'}
              </span>
            </div>
          )}
        </div>

        {onStatusUpdate && (
          <div className="pt-4 border-t">
            <Button onClick={onStatusUpdate} variant="outline" className="w-full">
              Update Status Rujukan
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default function ReferralTracking({ patient, refreshTrigger }: ReferralTrackingProps) {
  const [selectedReferral, setSelectedReferral] = useState<ReferralWithDetails | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; referral: ReferralWithDetails | null }>({
    isOpen: false,
    referral: null
  });
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  const { 
    data: referrals, 
    error, 
    isLoading, 
    mutate 
  } = useSWR(
    `referrals-patient-${patient.id}-${refreshTrigger || 0}`,
    () => referralsApi.getReferralsByPatient(patient.id),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
    }
  );

  const handleViewDetail = (referral: ReferralWithDetails) => {
    setSelectedReferral(referral);
    setIsDetailModalOpen(true);
  };

  const handleStatusUpdate = () => {
    setIsDetailModalOpen(false);
    setIsStatusModalOpen(true);
  };

  const handleUpdateStatus = async (id: number, status: ReferralStatus) => {
    setIsUpdatingStatus(true);
    try {
      await referralsApi.updateReferralStatus(id, status);
      toast.success('Status rujukan berhasil diperbarui');
      mutate(); // Refresh data
      setIsStatusModalOpen(false);
      setSelectedReferral(null);
    } catch (error: unknown) {
      console.error('Error updating referral status:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { pesan?: string } } }).response?.data?.pesan || (error as Error).message
        : 'Gagal memperbarui status rujukan';
      toast.error(errorMessage);
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  const handleDeleteClick = (referral: ReferralWithDetails) => {
    setDeleteConfirm({ isOpen: true, referral });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.referral) return;

    setIsDeleting(true);
    try {
      await referralsApi.deleteReferral(deleteConfirm.referral.id);
      toast.success('Rujukan berhasil dihapus');
      mutate(); // Refresh data
      setDeleteConfirm({ isOpen: false, referral: null });
    } catch (error: unknown) {
      console.error('Error deleting referral:', error);
      const errorMessage = error instanceof Error && 'response' in error 
        ? (error as { response?: { data?: { pesan?: string } } }).response?.data?.pesan || (error as Error).message
        : 'Gagal menghapus rujukan';
      toast.error(errorMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  const getStatusBadge = (status: ReferralStatus) => {
    const statusConfig = {
      menunggu: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
      selesai: { label: 'Selesai', color: 'bg-green-100 text-green-800' },
      dibatalkan: { label: 'Dibatalkan', color: 'bg-red-100 text-red-800' }
    };

    const config = statusConfig[status];
    return (
      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.label}
      </span>
    );
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
          <p className="text-gray-600 mb-4">Terjadi kesalahan saat memuat data rujukan</p>
          <Button onClick={() => mutate()} variant="outline">
            Coba Lagi
          </Button>
        </div>
      </Card>
    );
  }

  if (!referrals || referrals.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-1">Belum Ada Rujukan</h3>
          <p className="text-gray-600">
            Pasien {patient.nama} belum memiliki riwayat rujukan
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
            Tracking Rujukan
          </h3>
          <p className="text-sm text-gray-600">
            Total {referrals.length} rujukan untuk {patient.nama}
          </p>
        </div>

        <div className="space-y-4">
          {referrals.map((referral) => (
            <div
              key={referral.id}
              className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-medium text-gray-900">
                      {referral.nama_fasilitas}
                    </h4>
                    {getStatusBadge(referral.status)}
                    {referral.kategori_penilaian && (
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        referral.kategori_penilaian === 'normal' 
                          ? 'bg-green-100 text-green-800'
                          : referral.kategori_penilaian === 'perlu_perhatian'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {referral.kategori_penilaian === 'normal' && 'Normal'}
                        {referral.kategori_penilaian === 'perlu_perhatian' && 'Perlu Perhatian'}
                        {referral.kategori_penilaian === 'rujukan' && 'Rujukan'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-700 mb-3 bg-gray-50 p-2 rounded">
                    <span className="font-medium">Alasan:</span> {referral.alasan}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>
                      Dirujuk oleh: <span className="font-medium">{referral.admin_nama}</span>
                    </span>
                    <span>
                      {format(new Date(referral.tanggal_rujukan), 'dd MMM yyyy, HH:mm', { locale: id })}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleViewDetail(referral)}
                  >
                    Detail
                  </Button>
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={() => handleDeleteClick(referral)}
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
      <ReferralDetailModal
        referral={selectedReferral}
        isOpen={isDetailModalOpen}
        onClose={() => {
          setIsDetailModalOpen(false);
          setSelectedReferral(null);
        }}
        onStatusUpdate={handleStatusUpdate}
      />

      {/* Status Update Modal */}
      <StatusUpdateModal
        referral={selectedReferral}
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setSelectedReferral(null);
        }}
        onUpdate={handleUpdateStatus}
        isUpdating={isUpdatingStatus}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, referral: null })}
        onConfirm={handleDeleteConfirm}
        title="Hapus Rujukan"
        message={`Apakah Anda yakin ingin menghapus rujukan ke "${deleteConfirm.referral?.nama_fasilitas}" ini? Tindakan ini tidak dapat dibatalkan.`}
        confirmText="Hapus"
        cancelText="Batal"
        variant="destructive"
        loading={isDeleting}
      />
    </>
  );
}