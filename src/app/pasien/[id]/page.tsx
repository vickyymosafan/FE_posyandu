'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import PatientBarcode from '@/components/patients/PatientBarcode';
import PatientActivityFeed from '@/components/patients/PatientActivityFeed';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@/types/patient';
import { RecentActivity } from '@/types/dashboard';
import { ROUTES, SUCCESS_MESSAGES } from '@/lib/constants';
import { formatRelativeTime, formatDate, calculateAge } from '@/lib/utils';
import { toast } from 'react-hot-toast';

export default function PatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const patientId = parseInt(params.id as string);

  const [patient, setPatient] = useState<Patient | null>(null);
  const [activities, setActivities] = useState<RecentActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingActivities, setIsLoadingActivities] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (patientId) {
      loadPatient();
      loadPatientActivities();
    }
  }, [patientId]);

  const loadPatient = async () => {
    try {
      setIsLoading(true);
      const patientData = await patientsApi.getPatient(patientId);
      setPatient(patientData);
    } catch (error: any) {
      console.error('Error loading patient:', error);
      if (error.response?.status === 404) {
        toast.error('Pasien tidak ditemukan');
        router.push(ROUTES.PATIENTS);
      } else {
        toast.error('Gagal memuat data pasien');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loadPatientActivities = async () => {
    try {
      setIsLoadingActivities(true);
      const activitiesData = await patientsApi.getPatientActivities(patientId, 10);
      setActivities(activitiesData);
    } catch (error: any) {
      console.error('Error loading patient activities:', error);
      toast.error('Gagal memuat aktivitas pasien');
    } finally {
      setIsLoadingActivities(false);
    }
  };



  const handleDeletePatient = async () => {
    if (!patient) return;
    
    try {
      setIsDeleting(true);
      await patientsApi.deletePatient(patient.id);
      toast.success(SUCCESS_MESSAGES.PATIENT_DELETED);
      router.push(ROUTES.PATIENTS);
    } catch (error) {
      console.error('Error deleting patient:', error);
      toast.error('Gagal menghapus pasien');
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
    }
  };



  if (isLoading) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="flex items-center justify-center py-12">
            <Loading size="lg" />
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  if (!patient) {
    return (
      <AuthGuard>
        <MainLayout>
          <div className="text-center py-12">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Pasien Tidak Ditemukan</h1>
            <Button onClick={() => router.push(ROUTES.PATIENTS)}>
              Kembali ke Daftar Pasien
            </Button>
          </div>
        </MainLayout>
      </AuthGuard>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button
                variant="outline"
                onClick={() => router.push(ROUTES.PATIENTS)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                }
              >
                Kembali
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{patient.nama}</h1>
                <p className="text-gray-600">ID Pasien: {patient.id_pasien}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={() => setShowDeleteConfirm(true)}
                leftIcon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                }
              >
                Hapus Pasien
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient Information */}
            <div className="lg:col-span-2 space-y-6">
              {/* Basic Information */}
              <Card className="p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Informasi Dasar</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nama Lengkap
                    </label>
                    <p className="text-gray-900">{patient.nama}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      NIK
                    </label>
                    <p className="text-gray-900 font-mono">{patient.nik}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Nomor KK
                    </label>
                    <p className="text-gray-900 font-mono">{patient.nomor_kk}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Tanggal Lahir
                    </label>
                    <p className="text-gray-900">
                      {formatDate(patient.tanggal_lahir)} ({calculateAge(patient.tanggal_lahir)} tahun)
                    </p>
                  </div>
                  {patient.nomor_hp && (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nomor HP
                      </label>
                      <p className="text-gray-900">{patient.nomor_hp}</p>
                    </div>
                  )}
                  {patient.alamat && (
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Alamat
                      </label>
                      <p className="text-gray-900">{patient.alamat}</p>
                    </div>
                  )}
                </div>
              </Card>

              {/* Recent Activities */}
              <Card className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-900">Aktivitas Terbaru</h2>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadPatientActivities}
                    disabled={isLoadingActivities}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    }
                  >
                    {isLoadingActivities ? 'Memuat...' : 'Segarkan'}
                  </Button>
                </div>
                <PatientActivityFeed
                  activities={activities}
                  loading={isLoadingActivities}
                  onRefresh={loadPatientActivities}
                />
              </Card>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Tindakan Cepat</h3>
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(ROUTES.EXAMINATIONS)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                      </svg>
                    }
                  >
                    Pemeriksaan Fisik
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(ROUTES.TESTS)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    }
                  >
                    Tes Lanjutan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(ROUTES.ASSESSMENTS)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    }
                  >
                    Penilaian Kesehatan
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full justify-start"
                    onClick={() => router.push(ROUTES.TREATMENTS)}
                    leftIcon={
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                      </svg>
                    }
                  >
                    Pengobatan
                  </Button>
                </div>
              </Card>

              {/* Barcode Section */}
              <PatientBarcode patient={patient} />

              {/* Patient Stats */}
              <Card className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Statistik Pasien</h3>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Terdaftar</span>
                    <span className="font-medium">{formatDate(patient.dibuat_pada)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Total Aktivitas</span>
                    <span className="font-medium">{activities.length} kali</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Kunjungan Terakhir</span>
                    <span className="font-medium text-gray-400">
                      {activities.length > 0 
                        ? formatRelativeTime(new Date(activities[0].waktu))
                        : 'Belum ada'
                      }
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Delete Confirmation Modal */}
        <Modal
          isOpen={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          title="Konfirmasi Hapus Pasien"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-4 bg-red-50 rounded-lg">
              <svg className="w-6 h-6 text-red-600 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              <div>
                <h4 className="font-medium text-red-900">Peringatan!</h4>
                <p className="text-sm text-red-700 mt-1">
                  Tindakan ini tidak dapat dibatalkan. Semua data terkait pasien akan dihapus.
                </p>
              </div>
            </div>
            
            <p className="text-gray-700">
              Apakah Anda yakin ingin menghapus pasien <strong>{patient.nama}</strong>?
            </p>
            
            <div className="flex gap-3 pt-4">
              <Button
                variant="destructive"
                onClick={handleDeletePatient}
                loading={isDeleting}
                className="flex-1"
              >
                {isDeleting ? 'Menghapus...' : 'Ya, Hapus Pasien'}
              </Button>
              <Button
                variant="outline"
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className="flex-1"
              >
                Batal
              </Button>
            </div>
          </div>
        </Modal>
      </MainLayout>
    </AuthGuard>
  );
}