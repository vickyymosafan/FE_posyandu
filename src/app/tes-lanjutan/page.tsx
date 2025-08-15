'use client';

import React, { useState, useEffect } from 'react';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
import { Loading } from '@/components/ui/loading';
import { toast } from 'react-hot-toast';
import { AdvancedTestForm, TestHistory } from '@/components/tests';
import PatientSearch from '@/components/patients/PatientSearch';
import { advancedTestsApi } from '@/lib/api/advancedTests';
import { AdvancedTest } from '@/types/examination';
import { Patient } from '@/types/patient';

export default function TesLanjutanPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedTest, setSelectedTest] = useState<AdvancedTest | null>(null);
  const [showTestForm, setShowTestForm] = useState(false);
  const [showPatientSearch, setShowPatientSearch] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [recentTests, setRecentTests] = useState<AdvancedTest[]>([]);
  const [loadingRecent, setLoadingRecent] = useState(true);
  const [patientLatest, setPatientLatest] = useState<AdvancedTest | null>(null);
  const [loadingPatientLatest, setLoadingPatientLatest] = useState(false);

  // Load patient-specific recent tests and latest result
  useEffect(() => {
    if (!selectedPatient) {
      setRecentTests([]);
      setPatientLatest(null);
      return;
    }
    loadPatientData(selectedPatient.id);
  }, [selectedPatient, refreshTrigger]);

  const loadPatientData = async (patientId: number) => {
    try {
      setLoadingRecent(true);
      setLoadingPatientLatest(true);
      const tests = await advancedTestsApi.getPatientAdvancedTests(patientId);
      const sorted = [...tests].sort(
        (a, b) => new Date(b.tanggal_tes).getTime() - new Date(a.tanggal_tes).getTime()
      );
      setRecentTests(sorted.slice(0, 10));
      setPatientLatest(sorted[0] || null);
    } catch (error) {
      console.error('Error loading patient tests:', error);
      setRecentTests([]);
      setPatientLatest(null);
    } finally {
      setLoadingRecent(false);
      setLoadingPatientLatest(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientSearch(false);
    setSelectedTest(null);
  };

  const handleNewTest = () => {
    if (!selectedPatient) {
      setShowPatientSearch(true);
      return;
    }
    setSelectedTest(null);
    setShowTestForm(true);
  };

  const handleEditTest = (test: AdvancedTest) => {
    setSelectedTest(test);
    setShowTestForm(true);
  };

  const handleTestSuccess = (test: AdvancedTest) => {
    setShowTestForm(false);
    setSelectedTest(null);
    setRefreshTrigger(prev => prev + 1);
    toast.success('Tes lanjutan berhasil disimpan');
  };

  const handleCloseForm = () => {
    setShowTestForm(false);
    setSelectedTest(null);
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getGlucoseStatus = (glucose: number): {
    status: string;
    color: string;
    badge: string;
    advice: string[];
  } => {
    if (glucose < 70) {
      return { 
        status: 'Rendah', 
        color: 'text-blue-900 bg-blue-50',
        badge: 'bg-blue-100 text-blue-800',
        advice: [
          'Berikan makanan/minuman manis bila perlu',
          'Observasi gejala pusing/lemmas',
          'Rujuk jika keluhan tidak membaik'
        ]
      };
    } else if (glucose <= 140) {
      return { 
        status: 'Normal', 
        color: 'text-green-900 bg-green-50',
        badge: 'bg-green-100 text-green-800',
        advice: [
          'Edukasi pola makan seimbang',
          'Anjurkan aktivitas fisik rutin',
          'Lakukan cek berkala'
        ]
      };
    } else if (glucose <= 199) {
      return { 
        status: 'Prediabetes', 
        color: 'text-yellow-900 bg-yellow-50',
        badge: 'bg-yellow-100 text-yellow-800',
        advice: [
          'Edukasi diet rendah gula/karbo',
          'Anjurkan kontrol ulang 1-3 bulan',
          'Pantau gejala menyertai'
        ]
      };
    } else {
      return { 
        status: 'Diabetes', 
        color: 'text-red-900 bg-red-50',
        badge: 'bg-red-100 text-red-800',
        advice: [
          'Rujuk ke fasilitas kesehatan untuk evaluasi',
          'Pantau gejala penyerta (haus berlebih, sering BAK)',
          'Edukasi diet dan aktivitas'
        ]
      };
    }
  };

  // Removed old global fetch for latest; now handled in loadPatientData

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tes Kesehatan Lanjutan</h1>
              <p className="text-gray-600 mt-1">
                Cek dan catat gula darah. Tampilkan status kesehatan dengan bahasa sederhana untuk kader Posyandu.
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPatientSearch(true)}
              >
                Pilih Pasien
              </Button>
              <Button onClick={handleNewTest} disabled={!selectedPatient} title={!selectedPatient ? 'Pilih pasien terlebih dahulu' : undefined}>
                Tes Baru
              </Button>
            </div>
          </div>

          {/* Selected Patient Info */}
          {selectedPatient && (
            <Card className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-gray-900">{selectedPatient.nama}</h3>
                  <p className="text-sm text-gray-600">
                    ID: {selectedPatient.id_pasien} | NIK: {selectedPatient.nik}
                  </p>
                </div>
                {/* Latest Summary for Posyandu */}
                <div className="flex-1">
                  <div className="mt-2 p-3 rounded-lg border bg-gray-50">
                    {loadingPatientLatest ? (
                      <div className="text-sm text-gray-500">Memuat ringkasan terakhir...</div>
                    ) : patientLatest ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs text-gray-600">Hasil Terakhir</div>
                          <div className="text-lg font-semibold text-gray-900">
                            {new Date(patientLatest.tanggal_tes).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })}
                          </div>
                          <div className="mt-1 text-sm text-gray-700">
                            Gula darah: <span className="font-semibold">{patientLatest.gula_darah ?? '-'} mg/dL</span>
                          </div>
                        </div>
                        {typeof patientLatest.gula_darah === 'number' && (() => {
                          const s = getGlucoseStatus(patientLatest.gula_darah!);
                          return (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${s.badge}`}>
                              {s.status}
                            </span>
                          );
                        })()}
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500">Belum ada hasil tes untuk pasien ini.</div>
                    )}
                    {/* Simple actions/advice */}
                    {patientLatest && typeof patientLatest.gula_darah === 'number' && (
                      (() => {
                        const s = getGlucoseStatus(patientLatest.gula_darah!);
                        return (
                          <ul className="mt-2 list-disc pl-5 text-xs text-gray-700 space-y-1">
                            {s.advice.map((a, idx) => <li key={idx}>{a}</li>)}
                          </ul>
                        );
                      })()
                    )}
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowPatientSearch(true)}
                >
                  Ganti Pasien
                </Button>
              </div>
            </Card>
          )}

          {/* Main Content */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Patient History */}
            <div className="lg:col-span-2">
              {selectedPatient ? (
                <TestHistory
                  patient={selectedPatient}
                  onEditTest={handleEditTest}
                  refreshTrigger={refreshTrigger}
                />
              ) : (
                <Card className="p-6">
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Pilih Pasien</h2>
                  {/* Inline smart search with instant select */}
                  <div className="mb-6">
                    <PatientSearch
                      onPatientSelect={handlePatientSelect}
                      placeholder="Cari berdasarkan nama, NIK, atau nomor HP..."
                      autoFocus={true}
                      showResults={true}
                    />
                  </div>
                  {/* Advanced search entry removed per request */}
                </Card>
              )}
            </div>

            {/* Recent Tests Sidebar + Quick Stats: only when a patient is selected */}
            <div>
              {selectedPatient && (
                <>
                  <Card className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Tes Terbaru
                    </h3>
                    {loadingRecent ? (
                      <div className="flex justify-center py-4">
                        <Loading />
                      </div>
                    ) : recentTests.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Belum ada tes yang tercatat
                      </p>
                    ) : (
                      <div className="space-y-3">
                        {recentTests.map((test) => {
                          const glucoseStatus = test.gula_darah ? getGlucoseStatus(test.gula_darah) : null;
                          return (
                            <div
                              key={test.id}
                              className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                              onClick={() => handleEditTest(test)}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    ID: {test.id_pasien}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    {formatDate(test.tanggal_tes)}
                                  </p>
                                </div>
                                <div className="text-right">
                                  <p className="text-sm font-semibold text-gray-900">
                                    {test.gula_darah || '-'} mg/dL
                                  </p>
                                  {glucoseStatus && (
                                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${glucoseStatus.color}`}>
                                      {glucoseStatus.status}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </Card>

                  {/* Quick Stats */}
                  <Card className="p-6 mt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Statistik Cepat
                    </h3>
                    <div className="space-y-3">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Total Tes Hari Ini:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {recentTests.filter(test => {
                            const testDate = new Date(test.tanggal_tes).toDateString();
                            const today = new Date().toDateString();
                            return testDate === today;
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Tes Minggu Ini:</span>
                        <span className="text-sm font-semibold text-gray-900">
                          {recentTests.filter(test => {
                            const testDate = new Date(test.tanggal_tes);
                            const weekAgo = new Date();
                            weekAgo.setDate(weekAgo.getDate() - 7);
                            return testDate >= weekAgo;
                          }).length}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Nilai Kritis:</span>
                        <span className="text-sm font-semibold text-red-600">
                          {recentTests.filter(test => 
                            test.gula_darah && (test.gula_darah < 70 || test.gula_darah >= 200)
                          ).length}
                        </span>
                      </div>
                    </div>
                  </Card>
                </>
              )}

              {/* Posyandu Guide */}
              <Card className="p-6 mt-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Panduan Posyandu</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span>Status Normal</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">70-140 mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Prediabetes</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">140-199 mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Diabetes</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">≥200 mg/dL</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Rendah</span>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">&lt;70 mg/dL</span>
                  </div>
                </div>
                <div className="mt-3 text-xs text-gray-600">
                  Gunakan bahasa sederhana saat menyampaikan hasil. Bila hasil tinggi/rendah dan pasien bergejala, pertimbangkan rujukan.
                </div>
              </Card>
            </div>
          </div>
        </div>

        {/* Patient Search Modal */}
        <Modal
          isOpen={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          title="Pilih Pasien"
          size="lg"
          contentOverflow="visible"
        >
          <PatientSearch
            onPatientSelect={handlePatientSelect}
            autoFocus={true}
          />
        </Modal>

        {/* Test Form Modal */}
        <Modal
          isOpen={showTestForm}
          onClose={handleCloseForm}
          title={selectedTest ? 'Edit Tes Lanjutan' : 'Tes Lanjutan Baru'}
          size="lg"
        >
          {selectedPatient && (
            <AdvancedTestForm
              patient={selectedPatient}
              test={selectedTest || undefined}
              onSuccess={handleTestSuccess}
              onCancel={handleCloseForm}
            />
          )}
        </Modal>
      </MainLayout>
    </AuthGuard>
  );
}