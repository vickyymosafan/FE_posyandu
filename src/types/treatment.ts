// Treatment related types

export interface Treatment {
  id: number;
  id_pasien: number;
  id_penilaian?: number;
  nama_obat?: string;
  dosis?: string;
  frekuensi?: string;
  durasi?: string;
  instruksi?: string;
  tanggal_resep: string;
  diresepkan_oleh: number;
}

export interface TreatmentData {
  id_pasien: number;
  id_penilaian?: number;
  nama_obat?: string;
  dosis?: string;
  frekuensi?: string;
  durasi?: string;
  instruksi?: string;
}

export interface TreatmentWithDetails extends Treatment {
  nama_pasien: string;
  admin_nama: string;
  kategori_penilaian?: string;
}