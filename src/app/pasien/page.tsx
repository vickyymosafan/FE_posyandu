'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import PatientRegistrationForm from '@/components/patients/PatientRegistrationForm';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { Modal } from '@/components/ui/modal';
import { Input } from '@/components/ui/input';
import { DataTable, type Column } from '@/components/ui/table';
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

  const [pageSize, setPageSize] = useState<number>(PAGINATION.DEFAULT_PAGE_SIZE);
  const [debouncedQuery, setDebouncedQuery] = useState<string>('');
  const [sortKey, setSortKey] = useState<keyof Patient | string | null>('dibuat_pada');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

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

  // Debounce search query to reduce requests while typing
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(searchQuery), 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Initial load
  useEffect(() => {
    loadPatients(1, '');
  }, []);

  // Reload when pagination, page size, or debounced query changes
  useEffect(() => {
    if (!isLoading) {
      loadPatients(currentPage, debouncedQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, debouncedQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    setCurrentPage(1);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handlePageSizeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = Number(e.target.value);
    setPageSize(newSize);
    setCurrentPage(1);
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

  const handleDownloadBarcode = async (patient: Patient) => {
    try {
      await patientsApi.downloadBarcode(patient.id, 'png');
      toast.success('Barcode diunduh');
    } catch (error) {
      console.error('Error downloading barcode:', error);
      toast.error('Gagal mengunduh barcode');
    }
  };

  const onSort = (key: keyof Patient | string, order: 'asc' | 'desc') => {
    setSortKey(key);
    setSortOrder(order);
  };

  const displayedPatients = useMemo(() => {
    if (!sortKey) return patients;
    const sorted = [...patients].sort((a, b) => {
      const getVal = (row: Patient, key: keyof Patient | string) => {
        if (key === 'umur') return calculateAge(row.tanggal_lahir);
        const value = (row as any)[key as any];
        return value;
      };
      let va: any = getVal(a, sortKey);
      let vb: any = getVal(b, sortKey);
      if (sortKey === 'dibuat_pada' || sortKey === 'tanggal_lahir') {
        va = new Date(va).getTime();
        vb = new Date(vb).getTime();
      }
      if (typeof va === 'string' && typeof vb === 'string') {
        return sortOrder === 'asc' ? va.localeCompare(vb) : vb.localeCompare(va);
      }
      const na = Number(va);
      const nb = Number(vb);
      if (!Number.isNaN(na) && !Number.isNaN(nb)) {
        return sortOrder === 'asc' ? na - nb : nb - na;
      }
      return 0;
    });
    return sorted;
  }, [patients, sortKey, sortOrder]);

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
                <Input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  placeholder="Cari pasien berdasarkan nama, NIK, atau nomor HP..."
                  aria-label="Cari pasien"
                  leftIcon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  }
                />
              </div>
              <div className="flex items-center gap-3">
                <label htmlFor="page-size" className="text-sm text-gray-700 whitespace-nowrap">Tampil</label>
                <select
                  id="page-size"
                  className="h-9 rounded-md border border-gray-300 bg-white px-3 text-sm"
                  value={pageSize}
                  onChange={handlePageSizeChange}
                  aria-label="Jumlah data per halaman"
                >
                  {PAGINATION.PAGE_SIZE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <span className="text-sm text-gray-700">/ halaman</span>
                <Button
                  variant="outline"
                  onClick={() => handleSearch('')}
                  disabled={!searchQuery}
                >
                  Reset
                </Button>
              </div>
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
            <>
              {/* Desktop table */}
              <div className="hidden md:block">
                <DataTable
                  data={displayedPatients}
                  columns={([
                    {
                      key: 'nama',
                      title: 'Nama',
                      sortable: true,
                      render: (_v, row) => (
                        <div className="min-w-[180px]">
                          <div className="font-medium text-gray-900">{row.nama}</div>
                          <div className="text-xs text-gray-500 mt-0.5">ID: {row.id_pasien}</div>
                        </div>
                      ),
                    },
                    { key: 'nik', title: 'NIK', sortable: true },
                    {
                      key: 'tanggal_lahir',
                      title: 'Umur',
                      sortable: true,
                      align: 'center',
                      width: '100px',
                      render: (_v, row) => (
                        <span>{calculateAge(row.tanggal_lahir)} tahun</span>
                      ),
                    },
                    { key: 'nomor_hp', title: 'No. HP', sortable: true, render: (v) => v || '-' },
                    { key: 'dibuat_pada', title: 'Terdaftar', sortable: true, render: (v) => formatDate(String(v)) },
                    {
                      key: 'actions',
                      title: 'Aksi',
                      sortable: false,
                      align: 'right',
                      render: (_v, row) => (
                        <div className="flex items-center justify-end gap-2">
                          <Button size="sm" variant="outline" onClick={(e) => { e.stopPropagation(); handlePatientClick(row); }}>Detail</Button>
                          <Button size="sm" variant="secondary" onClick={(e) => { e.stopPropagation(); handleDownloadBarcode(row); }}>Barcode</Button>
                        </div>
                      ),
                    },
                  ]) as Column<Patient>[]}
                  loading={isLoading || isSearching}
                  sortable
                  defaultSortKey={sortKey || undefined}
                  defaultSortOrder={sortOrder}
                  onSort={onSort}
                  pagination
                  pageSize={pageSize}
                  currentPage={currentPage}
                  totalItems={totalItems}
                  onPageChange={handlePageChange}
                />
              </div>

              {/* Mobile card list */}
              <div className="space-y-4 md:hidden">
                {displayedPatients.map((patient) => (
                  <Card key={patient.id} className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0" onClick={() => handlePatientClick(patient)}>
                        <div className="flex items-center gap-3">
                          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <span className="text-blue-600 font-medium">
                              {patient.nama.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-base font-medium text-gray-900 truncate">
                              {patient.nama}
                            </h3>
                            <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-500 mt-1">
                              <span>ID: {patient.id_pasien}</span>
                              <span>NIK: {patient.nik}</span>
                              <span>Umur: {calculateAge(patient.tanggal_lahir)} th</span>
                              {patient.nomor_hp && <span>HP: {patient.nomor_hp}</span>}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              Terdaftar: {formatDate(patient.dibuat_pada)}
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex-shrink-0 flex items-center gap-2">
                        <Button size="xs" variant="outline" onClick={() => handlePatientClick(patient)}>Detail</Button>
                        <Button size="xs" variant="secondary" onClick={() => handleDownloadBarcode(patient)}>Barcode</Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </>
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

          {/* Pagination (mobile only) */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 md:hidden">
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