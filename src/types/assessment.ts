// Health assessment related types

export type AssessmentCategory = 'normal' | 'perlu_perhatian' | 'rujukan';

export interface HealthAssessment {
  id: number;
  id_pasien: number | string;
  id_pemeriksaan_fisik?: number;
  id_tes_lanjutan?: number;
  kategori_penilaian: AssessmentCategory;
  temuan?: string;
  rekomendasi?: string;
  tanggal_penilaian: string;
  dinilai_oleh: number;
}

export interface HealthAssessmentData {
  id_pasien: number;
  id_pemeriksaan_fisik?: number;
  id_tes_lanjutan?: number;
  kategori_penilaian: AssessmentCategory;
  temuan?: string;
  rekomendasi?: string;
}

export interface AssessmentWithDetails extends HealthAssessment {
  nama_pasien: string;
  admin_nama: string;
  pemeriksaan_fisik?: {
    tinggi_badan?: number;
    berat_badan?: number;
    tekanan_darah_sistolik?: number;
    tekanan_darah_diastolik?: number;
  };
  tes_lanjutan?: {
    gula_darah?: number;
  };
}