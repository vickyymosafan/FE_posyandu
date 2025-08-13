'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import HealthAssessmentForm from '@/components/assessments/HealthAssessmentForm';
import AssessmentReport from '@/components/assessments/AssessmentReport';
import AssessmentHistory from '@/components/assessments/AssessmentHistory';
import { assessmentsApi } from '@/lib/api/assessments';
import { patientsApi } from '@/lib/api/patients';
import { AssessmentWithDetails, AssessmentCategory } from '@/types/assessment';
import { Patient } from '@/types/patient';
import { formatDate, formatDateTime } from '@/lib/utils';
import { toast } from 'react-hot-toast';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';

type ViewMode = 'list' | 'form' | 'report' | 'history';

interface FilterOptions {
  search?: string;
  category?: AssessmentCategory | '';
  startDate?: string;
  endDate?: string;
}

const getCategoryConfig = (category: AssessmentCategory) => {
  switch (category) {
    case 'normal':
      return {
        label: 'Normal',
        color: 'bg-green-100 text-green-800',
        icon: '✓'
      };
    case 'perlu_perhatian':
      return {
        label: 'Perlu Perhatian',
        color: 'bg-yellow-100 text-yellow-800',
        icon: '⚠'
      };
    case 'rujukan':
      return {
        label: 'Rujukan',
        color: 'bg-red-100 text-red-800',
        icon: '⚡'
      };
    default:
      return {
        label: 'Unknown',
        color: 'bg-gray-100 text-gray-800',
        icon: '?'
      };
  }
};

export default function AssessmentPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([]);
  const [filteredAssessments, setFilteredAssessments] = useState<AssessmentWithDetails[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [selectedAssessment, setSelectedAssessment] = useState<AssessmentWithDetails | null>(null);
  const [historyPatientId, setHistoryPatientId] = useState<number | null>(null);
  const [isResolvingHistoryId, setIsResolvingHistoryId] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showPatientModal, setShowPatientModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [assessments, filters]);

  const loadInitialData = async () => {
    try {
      setIsLoading(true);
      const [assessmentsData, patientsResponse] = await Promise.all([
        assessmentsApi.getAssessments(),
        patientsApi.getPatients()
      ]);
      
      setAssessments(assessmentsData);
      setPatients(patientsResponse.data.pasien);
    } catch (error: any) {
      console.error('Error loading data:', error);
      toast.error('Gagal memuat data');
    } finally {
      setIsLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...assessments];

    // Filter by search (patient name)
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(assessment => 
        assessment.nama_pasien.toLowerCase().includes(searchLower)
      );
    }

    // Filter by category
    if (filters.category) {
      filtered = filtered.filter(assessment => 
        assessment.kategori_penilaian === filters.category
      );
    }

    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(assessment => 
        new Date(assessment.tanggal_penilaian) >= new Date(filters.startDate!)
      );
    }

    if (filters.endDate) {
      filtered = filtered.filter(assessment => 
        new Date(assessment.tanggal_penilaian) <= new Date(filters.endDate!)
      );
    }

    setFilteredAssessments(filtered);
  };

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value || undefined
    }));
  };

  const clearFilters = () => {
    setFilters({});
  };

  const handleNewAssessment = () => {
    setSelectedAssessment(null);
    setShowPatientModal(true);
  };

  const handleSelectPatient = (patient: Patient) => {
    setSelectedPatient(patient);
    setShowPatientModal(false);
    setViewMode('form');
  };

  const handleEditAssessment = (assessment: AssessmentWithDetails) => {
    const patient = patients.find(p => p.id === assessment.id_pasien);
    if (patient) {
      setSelectedPatient(patient);
      setSelectedAssessment(assessment);
      setViewMode('form');
    }
  };

  const handleViewReport = (assessment: AssessmentWithDetails) => {
    setSelectedAssessment(assessment);
    setViewMode('report');
  };

  const handleViewHistory = async (assessment: AssessmentWithDetails) => {
    setSelectedAssessment(assessment);
    setIsResolvingHistoryId(true);
    try {
      let resolvedId: number | null = null;
      // If assessment carries numeric id already
      if (typeof assessment.id_pasien === 'number') {
        resolvedId = assessment.id_pasien;
      } else {
        // Try local cache first
        const local = patients.find(p => p.id_pasien === assessment.id_pasien || p.nama === assessment.nama_pasien);
        if (local) {
          resolvedId = local.id;
        } else {
          // Fallback: query backend to resolve code to numeric id
          const resp = await patientsApi.getPatients({ query: String(assessment.id_pasien), limit: 1 });
          const match = resp.data.pasien.find(p => p.id_pasien === assessment.id_pasien || p.nama === assessment.nama_pasien);
          if (match) {
            resolvedId = match.id;
          }
        }
      }
      setHistoryPatientId(resolvedId);
    } catch (e) {
      console.error('Failed to resolve patient id for history:', e);
      setHistoryPatientId(null);
    } finally {
      setIsResolvingHistoryId(false);
      setViewMode('history');
    }
  };

  const handleAssessmentSuccess = () => {
    loadInitialData();
    setViewMode('list');
    setSelectedPatient(null);
    setSelectedAssessment(null);
  };

  const handleCancel = () => {
    setViewMode('list');
    setSelectedPatient(null);
    setSelectedAssessment(null);
    setHistoryPatientId(null);
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

  return (
    <AuthGuard>
      <MainLayout>
        <div className="space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Penilaian Kesehatan</h1>
              <p className="text-gray-600 mt-1">
                Kelola penilaian dan dokumentasi kesehatan pasien
              </p>
            </div>
            
            {viewMode === 'list' && (
              <Button onClick={handleNewAssessment}>
                Penilaian Baru
              </Button>
            )}
            
            {viewMode !== 'list' && (
              <Button variant="outline" onClick={handleCancel}>
                Kembali ke Daftar
              </Button>
            )}
          </div>

      {/* Content based on view mode */}
      {viewMode === 'list' && (
        <>
          {/* Filters */}
          <Card className="p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Input
                placeholder="Cari nama pasien..."
                value={filters.search || ''}
                onChange={(e) => handleFilterChange('search', e.target.value)}
              />

              <div>
                <select
                  value={filters.category || ''}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full h-9 px-3 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Semua Kategori</option>
                  <option value="normal">Normal</option>
                  <option value="perlu_perhatian">Perlu Perhatian</option>
                  <option value="rujukan">Rujukan</option>
                </select>
              </div>

              <Input
                type="date"
                placeholder="Tanggal mulai"
                value={filters.startDate || ''}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />

              <Input
                type="date"
                placeholder="Tanggal akhir"
                value={filters.endDate || ''}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />

              <Button variant="outline" onClick={clearFilters}>
                Reset Filter
              </Button>
            </div>

            <div className="mt-4 text-sm text-gray-600">
              Menampilkan {filteredAssessments.length} dari {assessments.length} penilaian
            </div>
          </Card>

          {/* Assessment List */}
          {filteredAssessments.length === 0 ? (
            <Card className="p-12 text-center">
              <div className="text-gray-400 mb-4">
                <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {assessments.length === 0 ? 'Belum ada penilaian kesehatan' : 'Tidak ada penilaian yang sesuai filter'}
              </h3>
              <p className="text-gray-500 mb-6">
                {assessments.length === 0 
                  ? 'Mulai dengan membuat penilaian kesehatan pertama'
                  : 'Coba ubah filter pencarian Anda'
                }
              </p>
              {assessments.length === 0 && (
                <Button onClick={handleNewAssessment}>
                  Buat Penilaian Pertama
                </Button>
              )}
            </Card>
          ) : (
            <div className="grid gap-4">
              {filteredAssessments.map((assessment) => {
                const categoryConfig = getCategoryConfig(assessment.kategori_penilaian);
                
                return (
                  <Card key={assessment.id} className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h3 className="text-lg font-semibold text-gray-900">
                            {assessment.nama_pasien}
                          </h3>
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${categoryConfig.color}`}>
                            {categoryConfig.icon} {categoryConfig.label}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 space-y-1">
                          <p>
                            <span className="font-medium">Tanggal:</span> {formatDateTime(assessment.tanggal_penilaian)}
                          </p>
                          <p>
                            <span className="font-medium">Diperiksa oleh:</span> {assessment.admin_nama}
                          </p>
                          <p className="line-clamp-2">
                            <span className="font-medium">Temuan:</span> {assessment.temuan || 'Tidak ada temuan'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 ml-4">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewReport(assessment)}
                        >
                          Lihat Laporan
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleViewHistory(assessment)}
                        >
                          Riwayat
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditAssessment(assessment)}
                        >
                          Edit
                        </Button>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </>
      )}

      {viewMode === 'form' && selectedPatient && (
        <HealthAssessmentForm
          patient={selectedPatient}
          assessment={selectedAssessment || undefined}
          onSuccess={handleAssessmentSuccess}
          onCancel={handleCancel}
        />
      )}

      {viewMode === 'report' && selectedAssessment && (
        <AssessmentReport
          assessment={selectedAssessment}
          onEdit={() => handleEditAssessment(selectedAssessment)}
        />
      )}

      {viewMode === 'history' && selectedAssessment && (
        historyPatientId ? (
          <AssessmentHistory
            patientId={historyPatientId}
            onSelectAssessment={handleViewReport}
          />
        ) : (
          <Card className="p-6">
            <div className="text-sm text-gray-600">{isResolvingHistoryId ? 'Menyiapkan data riwayat...' : 'Gagal menemukan pasien untuk riwayat.'}</div>
          </Card>
        )
      )}

      {/* Patient Selection Modal */}
      <Modal
        isOpen={showPatientModal}
        onClose={() => setShowPatientModal(false)}
        title="Pilih Pasien"
        size="lg"
      >
        <div className="space-y-4">
          <Input
            placeholder="Cari nama pasien..."
            value={filters.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
          />
          
          <div className="max-h-96 overflow-y-auto space-y-2">
            {patients
              .filter(patient => 
                !filters.search || 
                patient.nama.toLowerCase().includes(filters.search.toLowerCase()) ||
                patient.nik.includes(filters.search) ||
                patient.id_pasien.includes(filters.search)
              )
              .map((patient) => (
                <div
                  key={patient.id}
                  className="p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSelectPatient(patient)}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="font-medium text-gray-900">{patient.nama}</h4>
                      <p className="text-sm text-gray-600">
                        ID: {patient.id_pasien} | NIK: {patient.nik}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      Pilih
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </Modal>
    </div>
      </MainLayout>
    </AuthGuard>
  );
}