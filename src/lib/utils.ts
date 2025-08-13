// Utility functions
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility function to merge Tailwind CSS classes
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format date to Indonesian locale
 */
export function formatDate(date: string | Date, options?: Intl.DateTimeFormatOptions): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    ...options,
  };

  return dateObj.toLocaleDateString('id-ID', defaultOptions);
}

/**
 * Format date and time to Indonesian locale
 */
export function formatDateTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleString('id-ID', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format time only
 */
export function formatTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  
  return dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: string | Date): number {
  const birth = typeof birthDate === 'string' ? new Date(birthDate) : birthDate;
  const today = new Date();
  
  let age = today.getFullYear() - birth.getFullYear();
  const monthDiff = today.getMonth() - birth.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format phone number to Indonesian format
 */
export function formatPhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const cleaned = phone.replace(/\D/g, '');
  
  // Convert to Indonesian format
  if (cleaned.startsWith('62')) {
    return `+${cleaned}`;
  } else if (cleaned.startsWith('0')) {
    return `+62${cleaned.slice(1)}`;
  } else {
    return `+62${cleaned}`;
  }
}

/**
 * Check if NIK format is valid (16 digits)
 */
export function isValidNIK(nik: string): boolean {
  const cleaned = nik.replace(/\D/g, '');
  return cleaned.length === 16;
}

/**
 * Check if KK format is valid (16 digits)
 */
export function isValidKK(kk: string): boolean {
  const cleaned = kk.replace(/\D/g, '');
  return cleaned.length === 16;
}

/**
 * Check if phone number format is valid
 */
export function isValidPhoneNumber(phone: string): boolean {
  const cleaned = phone.replace(/\D/g, '');
  return cleaned.length >= 10 && cleaned.length <= 15;
}

/**
 * Format blood pressure reading
 */
export function formatBloodPressure(systolic?: number, diastolic?: number): string {
  if (!systolic || !diastolic) return '-';
  return `${systolic}/${diastolic} mmHg`;
}

/**
 * Get blood pressure category
 */
export function getBloodPressureCategory(systolic?: number, diastolic?: number): {
  category: string;
  color: string;
} {
  if (!systolic || !diastolic) {
    return { category: 'Tidak diketahui', color: 'gray' };
  }

  if (systolic < 120 && diastolic < 80) {
    return { category: 'Normal', color: 'green' };
  } else if (systolic < 130 && diastolic < 80) {
    return { category: 'Tinggi Normal', color: 'yellow' };
  } else if (systolic < 140 || diastolic < 90) {
    return { category: 'Hipertensi Tingkat 1', color: 'orange' };
  } else {
    return { category: 'Hipertensi Tingkat 2', color: 'red' };
  }
}

/**
 * Get BMI category
 */
export function getBMICategory(height?: number, weight?: number): {
  bmi: number | null;
  category: string;
  color: string;
} {
  if (!height || !weight) {
    return { bmi: null, category: 'Tidak diketahui', color: 'gray' };
  }

  const heightInMeters = height / 100;
  const bmi = weight / (heightInMeters * heightInMeters);

  if (bmi < 18.5) {
    return { bmi, category: 'Kurus', color: 'blue' };
  } else if (bmi < 25) {
    return { bmi, category: 'Normal', color: 'green' };
  } else if (bmi < 30) {
    return { bmi, category: 'Gemuk', color: 'yellow' };
  } else {
    return { bmi, category: 'Obesitas', color: 'red' };
  }
}

/**
 * Get blood sugar category
 */
export function getBloodSugarCategory(bloodSugar?: number): {
  category: string;
  color: string;
} {
  if (!bloodSugar) {
    return { category: 'Tidak diketahui', color: 'gray' };
  }

  if (bloodSugar < 100) {
    return { category: 'Normal', color: 'green' };
  } else if (bloodSugar < 126) {
    return { category: 'Prediabetes', color: 'yellow' };
  } else {
    return { category: 'Diabetes', color: 'red' };
  }
}

/**
 * Debounce function for search inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Generate random ID for temporary use
 */
export function generateTempId(): string {
  return Math.random().toString(36).substr(2, 9);
}

/**
 * Capitalize first letter of each word
 */
export function capitalizeWords(str: string): string {
  return str.replace(/\w\S*/g, (txt) => 
    txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
  );
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + '...';
}

/**
 * Format file size
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if date is today
 */
export function isToday(date: string | Date): boolean {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  
  return dateObj.toDateString() === today.toDateString();
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return 'Baru saja';
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return `${minutes} menit yang lalu`;
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return `${hours} jam yang lalu`;
  } else if (diffInSeconds < 2592000) {
    const days = Math.floor(diffInSeconds / 86400);
    return `${days} hari yang lalu`;
  } else {
    return formatDate(dateObj);
  }
}

/**
 * Format relative time (alias for getRelativeTime for consistency)
 */
export function formatRelativeTime(date: string | Date): string {
  return getRelativeTime(date);
}