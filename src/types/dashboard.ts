// Dashboard related types

export interface DashboardStatistics {
  totalPasien: number;
  pemeriksaanHariIni: number;
  tesHariIni: number;
  penilaianHariIni: number;
  rujukanTertunda: number;
  pasienPerluPerhatian: number;
  trendBulanan: MonthlyTrend[];
}

export interface MonthlyTrend {
  bulan: number;
  tahun: number;
  jumlah_pemeriksaan: number;
}

export interface RecentActivity {
  jenis: 'pemeriksaan_fisik' | 'tes_lanjutan' | 'penilaian_kesehatan' | 'pengobatan' | 'rujukan';
  id: number;
  nama_pasien: string;
  id_pasien: string;
  admin_nama: string;
  waktu: string;
  deskripsi: string;
}

export interface PendingFollowUp {
  id: number;
  id_pasien: string;
  nama: string;
  nomor_hp?: string;
  kategori_penilaian?: string;
  temuan?: string;
  rekomendasi?: string;
  tanggal_penilaian?: string;
  hari_sejak_penilaian?: number;
  prioritas: 'Tinggi' | 'Sedang' | 'Rendah';
  status_rujukan?: string;
  fasilitas_rujukan?: string;
  pemeriksaan_terakhir?: string;
  hari_sejak_pemeriksaan?: number;
  jenis_tindak_lanjut?: string;
}

export interface PendingFollowUps {
  penilaian_tertunda: PendingFollowUp[];
  pemeriksaan_tertunda: PendingFollowUp[];
}