// Application constants

export const APP_CONFIG = {
  name: process.env.NEXT_PUBLIC_APP_NAME || 'Sistem Manajemen Posyandu',
  version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api',
};

export const ROUTES = {
  // Auth routes
  LOGIN: '/login',
  LOGOUT: '/logout',
  
  // Main routes
  DASHBOARD: '/dashboard',
  PATIENTS: '/pasien',
  EXAMINATIONS: '/pemeriksaan',
  TESTS: '/tes-lanjutan',
  ASSESSMENTS: '/penilaian',
  TREATMENTS: '/pengobatan',
  REFERRALS: '/rujukan',
  SCAN: '/scan',
  
  // Patient sub-routes
  PATIENT_DETAIL: (id: string | number) => `/pasien/${id}`,
  PATIENT_EDIT: (id: string | number) => `/pasien/${id}/edit`,
  PATIENT_BARCODE: (id: string | number) => `/pasien/${id}/barcode`,
} as const;

export const VALIDATION_RULES = {
  NIK_LENGTH: 16,
  KK_LENGTH: 16,
  PHONE_MIN_LENGTH: 10,
  PHONE_MAX_LENGTH: 15,
  PASSWORD_MIN_LENGTH: 6,
  
  // Medical ranges
  BLOOD_PRESSURE: {
    SYSTOLIC: { min: 70, max: 250 },
    DIASTOLIC: { min: 40, max: 150 },
  },
  HEIGHT: { min: 100, max: 250 }, // cm
  WEIGHT: { min: 20, max: 200 }, // kg
  WAIST_CIRCUMFERENCE: { min: 50, max: 200 }, // cm
  BLOOD_SUGAR: { min: 50, max: 500 }, // mg/dL
} as const;

export const HEALTH_CATEGORIES = {
  NORMAL: 'normal',
  NEEDS_ATTENTION: 'perlu_perhatian',
  REFERRAL: 'rujukan',
} as const;

export const REFERRAL_STATUS = {
  PENDING: 'menunggu',
  COMPLETED: 'selesai',
  CANCELLED: 'dibatalkan',
} as const;

export const PRIORITY_LEVELS = {
  HIGH: 'Tinggi',
  MEDIUM: 'Sedang',
  LOW: 'Rendah',
} as const;

export const ACTIVITY_TYPES = {
  PHYSICAL_EXAM: 'pemeriksaan_fisik',
  ADVANCED_TEST: 'tes_lanjutan',
  HEALTH_ASSESSMENT: 'penilaian_kesehatan',
  TREATMENT: 'pengobatan',
  REFERRAL: 'rujukan',
} as const;

export const DATE_FORMATS = {
  DISPLAY: 'dd MMMM yyyy',
  DISPLAY_WITH_TIME: 'dd MMMM yyyy HH:mm',
  INPUT: 'yyyy-MM-dd',
  API: 'yyyy-MM-dd HH:mm:ss',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
} as const;

export const STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER_PREFERENCES: 'userPreferences',
} as const;

export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Terjadi kesalahan jaringan. Silakan coba lagi.',
  UNAUTHORIZED: 'Sesi Anda telah berakhir. Silakan login kembali.',
  FORBIDDEN: 'Anda tidak memiliki akses untuk melakukan tindakan ini.',
  NOT_FOUND: 'Data yang dicari tidak ditemukan.',
  SERVER_ERROR: 'Terjadi kesalahan server. Silakan coba lagi nanti.',
  VALIDATION_ERROR: 'Data yang dimasukkan tidak valid.',
} as const;

export const SUCCESS_MESSAGES = {
  PATIENT_CREATED: 'Pasien berhasil didaftarkan.',
  PATIENT_UPDATED: 'Data pasien berhasil diperbarui.',
  PATIENT_DELETED: 'Pasien berhasil dihapus.',
  EXAMINATION_SAVED: 'Hasil pemeriksaan berhasil disimpan.',
  ASSESSMENT_SAVED: 'Penilaian kesehatan berhasil disimpan.',
  TREATMENT_SAVED: 'Resep pengobatan berhasil disimpan.',
  REFERRAL_SAVED: 'Rujukan berhasil dibuat.',
  LOGIN_SUCCESS: 'Login berhasil.',
  LOGOUT_SUCCESS: 'Logout berhasil.',
} as const;