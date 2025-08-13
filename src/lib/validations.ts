// Validation utilities and schemas
import { VALIDATION_RULES } from './constants';

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

export interface FieldValidationResult {
  isValid: boolean;
  error?: string;
}

/**
 * Validate NIK (Indonesian National ID)
 */
export function validateNIK(nik: string): FieldValidationResult {
  if (!nik) {
    return { isValid: false, error: 'NIK wajib diisi' };
  }
  
  const cleaned = nik.replace(/\D/g, '');
  
  if (cleaned.length !== VALIDATION_RULES.NIK_LENGTH) {
    return { isValid: false, error: `NIK harus ${VALIDATION_RULES.NIK_LENGTH} digit` };
  }
  
  return { isValid: true };
}

/**
 * Validate KK (Family Card Number)
 */
export function validateKK(kk: string): FieldValidationResult {
  if (!kk) {
    return { isValid: false, error: 'Nomor KK wajib diisi' };
  }
  
  const cleaned = kk.replace(/\D/g, '');
  
  if (cleaned.length !== VALIDATION_RULES.KK_LENGTH) {
    return { isValid: false, error: `Nomor KK harus ${VALIDATION_RULES.KK_LENGTH} digit` };
  }
  
  return { isValid: true };
}

/**
 * Validate phone number
 */
export function validatePhoneNumber(phone: string): FieldValidationResult {
  if (!phone) {
    return { isValid: true }; // Phone is optional
  }
  
  const cleaned = phone.replace(/\D/g, '');
  
  if (cleaned.length < VALIDATION_RULES.PHONE_MIN_LENGTH || 
      cleaned.length > VALIDATION_RULES.PHONE_MAX_LENGTH) {
    return { 
      isValid: false, 
      error: `Nomor HP harus ${VALIDATION_RULES.PHONE_MIN_LENGTH}-${VALIDATION_RULES.PHONE_MAX_LENGTH} digit` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate email
 */
export function validateEmail(email: string): FieldValidationResult {
  if (!email) {
    return { isValid: true }; // Email is optional
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Format email tidak valid' };
  }
  
  return { isValid: true };
}

/**
 * Validate required field
 */
export function validateRequired(value: string, fieldName: string): FieldValidationResult {
  if (!value || value.trim() === '') {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }
  
  return { isValid: true };
}

/**
 * Validate date
 */
export function validateDate(date: string, fieldName: string): FieldValidationResult {
  if (!date) {
    return { isValid: false, error: `${fieldName} wajib diisi` };
  }
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} tidak valid` };
  }
  
  return { isValid: true };
}

/**
 * Validate birth date (must be in the past)
 */
export function validateBirthDate(date: string): FieldValidationResult {
  const dateValidation = validateDate(date, 'Tanggal lahir');
  if (!dateValidation.isValid) {
    return dateValidation;
  }
  
  const birthDate = new Date(date);
  const today = new Date();
  
  if (birthDate >= today) {
    return { isValid: false, error: 'Tanggal lahir harus di masa lalu' };
  }
  
  // Check if age is reasonable (not more than 150 years)
  const age = today.getFullYear() - birthDate.getFullYear();
  if (age > 150) {
    return { isValid: false, error: 'Tanggal lahir tidak valid' };
  }
  
  return { isValid: true };
}

/**
 * Validate blood pressure
 */
export function validateBloodPressure(
  systolic?: number, 
  diastolic?: number
): FieldValidationResult {
  if (systolic !== undefined) {
    if (systolic < VALIDATION_RULES.BLOOD_PRESSURE.SYSTOLIC.min || 
        systolic > VALIDATION_RULES.BLOOD_PRESSURE.SYSTOLIC.max) {
      return { 
        isValid: false, 
        error: `Tekanan darah sistolik harus antara ${VALIDATION_RULES.BLOOD_PRESSURE.SYSTOLIC.min}-${VALIDATION_RULES.BLOOD_PRESSURE.SYSTOLIC.max} mmHg` 
      };
    }
  }
  
  if (diastolic !== undefined) {
    if (diastolic < VALIDATION_RULES.BLOOD_PRESSURE.DIASTOLIC.min || 
        diastolic > VALIDATION_RULES.BLOOD_PRESSURE.DIASTOLIC.max) {
      return { 
        isValid: false, 
        error: `Tekanan darah diastolik harus antara ${VALIDATION_RULES.BLOOD_PRESSURE.DIASTOLIC.min}-${VALIDATION_RULES.BLOOD_PRESSURE.DIASTOLIC.max} mmHg` 
      };
    }
  }
  
  if (systolic && diastolic && systolic <= diastolic) {
    return { 
      isValid: false, 
      error: 'Tekanan darah sistolik harus lebih tinggi dari diastolik' 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate height
 */
export function validateHeight(height?: number): FieldValidationResult {
  if (height === undefined) {
    return { isValid: true };
  }
  
  if (height < VALIDATION_RULES.HEIGHT.min || height > VALIDATION_RULES.HEIGHT.max) {
    return { 
      isValid: false, 
      error: `Tinggi badan harus antara ${VALIDATION_RULES.HEIGHT.min}-${VALIDATION_RULES.HEIGHT.max} cm` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate weight
 */
export function validateWeight(weight?: number): FieldValidationResult {
  if (weight === undefined) {
    return { isValid: true };
  }
  
  if (weight < VALIDATION_RULES.WEIGHT.min || weight > VALIDATION_RULES.WEIGHT.max) {
    return { 
      isValid: false, 
      error: `Berat badan harus antara ${VALIDATION_RULES.WEIGHT.min}-${VALIDATION_RULES.WEIGHT.max} kg` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate waist circumference
 */
export function validateWaistCircumference(waist?: number): FieldValidationResult {
  if (waist === undefined) {
    return { isValid: true };
  }
  
  if (waist < VALIDATION_RULES.WAIST_CIRCUMFERENCE.min || 
      waist > VALIDATION_RULES.WAIST_CIRCUMFERENCE.max) {
    return { 
      isValid: false, 
      error: `Lingkar perut harus antara ${VALIDATION_RULES.WAIST_CIRCUMFERENCE.min}-${VALIDATION_RULES.WAIST_CIRCUMFERENCE.max} cm` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate blood sugar
 */
export function validateBloodSugar(bloodSugar?: number): FieldValidationResult {
  if (bloodSugar === undefined) {
    return { isValid: true };
  }
  
  if (bloodSugar < VALIDATION_RULES.BLOOD_SUGAR.min || 
      bloodSugar > VALIDATION_RULES.BLOOD_SUGAR.max) {
    return { 
      isValid: false, 
      error: `Kadar gula darah harus antara ${VALIDATION_RULES.BLOOD_SUGAR.min}-${VALIDATION_RULES.BLOOD_SUGAR.max} mg/dL` 
    };
  }
  
  return { isValid: true };
}

/**
 * Validate patient registration data
 */
export function validatePatientRegistration(data: {
  nama: string;
  nik: string;
  nomor_kk: string;
  tanggal_lahir: string;
  nomor_hp?: string;
}): ValidationResult {
  const errors: string[] = [];
  
  // Validate required fields
  const namaValidation = validateRequired(data.nama, 'Nama');
  if (!namaValidation.isValid) errors.push(namaValidation.error!);
  
  const nikValidation = validateNIK(data.nik);
  if (!nikValidation.isValid) errors.push(nikValidation.error!);
  
  const kkValidation = validateKK(data.nomor_kk);
  if (!kkValidation.isValid) errors.push(kkValidation.error!);
  
  const birthDateValidation = validateBirthDate(data.tanggal_lahir);
  if (!birthDateValidation.isValid) errors.push(birthDateValidation.error!);
  
  // Validate optional fields
  if (data.nomor_hp) {
    const phoneValidation = validatePhoneNumber(data.nomor_hp);
    if (!phoneValidation.isValid) errors.push(phoneValidation.error!);
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate login credentials
 */
export function validateLoginCredentials(data: {
  nama_pengguna: string;
  kata_sandi: string;
}): ValidationResult {
  const errors: string[] = [];
  
  const usernameValidation = validateRequired(data.nama_pengguna, 'Nama pengguna');
  if (!usernameValidation.isValid) errors.push(usernameValidation.error!);
  
  const passwordValidation = validateRequired(data.kata_sandi, 'Kata sandi');
  if (!passwordValidation.isValid) errors.push(passwordValidation.error!);
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}