// Core data types for Posyandu Lansia application

export interface Patient {
  id: number;
  qrCode: string;
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  photoUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface HealthRecord {
  id: number;
  patientId: number;
  examinationDate: string;
  height?: number;
  weight?: number;
  bmi?: number;
  systolicBp?: number;
  diastolicBp?: number;
  uricAcid?: number;
  bloodSugar?: number;
  cholesterol?: number;
  examinedBy: number;
  notes?: string;
  createdAt: string;
}

export interface PrescriptionItem {
  id: number;
  medicineName: string;
  dosage: string;
  frequency: string;
  specialInstructions?: string;
}

export interface Prescription {
  id: number;
  patientId: number;
  healthRecordId?: number;
  prescribedBy: number;
  prescriptionDate: string;
  notes?: string;
  items: PrescriptionItem[];
}

export interface Referral {
  id: number;
  patientId: number;
  healthRecordId?: number;
  referredBy: number;
  referralDate: string;
  destination: string;
  reason: string;
  recommendations?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  role: 'admin' | 'health_worker';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

// Form types
export interface PatientRegistrationForm {
  fullName: string;
  dateOfBirth: string;
  address: string;
  phoneNumber?: string;
  photo?: string;
}

export interface PhysicalExamForm {
  height: number;
  weight: number;
  systolicBp: number;
  diastolicBp: number;
  notes?: string;
}

export interface AdvancedExamForm {
  uricAcid: number;
  bloodSugar: number;
  cholesterol: number;
  notes?: string;
}

export interface PrescriptionForm {
  items: {
    medicineName: string;
    dosage: string;
    frequency: string;
    specialInstructions?: string;
  }[];
  notes?: string;
}

export interface ReferralForm {
  destination: string;
  reason: string;
  recommendations?: string;
}

export interface LoginForm {
  username: string;
  password: string;
}

// Chart data types
export interface ChartDataPoint {
  value: number;
  label?: string;
  date: string;
}

export interface HealthTrendData {
  bloodPressure: {
    systolic: ChartDataPoint[];
    diastolic: ChartDataPoint[];
  };
  bloodSugar: ChartDataPoint[];
  uricAcid: ChartDataPoint[];
  cholesterol: ChartDataPoint[];
  bmi: ChartDataPoint[];
}

// Offline sync types
export interface OfflineQueueItem {
  id: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE';
  endpoint: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

// Navigation types
export type RootStackParamList = {
  Login: undefined;
  Home: undefined;
  PatientRegistration: undefined;
  QRScanner: undefined;
  PatientProfile: { patientId: number };
  PhysicalExam: { patientId: number };
  AdvancedExam: { patientId: number };
  Treatment: { patientId: number; healthRecordId?: number };
  Settings: undefined;
};

// Constants
export const HEALTH_RANGES = {
  BMI: {
    UNDERWEIGHT: { min: 0, max: 18.5 },
    NORMAL: { min: 18.5, max: 24.9 },
    OVERWEIGHT: { min: 25, max: 29.9 },
    OBESE: { min: 30, max: 100 }
  },
  BLOOD_PRESSURE: {
    SYSTOLIC: {
      NORMAL: { min: 90, max: 120 },
      ELEVATED: { min: 120, max: 129 },
      HIGH_STAGE_1: { min: 130, max: 139 },
      HIGH_STAGE_2: { min: 140, max: 180 },
      CRISIS: { min: 180, max: 300 }
    },
    DIASTOLIC: {
      NORMAL: { min: 60, max: 80 },
      ELEVATED: { min: 80, max: 80 },
      HIGH_STAGE_1: { min: 80, max: 89 },
      HIGH_STAGE_2: { min: 90, max: 120 },
      CRISIS: { min: 120, max: 200 }
    }
  },
  BLOOD_SUGAR: {
    NORMAL: { min: 70, max: 100 },
    PREDIABETES: { min: 100, max: 125 },
    DIABETES: { min: 126, max: 500 }
  },
  URIC_ACID: {
    NORMAL_MALE: { min: 3.4, max: 7.0 },
    NORMAL_FEMALE: { min: 2.4, max: 6.0 },
    HIGH: { min: 7.0, max: 15.0 }
  },
  CHOLESTEROL: {
    DESIRABLE: { min: 100, max: 200 },
    BORDERLINE: { min: 200, max: 239 },
    HIGH: { min: 240, max: 400 }
  }
} as const;