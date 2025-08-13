// Treatment API functions
import apiClient from '@/lib/api';
import { 
  Treatment, 
  TreatmentData, 
  TreatmentWithDetails 
} from '@/types/treatment';

export const treatmentsApi = {
  /**
   * Get all treatments
   */
  getTreatments: async (): Promise<TreatmentWithDetails[]> => {
    const response = await apiClient.get<TreatmentWithDetails[]>('/pengobatan');
    return response.data!;
  },

  /**
   * Get treatment by ID
   */
  getTreatment: async (id: number): Promise<TreatmentWithDetails> => {
    const response = await apiClient.get<TreatmentWithDetails>(`/pengobatan/${id}`);
    return response.data!;
  },

  /**
   * Get treatments by patient ID
   */
  getTreatmentsByPatient: async (patientId: number): Promise<TreatmentWithDetails[]> => {
    const response = await apiClient.get<any>(`/pasien/${patientId}/pengobatan`);
    // The backend returns data in nested structure: { data: { pengobatan: [...] } }
    return response.data?.pengobatan || [];
  },

  /**
   * Create new treatment
   */
  createTreatment: async (data: TreatmentData): Promise<Treatment> => {
    const response = await apiClient.post<Treatment>('/pengobatan', data);
    return response.data!;
  },

  /**
   * Update treatment
   */
  updateTreatment: async (id: number, data: Partial<TreatmentData>): Promise<Treatment> => {
    const response = await apiClient.put<Treatment>(`/pengobatan/${id}`, data);
    return response.data!;
  },

  /**
   * Delete treatment
   */
  deleteTreatment: async (id: number): Promise<void> => {
    await apiClient.delete(`/pengobatan/${id}`);
  },
};