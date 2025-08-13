'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import PatientRegistrationForm from '@/components/patients/PatientRegistrationForm';
import PatientSearch from '@/components/patients/PatientSearch';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@/types/patient';
import { ROUTES, PAGINATION } from '@/lib/constants';
import { toast } from 'react-hot-toast';

export default function PasienPage() {
  const router = useRouter();
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const pageSize = PAGINATION.DEFAULT_PAGE_SIZE;

  // Load patients
  const loadPatients = async (page: number = 1, query: string = '') => {
    try {
      setIsSearching(!!query);
      const response = await patientsApi.getPatients({
        query: query.trim() || undefined,
        page,
        limit: pageSize,
      });

      setPatients(response.data.pasien);
      setCurrentPage(response.data.pagination.currentPage);
      setTotalPages(response.data.pagination.totalPages);
      setTotalItems(response.data.pagination.totalItems);
    } catch (error) {
      console.error('Error loading patients:', error);
      toast.error('Gagal memuat data pasien');
    } finally {
      setIsLoading(false);
      setIsSearching(false);
    }
  };

  useEffect(() => {
    loadPatients(1, searchQuery);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    loadPatients(page, searchQuery);
  };

  const handlePatientCreated = (newPatient: Patient) => {
    setShowRegistrationForm(false);
    // Refresh the list to show the new patient
    loadPatients(1, searchQuery);
  };

  const handlePatientClick = (patient: Patient) => {
    router.push(ROUTES.PATIENT_DETAIL(patient.id));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const calculateAge = (birthDate: string) => {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
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
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Manajemen Pasien</h1>
              <p className="text-gray-600 mt-1">
                Kelola data pasien posyandu
              </p>
            </div>
            <Button
              onClick={() => setShowRegistrationForm(true)}
              leftIcon={
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              }
            >
              Daftar Pasien Baru
            </Button>
          </div>

          {/* Search */}
          <Card className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Cari pasien berdasarkan nama, NIK, atau nomor HP..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <Button
                variant="outline"
                onClick={() => handleSearch('')}
                disabled={!searchQuery}
              >
                Reset
              </Button>
            </div>
          </Card>

          {/* Results Summary */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div>
              {isSearching ? (
                <span className="flex items-center gap-2">
                  <Loading size="sm" />
                  Mencari pasien...
                </span>
              ) : (
                <span>
                  Menampilkan {patients.length} dari {totalItems} pasien
                  {searchQuery && (
                    <span className="ml-1">
                      untuk "{searchQuery}"
                    </span>
                  )}
                </span>
              )}
            </div>
          </div>

          {/* Patient List */}
          {patients.length > 0 ? (
            <div className="space-y-4">
              {patients.map((patient) => (
                <Card
                  key={patient.id}
                  className="p-4 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => handlePatientClick(patient)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <div className="flex-shrink-0 w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-lg">
                            {patient.nama.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-medium text-gray-900 truncate">
                            {patient.nama}
                          </h3>
                          <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-1">
                            <span>ID: {patient.id_pasien}</span>
                            <span>NIK: {patient.nik}</span>
                            <span>Umur: {calculateAge(patient.tanggal_lahir)} tahun</span>
                            {patient.nomor_hp && (
                              <span>HP: {patient.nomor_hp}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex-shrink-0 text-right">
                      <div className="text-sm text-gray-500">
                        Terdaftar: {formatDate(patient.dibuat_pada)}
                      </div>
                      <div className="mt-2">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="p-12 text-center">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery ? 'Tidak ada pasien ditemukan' : 'Belum ada pasien terdaftar'}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery 
                  ? 'Coba gunakan kata kunci pencarian yang berbeda'
                  : 'Mulai dengan mendaftarkan pasien baru ke sistem posyandu'
                }
              </p>
              {!searchQuery && (
                <Button onClick={() => setShowRegistrationForm(true)}>
                  Daftar Pasien Pertama
                </Button>
              )}
            </Card>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
              >
                Sebelumnya
              </Button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }

                  return (
                    <Button
                      key={pageNum}
                      variant={currentPage === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => handlePageChange(pageNum)}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
              >
                Selanjutnya
              </Button>
            </div>
          )}
        </div>

        {/* Registration Form Modal */}
        <Modal
          isOpen={showRegistrationForm}
          onClose={() => setShowRegistrationForm(false)}
          title="Pendaftaran Pasien Baru"
          size="lg"
        >
          <PatientRegistrationForm
            onSuccess={handlePatientCreated}
            onCancel={() => setShowRegistrationForm(false)}
          />
        </Modal>
      </MainLayout>
    </AuthGuard>
  );
}