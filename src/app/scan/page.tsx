'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import BarcodeScanner from '@/components/barcode/BarcodeScanner';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Patient } from '@/types/patient';
import toast from 'react-hot-toast';
import { examinationsApi } from '@/lib/api/examinations';
import { assessmentsApi } from '@/lib/api/assessments';
import { treatmentsApi } from '@/lib/api/treatments';
import { PhysicalExamination, AdvancedTest } from '@/types/examination';
import { AssessmentWithDetails } from '@/types/assessment';
import { TreatmentWithDetails } from '@/types/treatment';

export default function ScanPage() {
  const router = useRouter();
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isLoadingDetails, setIsLoadingDetails] = useState(false);
  const [examinations, setExaminations] = useState<PhysicalExamination[]>([]);
  const [advancedTests, setAdvancedTests] = useState<AdvancedTest[]>([]);
  const [assessments, setAssessments] = useState<AssessmentWithDetails[]>([]);
  const [treatments, setTreatments] = useState<TreatmentWithDetails[]>([]);

  const handlePatientFound = (patient: Patient) => {
    setFoundPatient(patient);
    setScanError(null);
  };

  const handleScanError = (error: string) => {
    setScanError(error);
    setFoundPatient(null);
  };

  const goToPatientProfile = () => {
    if (foundPatient) {
      router.push(`/pasien/${foundPatient.id}`);
    }
  };

  const startNewScan = () => {
    setFoundPatient(null);
    setScanError(null);
    setExaminations([]);
    setAdvancedTests([]);
    setAssessments([]);
    setTreatments([]);
  };

  const calculateAge = (birthDate: string): number => {
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  // Load all patient details once a patient is found
  React.useEffect(() => {
    const loadDetails = async () => {
      if (!foundPatient) return;
      try {
        setIsLoadingDetails(true);
        const [exams, adv, asses, meds] = await Promise.all([
          examinationsApi.getPatientExaminations(foundPatient.id),
          examinationsApi.getPatientAdvancedTests(foundPatient.id),
          assessmentsApi.getPatientAssessments(foundPatient.id),
          treatmentsApi.getTreatmentsByPatient(foundPatient.id)
        ]);
        setExaminations(exams);
        setAdvancedTests(adv);
        setAssessments(asses);
        setTreatments(meds);
      } catch (e) {
        console.error('Error loading patient details:', e);
        toast.error('Gagal memuat detail pasien');
      } finally {
        setIsLoadingDetails(false);
      }
    };
    loadDetails();
  }, [foundPatient?.id]);

  return (
    <AuthGuard>
      <MainLayout>
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Scan Barcode Pasien
            </h1>
            <p className="text-gray-600">
              Pindai barcode pasien untuk mengakses profil dan riwayat kesehatan
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Scanner Section */}
            <div>
              <BarcodeScanner 
                onPatientFound={handlePatientFound}
                onError={handleScanError}
              />
            </div>

            {/* Results Section */}
            <div>
              {foundPatient ? (
                <Card className="p-6">
                  <div className="space-y-4">
                    <div className="text-center">
                      <div className="text-4xl mb-3">✅</div>
                      <h3 className="text-lg font-semibold text-green-700 mb-2">
                        Pasien Ditemukan!
                      </h3>
                    </div>

                    {/* Patient Info */}
                    <div className="space-y-3 border-t pt-4">
                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">ID Pasien:</span>
                          <p className="font-mono text-blue-600">{foundPatient.id_pasien}</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">NIK:</span>
                          <p className="font-mono">{foundPatient.nik}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600">Nama Lengkap:</span>
                        <p className="text-lg font-semibold text-gray-900">{foundPatient.nama}</p>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-sm">
                        <div>
                          <span className="font-medium text-gray-600">Umur:</span>
                          <p>{calculateAge(foundPatient.tanggal_lahir)} tahun</p>
                        </div>
                        <div>
                          <span className="font-medium text-gray-600">No. HP:</span>
                          <p>{foundPatient.nomor_hp || '-'}</p>
                        </div>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600">Alamat:</span>
                        <p className="text-sm">{foundPatient.alamat || 'Tidak ada alamat'}</p>
                      </div>

                      <div>
                        <span className="font-medium text-gray-600">Terdaftar:</span>
                        <p className="text-sm">
                          {new Date(foundPatient.dibuat_pada).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </p>
                      </div>
                    </div>

                    {/* All Details */}
                    <div className="grid grid-cols-1 gap-6 pt-4 border-t">
                      {/* Pemeriksaan Fisik */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">
                          Pemeriksaan Fisik ({examinations.length})
                        </h4>
                        {isLoadingDetails ? (
                          <div className="text-sm text-gray-500">Memuat...</div>
                        ) : examinations.length === 0 ? (
                          <div className="text-sm text-gray-500">Belum ada riwayat pemeriksaan.</div>
                        ) : (
                          <div className="space-y-2">
                            {examinations.slice(0, 5).map((exam) => (
                              <div key={exam.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="font-medium text-gray-900">
                                    {new Date(exam.tanggal_pemeriksaan).toLocaleString('id-ID')}
                                  </div>
                                  {(exam.tekanan_darah_sistolik && exam.tekanan_darah_diastolik) && (
                                    <div className="text-xs text-gray-600">
                                      TD {exam.tekanan_darah_sistolik}/{exam.tekanan_darah_diastolik} mmHg
                                    </div>
                                  )}
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-2 text-xs text-gray-700">
                                  {exam.tinggi_badan && <div>Tinggi: {exam.tinggi_badan} cm</div>}
                                  {exam.berat_badan && <div>Berat: {exam.berat_badan} kg</div>}
                                  {exam.lingkar_perut && <div>Lingkar Perut: {exam.lingkar_perut} cm</div>}
                                </div>
                                {exam.catatan && (
                                  <div className="mt-2 text-xs text-gray-600">Catatan: {exam.catatan}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Tes Lanjutan */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">
                          Tes Lanjutan ({advancedTests.length})
                        </h4>
                        {isLoadingDetails ? (
                          <div className="text-sm text-gray-500">Memuat...</div>
                        ) : advancedTests.length === 0 ? (
                          <div className="text-sm text-gray-500">Belum ada riwayat tes lanjutan.</div>
                        ) : (
                          <div className="space-y-2">
                            {advancedTests.slice(0, 5).map((test) => (
                              <div key={test.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="font-medium text-gray-900">
                                    {new Date(test.tanggal_tes).toLocaleString('id-ID')}
                                  </div>
                                  {typeof test.gula_darah === 'number' && (
                                    <div className="text-xs text-gray-600">Gula Darah: {test.gula_darah} mg/dL</div>
                                  )}
                                </div>
                                {test.catatan && (
                                  <div className="mt-2 text-xs text-gray-600">Catatan: {test.catatan}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Penilaian Kesehatan */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">
                          Penilaian Kesehatan ({assessments.length})
                        </h4>
                        {isLoadingDetails ? (
                          <div className="text-sm text-gray-500">Memuat...</div>
                        ) : assessments.length === 0 ? (
                          <div className="text-sm text-gray-500">Belum ada riwayat penilaian.</div>
                        ) : (
                          <div className="space-y-2">
                            {assessments.slice(0, 5).map((a) => (
                              <div key={a.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="font-medium text-gray-900">
                                    {new Date(a.tanggal_penilaian).toLocaleString('id-ID')}
                                  </div>
                                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                                    a.kategori_penilaian === 'normal' ? 'bg-green-100 text-green-700' :
                                    a.kategori_penilaian === 'perlu_perhatian' ? 'bg-yellow-100 text-yellow-700' :
                                    'bg-red-100 text-red-700'
                                  }`}>
                                    {a.kategori_penilaian === 'normal' ? 'Normal' : a.kategori_penilaian === 'perlu_perhatian' ? 'Perlu Perhatian' : 'Rujukan'}
                                  </span>
                                </div>
                                {a.temuan && (
                                  <div className="mt-2 text-xs text-gray-600 line-clamp-2">Temuan: {a.temuan}</div>
                                )}
                                {a.rekomendasi && (
                                  <div className="mt-1 text-xs text-gray-600 line-clamp-2">Rekomendasi: {a.rekomendasi}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Pengobatan */}
                      <div>
                        <h4 className="text-md font-semibold text-gray-900 mb-2">
                          Pengobatan ({treatments.length})
                        </h4>
                        {isLoadingDetails ? (
                          <div className="text-sm text-gray-500">Memuat...</div>
                        ) : treatments.length === 0 ? (
                          <div className="text-sm text-gray-500">Belum ada riwayat pengobatan.</div>
                        ) : (
                          <div className="space-y-2">
                            {treatments.slice(0, 5).map((t) => (
                              <div key={t.id} className="border border-gray-200 rounded-lg p-3">
                                <div className="flex items-center justify-between text-sm">
                                  <div className="font-medium text-gray-900">
                                    {t.nama_obat || 'Obat tidak disebutkan'}
                                  </div>
                                  <div className="text-xs text-gray-600">
                                    {new Date(t.tanggal_resep).toLocaleString('id-ID')}
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-3 mt-2 text-xs text-gray-700">
                                  <div>Dosis: {t.dosis || '-'}</div>
                                  <div>Frekuensi: {t.frekuensi || '-'}</div>
                                  <div>Durasi: {t.durasi || '-'}</div>
                                </div>
                                {t.instruksi && (
                                  <div className="mt-2 text-xs text-gray-600 line-clamp-2">Instruksi: {t.instruksi}</div>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex space-x-3 pt-4 border-t">
                      <Button 
                        onClick={goToPatientProfile}
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                      >
                        Lihat Profil Lengkap
                      </Button>
                      <Button 
                        onClick={startNewScan}
                        variant="outline"
                        className="flex-1"
                      >
                        Scan Lagi
                      </Button>
                    </div>
                  </div>
                </Card>
              ) : scanError ? (
                <Card className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-3">❌</div>
                    <h3 className="text-lg font-semibold text-red-700 mb-2">
                      Scan Gagal
                    </h3>
                    <p className="text-red-600 text-sm">
                      {scanError}
                    </p>
                    <Button 
                      onClick={startNewScan}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Coba Lagi
                    </Button>
                  </div>
                </Card>
              ) : (
                <Card className="p-6">
                  <div className="text-center space-y-4">
                    <div className="text-4xl mb-3">🔍</div>
                    <h3 className="text-lg font-semibold text-gray-700 mb-2">
                      Siap untuk Scan
                    </h3>
                    <p className="text-gray-600 text-sm">
                      Arahkan kamera ke barcode pasien atau masukkan ID secara manual
                    </p>
                    
                    {/* Quick Tips */}
                    <div className="text-left space-y-2 mt-6">
                      <p className="font-medium text-gray-700 text-sm">Tips untuk scanning yang baik:</p>
                      <ul className="text-xs text-gray-600 space-y-1">
                        <li>• Pastikan barcode tidak terlipat atau rusak</li>
                        <li>• Gunakan pencahayaan yang cukup</li>
                        <li>• Jaga jarak 10-20 cm dari barcode</li>
                        <li>• Tunggu hingga kamera fokus</li>
                      </ul>
                    </div>
                  </div>
                </Card>
              )}
            </div>
          </div>

          {/* Additional Actions */}
          <div className="text-center">
            <div className="inline-flex space-x-4 text-sm text-gray-600">
              <button 
                onClick={() => router.push('/pasien')}
                className="hover:text-blue-600 underline"
              >
                Lihat Daftar Pasien
              </button>
              <span>•</span>
              <button 
                onClick={() => router.push('/dashboard')}
                className="hover:text-blue-600 underline"
              >
                Kembali ke Dashboard
              </button>
            </div>
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}