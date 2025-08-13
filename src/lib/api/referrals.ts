// Referral API functions
import apiClient from '@/lib/api';
import { 
  Referral, 
  ReferralData, 
  ReferralWithDetails,
  ReferralStatus 
} from '@/types/referral';

export const referralsApi = {
  /**
   * Get all referrals
   */
  getReferrals: async (): Promise<ReferralWithDetails[]> => {
    const response = await apiClient.get<ReferralWithDetails[]>('/rujukan');
    return response.data!;
  },

  /**
   * Get referral by ID
   */
  getReferral: async (id: number): Promise<ReferralWithDetails> => {
    const response = await apiClient.get<ReferralWithDetails>(`/rujukan/${id}`);
    return response.data!;
  },

  /**
   * Get referrals by patient ID
   */
  getReferralsByPatient: async (patientId: number): Promise<ReferralWithDetails[]> => {
    const response = await apiClient.get<any>(`/pasien/${patientId}/rujukan`);
    // The backend returns data in nested structure: { data: { rujukan: [...] } }
    return response.data?.rujukan || [];
  },

  /**
   * Create new referral
   */
  createReferral: async (data: ReferralData): Promise<Referral> => {
    const response = await apiClient.post<Referral>('/rujukan', data);
    return response.data!;
  },

  /**
   * Update referral
   */
  updateReferral: async (id: number, data: Partial<ReferralData>): Promise<Referral> => {
    const response = await apiClient.put<Referral>(`/rujukan/${id}`, data);
    return response.data!;
  },

  /**
   * Update referral status
   */
  updateReferralStatus: async (id: number, status: ReferralStatus): Promise<Referral> => {
    const response = await apiClient.put<Referral>(`/rujukan/${id}/status`, { status });
    return response.data!;
  },

  /**
   * Delete referral
   */
  deleteReferral: async (id: number): Promise<void> => {
    await apiClient.delete(`/rujukan/${id}`);
  },
};