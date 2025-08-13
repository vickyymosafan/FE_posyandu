'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loading } from '@/components/ui/loading';
import { patientsApi } from '@/lib/api/patients';
import { Patient } from '@/types/patient';
import toast from 'react-hot-toast';

interface PatientBarcodeProps {
  patient: Patient;
}

export default function PatientBarcode({ patient }: PatientBarcodeProps) {
  const [barcodeUrl, setBarcodeUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Check if barcode already exists when component mounts
  useEffect(() => {
    const loadExistingBarcode = async () => {
      // Check if patient already has a barcode path or try to load existing barcode
      if (patient.path_barcode) {
        // If patient has barcode path, try to load it
        await loadBarcodeImage();
      } else {
        // Try to check if barcode exists by attempting to fetch it
        try {
          setIsLoading(true);
          const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
          const imageResponse = await fetch(`${baseUrl}/pasien/${patient.id}/barcode?format=png&download=true`, {
            credentials: 'include',
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
          });

          if (imageResponse.ok) {
            const blob = await imageResponse.blob();
            const objectUrl = URL.createObjectURL(blob);
            setBarcodeUrl(objectUrl);
          }
        } catch (error) {
          // Barcode doesn't exist yet, which is fine
          console.log('No existing barcode found');
        } finally {
          setIsLoading(false);
        }
      }
    };

    loadExistingBarcode();
  }, [patient.id, patient.path_barcode]);

  const loadBarcodeImage = async () => {
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const imageResponse = await fetch(`${baseUrl}/pasien/${patient.id}/barcode?format=png&download=true`, {
        credentials: 'include',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });

      if (imageResponse.ok) {
        const blob = await imageResponse.blob();
        const objectUrl = URL.createObjectURL(blob);
        setBarcodeUrl(objectUrl);
      } else {
        // Fallback to direct URL if fetch fails
        const barcodeImageUrl = `${baseUrl}/pasien/${patient.id}/barcode?format=png&download=true`;
        setBarcodeUrl(barcodeImageUrl);
      }
    } catch (fetchError) {
      // Fallback to direct URL if fetch fails
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';
      const barcodeImageUrl = `${baseUrl}/pasien/${patient.id}/barcode?format=png&download=true`;
      setBarcodeUrl(barcodeImageUrl);
    }
  };

  const generateBarcode = async () => {
    try {
      setIsGenerating(true);
      await patientsApi.generateBarcode(patient.id);

      // Load the barcode image after generation
      await loadBarcodeImage();

      toast.success('Barcode berhasil dibuat');
    } catch (error) {
      console.error('Error generating barcode:', error);
      toast.error('Gagal membuat barcode');
    } finally {
      setIsGenerating(false);
    }
  };

  const downloadBarcode = async (format: 'png' | 'pdf') => {
    try {
      setIsDownloading(true);
      await patientsApi.downloadBarcode(patient.id, format);
      toast.success(`Barcode ${format.toUpperCase()} berhasil diunduh`);
    } catch (error) {
      console.error('Error downloading barcode:', error);
      toast.error('Gagal mengunduh barcode');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div className="text-center">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Barcode Pasien
          </h3>
          <p className="text-sm text-gray-600">
            ID Pasien: {patient.id_pasien}
          </p>
          <p className="text-sm text-gray-600">
            Nama: {patient.nama}
          </p>
        </div>

        {/* Barcode Display */}
        <div className="flex justify-center">
          {isLoading ? (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <Loading size="sm" className="mb-2" />
              <p className="text-gray-500">Memuat barcode...</p>
            </div>
          ) : barcodeUrl ? (
            <div className="border-2 border-gray-200 rounded-lg p-4 bg-white">
              <img
                src={barcodeUrl}
                alt={`Barcode untuk ${patient.nama}`}
                className="max-w-full h-auto"
              />
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500 mb-4">Barcode belum dibuat</p>
              <Button
                onClick={generateBarcode}
                disabled={isGenerating}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isGenerating ? (
                  <>
                    <Loading size="sm" className="mr-2" />
                    Membuat Barcode...
                  </>
                ) : (
                  'Buat Barcode'
                )}
              </Button>
            </div>
          )}
        </div>

        {/* Download Options */}
        {barcodeUrl && (
          <div className="flex justify-center space-x-3">
            <Button
              onClick={() => downloadBarcode('png')}
              disabled={isDownloading}
              variant="outline"
              className="border-green-600 text-green-600 hover:bg-green-50"
            >
              {isDownloading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Mengunduh...
                </>
              ) : (
                'Unduh PNG'
              )}
            </Button>
            <Button
              onClick={() => downloadBarcode('pdf')}
              disabled={isDownloading}
              variant="outline"
              className="border-red-600 text-red-600 hover:bg-red-50"
            >
              {isDownloading ? (
                <>
                  <Loading size="sm" className="mr-2" />
                  Mengunduh...
                </>
              ) : (
                'Unduh PDF'
              )}
            </Button>
          </div>
        )}

        {/* Instructions */}
        <div className="text-xs text-gray-500 text-center space-y-1">
          <p>• Barcode berisi ID unik pasien untuk identifikasi cepat</p>
          <p>• Gunakan scanner barcode untuk mengakses profil pasien</p>
          <p>• Simpan barcode dalam format PNG atau PDF</p>
        </div>
      </div>
    </Card>
  );
}