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

  // Load recent tests on component mount
  useEffect(() => {
    loadRecentTests();
  }, [refreshTrigger]);

  const loadRecentTests = async () => {
    try {
      setLoadingRecent(true);
      const tests = await advancedTestsApi.getAdvancedTests();
      // Sort by date and take the most recent 10
      const sortedTests = tests.sort((a, b) => 
        new Date(b.tanggal_tes).getTime() - new Date(a.tanggal_tes).getTime()
      );
      setRecentTests(sortedTests.slice(0, 10));
    } catch (error) {
      console.error('Error loading recent tests:', error);
    } finally {
      setLoadingRecent(false);
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
  } => {
    if (glucose < 70) {
      return { status: 'Rendah', color: 'text-blue-600 bg-blue-50' };
    } else if (glucose <= 140) {
      return { status: 'Normal', color: 'text-green-600 bg-green-50' };
    } else if (glucose <= 199) {
      return { status: 'Prediabetes', color: 'text-yellow-600 bg-yellow-50' };
    } else {
      return { status: 'Diabetes', color: 'text-red-600 bg-red-50' };
    }
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tes Kesehatan Lanjutan</h1>
              <p className="text-gray-600 mt-1">
                Kelola tes gula darah dan tes kesehatan lanjutan lainnya
              </p>
            </div>
            <div className="mt-4 sm:mt-0 flex space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowPatientSearch(true)}
              >
                Pilih Pasien
              </Button>
              <Button onClick={handleNewTest}>
                Tes Baru
              </Button>
            </div>
          </div>

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
                <Card className="p-8">
                  <div className="text-center">
                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h3 className="mt-2 text-sm font-medium text-gray-900">Pilih Pasien</h3>
                    <p className="mt-1 text-sm text-gray-500">
                      Pilih pasien untuk melihat riwayat tes lanjutan
                    </p>
                    <div className="mt-6">
                      <Button onClick={() => setShowPatientSearch(true)}>
                        Pilih Pasien
                      </Button>
                    </div>
                  </div>
                </Card>
              )}
            </div>

            {/* Recent Tests Sidebar */}
            <div>
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
            </div>
          </div>
        </div>

        {/* Patient Search Modal */}
        <Modal
          isOpen={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          title="Pilih Pasien"
          size="lg"
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