// Patient related types

export interface Patient {
  id: number;
  id_pasien: string;
  nama: string;
  nik: string;
  nomor_kk: string;
  tanggal_lahir: string;
  nomor_hp?: string;
  alamat?: string;
  path_barcode?: string;
  dibuat_pada: string;
  diperbarui_pada: string;
  dibuat_oleh: number;
}

export interface PatientRegistrationData {
  nama: string;
  nik: string;
  nomor_kk: string;
  tanggal_lahir: string;
  nomor_hp?: string;
  alamat?: string;
}

export interface PatientSearchParams {
  query?: string;
  page?: number;
  limit?: number;
}

export interface PatientListResponse {
  sukses: boolean;
  pesan: string;
  data: {
    pasien: Patient[];
    pagination: {
      currentPage: number;
      totalPages: number;
      totalItems: number;
      itemsPerPage: number;
    };
  };
}

export interface BarcodeResponse {
  sukses: boolean;
  pesan: string;
  data: {
    barcode_path: any;
    barcode_url: string;
    download_url: string;
  };
}

export interface BarcodeScanRequest {
  barcode: string;
}

export interface BarcodeScanResponse {
  sukses: boolean;
  pesan: string;
  data: Patient;
}

export interface BarcodeDownloadOptions {
  format: 'png' | 'pdf';
  patientId: number;
}