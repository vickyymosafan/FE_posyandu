// Patient API functions
import apiClient from '@/lib/api';
import {
  Patient,
  PatientRegistrationData,
  PatientListResponse,
  PatientSearchParams,
  BarcodeResponse
} from '@/types/patient';

// Custom interface for paginated API response
interface PaginatedApiResponse<T> {
  sukses: boolean;
  pesan: string;
  data: T;
  pagination: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    itemsPerPage: number;
    hasNextPage: boolean;
    hasPrevPage: boolean;
  };
}

export const patientsApi = {
  /**
   * Get all patients with pagination and search
   */
  getPatients: async (params?: PatientSearchParams): Promise<PatientListResponse> => {
    const queryParams = new URLSearchParams();

    if (params?.query) queryParams.append('search', params.query);
    if (params?.page) queryParams.append('page', params.page.toString());
    if (params?.limit) queryParams.append('limit', params.limit.toString());

    const response = await apiClient.get<Patient[]>(
      `/pasien?${queryParams.toString()}`
    ) as PaginatedApiResponse<Patient[]>;

    return {
      sukses: response.sukses,
      pesan: response.pesan,
      data: {
        pasien: response.data || [],
        pagination: response.pagination || {
          currentPage: 1,
          totalPages: 1,
          totalItems: 0,
          itemsPerPage: 10,
          hasNextPage: false,
          hasPrevPage: false
        }
      },
    };
  },

  /**
   * Get patient by ID
   */
  getPatient: async (id: number): Promise<Patient> => {
    const response = await apiClient.get<Patient>(`/pasien/${id}`);
    return response.data!;
  },

  /**
   * Create new patient
   */
  createPatient: async (data: PatientRegistrationData): Promise<Patient> => {
    const response = await apiClient.post<Patient>('/pasien', data);
    return response.data!;
  },

  /**
   * Update patient
   */
  updatePatient: async (id: number, data: Partial<PatientRegistrationData>): Promise<Patient> => {
    const response = await apiClient.put<Patient>(`/pasien/${id}`, data);
    return response.data!;
  },

  /**
   * Delete patient
   */
  deletePatient: async (id: number): Promise<void> => {
    await apiClient.delete(`/pasien/${id}`);
  },

  /**
   * Generate patient barcode
   */
  generateBarcode: async (id: number): Promise<BarcodeResponse> => {
    const response = await apiClient.get<BarcodeResponse['data']>(`/pasien/${id}/barcode`);
    return {
      sukses: response.sukses,
      pesan: response.pesan,
      data: response.data!,
    };
  },

  /**
   * Download patient barcode
   */
  downloadBarcode: async (id: number, format: 'png' | 'pdf' = 'png'): Promise<void> => {
    if (format === 'pdf') {
      await apiClient.downloadFile(`/pasien/${id}/barcode/pdf`, `barcode-${id}.pdf`);
    } else {
      await apiClient.downloadFile(`/pasien/${id}/barcode?format=png&download=true`, `barcode-${id}.png`);
    }
  },

  /**
   * Scan barcode to get patient
   */
  scanBarcode: async (barcodeData: string): Promise<Patient> => {
    try {
      const response = await apiClient.post<Patient>('/barcode/scan', { barcode: barcodeData });
      return response.data!;
    } catch (error: any) {
      // Enhanced error handling for barcode scanning
      if (error.message?.includes('tidak ditemukan') || error.message?.includes('not found')) {
        throw new Error('Barcode tidak valid atau pasien tidak ditemukan');
      } else if (error.message?.includes('invalid') || error.message?.includes('tidak valid')) {
        throw new Error('Format barcode tidak valid');
      } else if (error.message?.includes('timeout')) {
        throw new Error('Koneksi timeout, silakan coba lagi');
      } else {
        throw new Error(error.message || 'Gagal memindai barcode');
      }
    }
  },
};