'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Modal } from '@/components/ui/modal';
// Loading component not needed in this file
import TreatmentForm from '@/components/treatments/TreatmentForm';
import TreatmentHistory from '@/components/treatments/TreatmentHistory';
import ReferralForm from '@/components/referrals/ReferralForm';
import ReferralTracking from '@/components/referrals/ReferralTracking';
import CriticalHealthAlert from '@/components/alerts/CriticalHealthAlert';
import { patientsApi } from '@/lib/api/patients';
import { examinationsApi } from '@/lib/api/examinations';
import { assessmentsApi } from '@/lib/api/assessments';
import { Patient } from '@/types/patient';
import { PhysicalExamination, AdvancedTest } from '@/types/examination';
import { HealthAssessment } from '@/types/assessment';
// SWR not needed in this main page, used in child components
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';

// Using Patient type directly since the API returns standard Patient objects

export default function TreatmentAndReferralPage() {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<Patient[]>([]);
  const [activeTab, setActiveTab] = useState<'treatment' | 'referral'>('treatment');
  const [activeView, setActiveView] = useState<'form' | 'history'>('form');
  
  // Modals
  const [isTreatmentModalOpen, setIsTreatmentModalOpen] = useState(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState(false);
  
  // Patient health data
  const [latestExamination, setLatestExamination] = useState<PhysicalExamination | null>(null);
  const [latestAdvancedTest, setLatestAdvancedTest] = useState<AdvancedTest | null>(null);
  const [latestAssessment, setLatestAssessment] = useState<HealthAssessment | null>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Load patient health data when patient is selected
  useEffect(() => {
    if (selectedPatient) {
      loadPatientHealthData(selectedPatient.id);
    }
  }, [selectedPatient]);

  const loadPatientHealthData = async (patientId: number) => {
    try {
      const [physicalExams, advancedTests, assessments] = await Promise.all([
        examinationsApi.getPatientExaminations(patientId),
        examinationsApi.getPatientAdvancedTests(patientId),
        assessmentsApi.getPatientAssessments(patientId)
      ]);

      setLatestExamination(physicalExams.length > 0 ? physicalExams[0] : null);
      setLatestAdvancedTest(advancedTests.length > 0 ? advancedTests[0] : null);
      setLatestAssessment(assessments.length > 0 ? assessments[0] : null);
    } catch (error) {
      console.error('Error loading patient health data:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const response = await patientsApi.getPatients({ query: searchQuery, limit: 10 });
      setSearchResults(response.data.pasien);
    } catch (error: unknown) {
      console.error('Error searching patients:', error);
      const errorMessage = error instanceof Error ? error.message : 'Gagal mencari pasien';
      toast.error(errorMessage);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient);
    setSearchResults([]);
    setSearchQuery('');
  };

  const handleTreatmentSuccess = () => {
    setIsTreatmentModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
    toast.success('Resep obat berhasil dibuat');
  };

  const handleReferralSuccess = () => {
    setIsReferralModalOpen(false);
    setRefreshTrigger(prev => prev + 1);
    toast.success('Rujukan berhasil dibuat');
  };

  const handleCriticalAlertReferral = () => {
    setActiveTab('referral');
    setIsReferralModalOpen(true);
  };

  const handleCriticalAlertTreatment = () => {
    setActiveTab('treatment');
    setIsTreatmentModalOpen(true);
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Manajemen Pengobatan dan Rujukan
        </h1>
        <p className="text-gray-600">
          Kelola resep obat dan rujukan pasien berdasarkan hasil pemeriksaan dan penilaian kesehatan
        </p>
      </div>

      {/* Patient Search */}
      <Card className="p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Cari Pasien</h2>
        
        <div className="flex gap-3 mb-4">
          <div className="flex-1">
            <Input
              placeholder="Cari berdasarkan nama, NIK, atau nomor HP..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
            />
          </div>
          <Button 
            onClick={handleSearch}
            loading={isSearching}
            disabled={!searchQuery.trim()}
          >
            Cari
          </Button>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
            {searchResults.map((patient) => (
              <div
                key={patient.id}
                className="p-3 hover:bg-gray-50 cursor-pointer"
                onClick={() => handlePatientSelect(patient)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-medium text-gray-900">{patient.nama}</h4>
                    <p className="text-sm text-gray-600">
                      NIK: {patient.nik} | HP: {patient.nomor_hp || '-'}
                    </p>
                    <p className="text-sm text-gray-600">
                      ID: {patient.id_pasien}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>Terdaftar: {new Date(patient.dibuat_pada).toLocaleDateString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Selected Patient */}
        {selectedPatient && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-medium text-blue-900">Pasien Terpilih:</h4>
                <p className="text-blue-800">
                  <strong>{selectedPatient.nama}</strong> (ID: {selectedPatient.id_pasien})
                </p>
                <p className="text-sm text-blue-700">
                  NIK: {selectedPatient.nik} | HP: {selectedPatient.nomor_hp || '-'}
                </p>
              </div>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setSelectedPatient(null)}
              >
                Ganti Pasien
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Patient Selected Content */}
      {selectedPatient && (
        <>
          {/* Critical Health Alert */}
          {(latestExamination || latestAdvancedTest || latestAssessment) && (
            <div className="mb-6">
              <CriticalHealthAlert
                patient={selectedPatient}
                latestExamination={latestExamination}
                latestAdvancedTest={latestAdvancedTest}
                latestAssessment={latestAssessment}
                onReferralRecommended={handleCriticalAlertReferral}
                onTreatmentRecommended={handleCriticalAlertTreatment}
              />
            </div>
          )}

          {/* Tab Navigation */}
          <div className="mb-6">
            <div className="border-b border-gray-200">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('treatment')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'treatment'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pengobatan
                </button>
                <button
                  onClick={() => setActiveTab('referral')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'referral'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Rujukan
                </button>
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'treatment' && (
            <div className="space-y-6">
              {/* Treatment Actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manajemen Pengobatan
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant={activeView === 'form' ? 'default' : 'outline'}
                    onClick={() => setActiveView('form')}
                  >
                    Buat Resep
                  </Button>
                  <Button
                    variant={activeView === 'history' ? 'default' : 'outline'}
                    onClick={() => setActiveView('history')}
                  >
                    Riwayat
                  </Button>
                </div>
              </div>

              {/* Treatment Content */}
              {activeView === 'form' ? (
                <TreatmentForm
                  patient={selectedPatient}
                  assessmentId={latestAssessment?.id}
                  onSuccess={handleTreatmentSuccess}
                />
              ) : (
                <TreatmentHistory
                  patient={selectedPatient}
                  refreshTrigger={refreshTrigger}
                />
              )}
            </div>
          )}

          {activeTab === 'referral' && (
            <div className="space-y-6">
              {/* Referral Actions */}
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-semibold text-gray-900">
                  Manajemen Rujukan
                </h2>
                <div className="flex gap-3">
                  <Button
                    variant={activeView === 'form' ? 'default' : 'outline'}
                    onClick={() => setActiveView('form')}
                  >
                    Buat Rujukan
                  </Button>
                  <Button
                    variant={activeView === 'history' ? 'default' : 'outline'}
                    onClick={() => setActiveView('history')}
                  >
                    Tracking
                  </Button>
                </div>
              </div>

              {/* Referral Content */}
              {activeView === 'form' ? (
                <ReferralForm
                  patient={selectedPatient}
                  assessmentId={latestAssessment?.id}
                  onSuccess={handleReferralSuccess}
                />
              ) : (
                <ReferralTracking
                  patient={selectedPatient}
                  refreshTrigger={refreshTrigger}
                />
              )}
            </div>
          )}
        </>
      )}

      {/* No Patient Selected */}
      {!selectedPatient && (
        <Card className="p-12">
          <div className="text-center">
            <div className="text-gray-400 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Pilih Pasien untuk Memulai
            </h3>
            <p className="text-gray-600">
              Gunakan fitur pencarian di atas untuk mencari dan memilih pasien yang akan dikelola pengobatan atau rujukannya
            </p>
          </div>
        </Card>
      )}

          {/* Treatment Modal */}
          <Modal
            isOpen={isTreatmentModalOpen}
            onClose={() => setIsTreatmentModalOpen(false)}
            title="Buat Resep Obat"
            size="lg"
          >
            {selectedPatient && (
              <TreatmentForm
                patient={selectedPatient}
                assessmentId={latestAssessment?.id}
                onSuccess={handleTreatmentSuccess}
                onCancel={() => setIsTreatmentModalOpen(false)}
              />
            )}
          </Modal>

          {/* Referral Modal */}
          <Modal
            isOpen={isReferralModalOpen}
            onClose={() => setIsReferralModalOpen(false)}
            title="Buat Rujukan"
            size="lg"
          >
            {selectedPatient && (
              <ReferralForm
                patient={selectedPatient}
                assessmentId={latestAssessment?.id}
                onSuccess={handleReferralSuccess}
                onCancel={() => setIsReferralModalOpen(false)}
              />
            )}
          </Modal>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}