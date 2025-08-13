// Referral related types

export type ReferralStatus = 'menunggu' | 'selesai' | 'dibatalkan';

export interface Referral {
  id: number;
  id_pasien: number;
  id_penilaian?: number;
  nama_fasilitas: string;
  alasan: string;
  tanggal_rujukan: string;
  dirujuk_oleh: number;
  status: ReferralStatus;
}

export interface ReferralData {
  id_pasien: number;
  id_penilaian?: number;
  nama_fasilitas: string;
  alasan: string;
}

export interface ReferralWithDetails extends Referral {
  nama_pasien: string;
  admin_nama: string;
  kategori_penilaian?: string;
}