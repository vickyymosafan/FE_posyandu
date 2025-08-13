// Examination related types

export interface PhysicalExamination {
  id: number;
  id_pasien: number;
  tinggi_badan?: number;
  berat_badan?: number;
  lingkar_perut?: number;
  tekanan_darah_sistolik?: number;
  tekanan_darah_diastolik?: number;
  tanggal_pemeriksaan: string;
  diperiksa_oleh: number;
  catatan?: string;
}

export interface PhysicalExaminationData {
  id_pasien: number;
  tinggi_badan?: number;
  berat_badan?: number;
  lingkar_perut?: number;
  tekanan_darah_sistolik?: number;
  tekanan_darah_diastolik?: number;
  catatan?: string;
}

export interface AdvancedTest {
  id: number;
  id_pasien: number;
  gula_darah?: number;
  tanggal_tes: string;
  dites_oleh: number;
  catatan?: string;
}

export interface AdvancedTestData {
  id_pasien: number;
  gula_darah?: number;
  catatan?: string;
}

export interface ExaminationHistory {
  pemeriksaan_fisik: PhysicalExamination[];
  tes_lanjutan: AdvancedTest[];
}