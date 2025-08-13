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

export default function ScanPage() {
  const router = useRouter();
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);

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