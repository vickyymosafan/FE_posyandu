'use client';

import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Modal } from '@/components/ui/modal';
import { Loading } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { PhysicalExamForm, ExaminationHistory, ExaminationChart } from '@/components/examinations';
import PatientSearch from '@/components/patients/PatientSearch';
import { examinationsApi } from '@/lib/api/examinations';
import { patientsApi } from '@/lib/api/patients';
import { PhysicalExamination } from '@/types/examination';
import { Patient } from '@/types/patient';
import useSWR from 'swr';

export default function PemeriksaanPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showExamForm, setShowExamForm] = useState(false);
  const [editingExamination, setEditingExamination] = useState<PhysicalExamination | null>(null);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [patientIdInput, setPatientIdInput] = useState('');
  const [loadingPatient, setLoadingPatient] = useState(false);

  // Fetch patient examinations when patient is selected
  const { 
    data: examinationsData, 
    error: examinationsError, 
    mutate: mutateExaminations,
    isLoading: loadingExaminations
  } = useSWR(
    selectedPatient ? `/examinations/patient/${selectedPatient.id}` : null,
    () => selectedPatient ? examinationsApi.getPatientExaminations(selectedPatient.id) : [],
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true
    }
  );

  // Ensure examinations is always an array
  const examinations = Array.isArray(examinationsData) ? examinationsData : [];

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setPatientIdInput('');
  };

  const handlePatientIdSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientIdInput.trim()) return;

    setLoadingPatient(true);
    try {
      // Try to find patient by ID or patient ID
      const response = await patientsApi.getPatients({ query: patientIdInput.trim(), limit: 10 });
      const patients = response.data.pasien;
      
      // Look for exact match by patient ID or ID
      const exactMatch = patients.find(p => 
        p.id_pasien === patientIdInput.trim() || 
        p.id.toString() === patientIdInput.trim()
      );

      if (exactMatch) {
        handlePatientSelect(exactMatch);
        toast.success(`Pasien ${exactMatch.nama} berhasil dipilih`);
      } else if (patients.length > 0) {
        // If no exact match but found patients, show search modal
        setShowPatientSearch(true);
        toast(`Ditemukan ${patients.length} pasien, pilih dari daftar`);
      } else {
        toast.error('Pasien tidak ditemukan');
      }
    } catch (error: any) {
      console.error('Error searching patient:', error);
      toast.error('Gagal mencari pasien');
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleNewExamination = () => {
    if (!selectedPatient) {
      toast.error('Pilih pasien terlebih dahulu');
      return;
    }
    setEditingExamination(null);
    setShowExamForm(true);
  };

  const handleEditExamination = (examination: PhysicalExamination) => {
    setEditingExamination(examination);
    setShowExamForm(true);
  };

  const handleDeleteExamination = async (examination: PhysicalExamination) => {
    if (!confirm('Apakah Anda yakin ingin menghapus pemeriksaan ini?')) {
      return;
    }

    try {
      await examinationsApi.deletePhysicalExamination(examination.id);
      toast.success('Pemeriksaan berhasil dihapus');
      mutateExaminations();
    } catch (error: any) {
      console.error('Error deleting examination:', error);
      toast.error('Gagal menghapus pemeriksaan');
    }
  };

  const handleExaminationSuccess = (examination: PhysicalExamination) => {
    setShowExamForm(false);
    setEditingExamination(null);
    mutateExaminations();
  };

  const handleCloseExamForm = () => {
    setShowExamForm(false);
    setEditingExamination(null);
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Pemeriksaan Fisik</h1>
              <p className="text-gray-600 mt-1">
                Kelola pemeriksaan fisik pasien posyandu
              </p>
            </div>
            
            {selectedPatient && (
              <Button onClick={handleNewExamination}>
                Pemeriksaan Baru
              </Button>
            )}
          </div>

          {/* Patient Selection */}
          {!selectedPatient && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Pasien</h2>

              {/* Inline smart search with instant select */}
              <PatientSearch
                onPatientSelect={handlePatientSelect}
                placeholder="Cari berdasarkan nama, NIK, atau nomor HP..."
                autoFocus={true}
                showResults={true}
              />
            </Card>
          )}

          {/* Selected Patient Info */}
          {selectedPatient && (
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPatient.nama}</h3>
                  <p className="text-sm text-gray-600">
                    ID: {selectedPatient.id_pasien} | NIK: {selectedPatient.nik}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedPatient(null)}
                >
                  Ganti Pasien
                </Button>
              </div>
            </Card>
          )}

          {/* Examination Content */}
          {selectedPatient && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Examination History */}
              <div className="lg:col-span-2">
                <ExaminationHistory
                  patient={selectedPatient}
                  examinations={examinations}
                  loading={loadingExaminations}
                  onEditExamination={handleEditExamination}
                  onDeleteExamination={handleDeleteExamination}
                />
              </div>

              {/* Charts */}
              <div className="space-y-4">
                {examinations.length > 1 && (
                  <>
                    <ExaminationChart
                      examinations={examinations}
                      metric="berat_badan"
                      title="Tren Berat Badan"
                    />
                    <ExaminationChart
                      examinations={examinations}
                      metric="tekanan_darah"
                      title="Tren Tekanan Darah"
                    />
                    <ExaminationChart
                      examinations={examinations}
                      metric="bmi"
                      title="Tren BMI"
                    />
                  </>
                )}
                
                {examinations.length <= 1 && (
                  <Card className="p-4">
                    <h4 className="font-medium text-gray-900 mb-2">Visualisasi Tren</h4>
                    <div className="text-center py-8 text-gray-500">
                      <div className="text-gray-400 mb-2">
                        <svg className="mx-auto h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <p className="text-sm">
                        Grafik tren akan muncul setelah ada minimal 2 pemeriksaan
                      </p>
                    </div>
                  </Card>
                )}
              </div>
            </div>
          )}

          {/* Error State */}
          {examinationsError && (
            <Card className="p-6">
              <div className="text-center text-red-600">
                <p>Gagal memuat data pemeriksaan</p>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => mutateExaminations()}
                  className="mt-2"
                >
                  Coba Lagi
                </Button>
              </div>
            </Card>
          )}
        </div>

        {/* Patient Search Modal */}
        <Modal
          isOpen={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          title="Cari Pasien"
          size="lg"
        >
          <div className="p-4">
            <PatientSearch
              onPatientSelect={handlePatientSelect}
              placeholder="Cari berdasarkan nama, NIK, atau nomor HP..."
              autoFocus={true}
            />
            <div className="mt-4 flex justify-end">
              <Button
                variant="outline"
                onClick={() => setShowPatientSearch(false)}
              >
                Batal
              </Button>
            </div>
          </div>
        </Modal>

        {/* Examination Form Modal */}
        <Modal
          isOpen={showExamForm}
          onClose={handleCloseExamForm}
          title={editingExamination ? 'Edit Pemeriksaan Fisik' : 'Pemeriksaan Fisik Baru'}
          size="xl"
        >
          {selectedPatient && (
            <PhysicalExamForm
              patient={selectedPatient}
              examination={editingExamination || undefined}
              onSuccess={handleExaminationSuccess}
              onCancel={handleCloseExamForm}
            />
          )}
        </Modal>
      </MainLayout>
    </AuthGuard>
  );
}