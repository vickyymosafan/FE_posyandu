'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Loading } from '@/components/ui/loading';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@/types/patient';
import toast from 'react-hot-toast';

interface BarcodeScannerProps {
  onPatientFound: (patient: Patient) => void;
  onError?: (error: string) => void;
}

export default function BarcodeScanner({ onPatientFound, onError }: BarcodeScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [manualId, setManualId] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [scannerMode, setScannerMode] = useState<'camera' | 'manual'>('camera');
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const scannerElementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scannerMode === 'camera' && isScanning && scannerElementRef.current) {
      initializeScanner();
    }

    return () => {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(console.error);
      }
    };
  }, [scannerMode, isScanning]);

  const initializeScanner = () => {
    if (!scannerElementRef.current) return;

    const config = {
      fps: 10,
      qrbox: { width: 250, height: 250 },
      aspectRatio: 1.0,
      supportedScanTypes: [Html5QrcodeScanType.SCAN_TYPE_CAMERA]
    };

    scannerRef.current = new Html5QrcodeScanner(
      'barcode-scanner',
      config,
      false
    );

    scannerRef.current.render(
      (decodedText) => {
        handleScanSuccess(decodedText);
      },
      (error) => {
        // Ignore frequent scan errors, only log actual issues
        if (error.includes('NotFoundException')) return;
        console.warn('Scan error:', error);
      }
    );
  };

  const handleScanSuccess = async (decodedText: string) => {
    try {
      setIsSearching(true);
      
      // Stop scanner
      if (scannerRef.current) {
        await scannerRef.current.clear();
        setIsScanning(false);
      }

      // Search for patient using scanned barcode
      const patient = await patientsApi.scanBarcode(decodedText);
      onPatientFound(patient);
      toast.success(`Pasien ditemukan: ${patient.nama}`);
    } catch (error: any) {
      console.error('Error scanning barcode:', error);
      const errorMessage = error?.response?.data?.pesan || 'Barcode tidak valid atau pasien tidak ditemukan';
      toast.error(errorMessage);
      onError?.(errorMessage);
      
      // Restart scanner after error
      setTimeout(() => {
        setIsScanning(true);
      }, 2000);
    } finally {
      setIsSearching(false);
    }
  };

  const handleManualSearch = async () => {
    if (!manualId.trim()) {
      toast.error('Masukkan ID pasien');
      return;
    }

    try {
      setIsSearching(true);
      const patient = await patientsApi.scanBarcode(manualId.trim());
      onPatientFound(patient);
      toast.success(`Pasien ditemukan: ${patient.nama}`);
      setManualId('');
    } catch (error: any) {
      console.error('Error searching patient:', error);
      const errorMessage = error?.response?.data?.pesan || 'ID pasien tidak valid atau tidak ditemukan';
      toast.error(errorMessage);
      onError?.(errorMessage);
    } finally {
      setIsSearching(false);
    }
  };

  const startScanning = () => {
    setIsScanning(true);
    setScannerMode('camera');
  };

  const stopScanning = async () => {
    if (scannerRef.current) {
      await scannerRef.current.clear();
    }
    setIsScanning(false);
  };

  const switchToManual = () => {
    if (scannerRef.current) {
      scannerRef.current.clear().catch(console.error);
    }
    setIsScanning(false);
    setScannerMode('manual');
  };

  const switchToCamera = () => {
    setScannerMode('camera');
    setManualId('');
  };

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Scanner Barcode Pasien
          </h3>
          <p className="text-sm text-gray-600">
            Pindai barcode pasien atau masukkan ID secara manual
          </p>
        </div>

        {/* Mode Selection */}
        <div className="flex justify-center space-x-3">
          <Button
            onClick={switchToCamera}
            variant={scannerMode === 'camera' ? 'default' : 'outline'}
            className={scannerMode === 'camera' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            📷 Kamera
          </Button>
          <Button
            onClick={switchToManual}
            variant={scannerMode === 'manual' ? 'default' : 'outline'}
            className={scannerMode === 'manual' ? 'bg-blue-600 hover:bg-blue-700' : ''}
          >
            ⌨️ Manual
          </Button>
        </div>

        {/* Camera Scanner Mode */}
        {scannerMode === 'camera' && (
          <div className="space-y-4">
            {!isScanning ? (
              <div className="text-center">
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
                  <div className="text-6xl mb-4">📷</div>
                  <p className="text-gray-600 mb-4">
                    Klik tombol di bawah untuk memulai scanning
                  </p>
                  <Button 
                    onClick={startScanning}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Mulai Scan
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div 
                  id="barcode-scanner" 
                  ref={scannerElementRef}
                  className="w-full"
                />
                <div className="flex justify-center space-x-3">
                  <Button 
                    onClick={stopScanning}
                    variant="outline"
                    className="border-red-600 text-red-600 hover:bg-red-50"
                  >
                    Berhenti Scan
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Manual Input Mode */}
        {scannerMode === 'manual' && (
          <div className="space-y-4">
            <div className="text-center">
              <div className="text-4xl mb-4">⌨️</div>
              <p className="text-gray-600 mb-4">
                Masukkan ID pasien secara manual
              </p>
            </div>
            
            <div className="space-y-3">
              <Input
                type="text"
                placeholder="Masukkan ID pasien (contoh: PSN001)"
                value={manualId}
                onChange={(e) => setManualId(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleManualSearch();
                  }
                }}
                className="text-center"
              />
              <div className="flex justify-center">
                <Button 
                  onClick={handleManualSearch}
                  disabled={isSearching || !manualId.trim()}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  {isSearching ? (
                    <>
                      <Loading size="sm" className="mr-2" />
                      Mencari...
                    </>
                  ) : (
                    'Cari Pasien'
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Loading State */}
        {isSearching && (
          <div className="text-center">
            <Loading size="lg" />
            <p className="text-sm text-gray-600 mt-2">
              Mencari data pasien...
            </p>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 space-y-1">
          <p className="font-medium">Petunjuk:</p>
          <p>• Pastikan barcode terlihat jelas di kamera</p>
          <p>• Gunakan pencahayaan yang cukup</p>
          <p>• Jika scanning gagal, gunakan input manual</p>
          <p>• ID pasien biasanya berformat PSN001, PSN002, dst.</p>
        </div>
      </div>
    </Card>
  );
}