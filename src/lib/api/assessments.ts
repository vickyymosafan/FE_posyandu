// Health Assessment API functions
import apiClient from '@/lib/api';
import { 
  HealthAssessment, 
  HealthAssessmentData, 
  AssessmentWithDetails,
  AssessmentCategory 
} from '@/types/assessment';

export interface AssessmentFilters {
  patientId?: number;
  category?: AssessmentCategory;
  startDate?: string;
  endDate?: string;
  adminId?: number;
}

export const assessmentsApi = {
  /**
   * Get all health assessments with optional filtering
   */
  getAssessments: async (filters?: AssessmentFilters): Promise<AssessmentWithDetails[]> => {
    const params = new URLSearchParams();
    
    if (filters?.patientId) {
      params.append('patientId', filters.patientId.toString());
    }
    if (filters?.category) {
      params.append('category', filters.category);
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.adminId) {
      params.append('adminId', filters.adminId.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/penilaian?${queryString}` : '/penilaian';
    
    const response = await apiClient.get<AssessmentWithDetails[] | any[]>(url);
    const raw = response.data || [];
    // Normalize field naming from backend: some endpoints use `dinilai_oleh_nama`
    const normalized = (raw as any[]).map((item) => ({
      ...item,
      admin_nama: item.admin_nama ?? item.dinilai_oleh_nama ?? item.diperiksa_oleh_nama ?? '',
    })) as AssessmentWithDetails[];
    return normalized;
  },

  /**
   * Get health assessment by ID
   */
  getAssessment: async (id: number): Promise<AssessmentWithDetails> => {
    const response = await apiClient.get<AssessmentWithDetails>(`/penilaian/${id}`);
    return response.data!;
  },

  /**
   * Create new health assessment
   */
  createAssessment: async (data: HealthAssessmentData): Promise<HealthAssessment> => {
    const response = await apiClient.post<HealthAssessment>('/penilaian', data);
    return response.data!;
  },

  /**
   * Update health assessment
   */
  updateAssessment: async (id: number, data: Partial<HealthAssessmentData>): Promise<HealthAssessment> => {
    const response = await apiClient.put<HealthAssessment>(`/penilaian/${id}`, data);
    return response.data!;
  },

  /**
   * Delete health assessment
   */
  deleteAssessment: async (id: number): Promise<void> => {
    await apiClient.delete(`/penilaian/${id}`);
  },

  /**
   * Get patient's assessment history
   */
  getPatientAssessments: async (patientId: number | string): Promise<AssessmentWithDetails[]> => {
    const response = await apiClient.get<any>(`/pasien/${patientId}/penilaian`);
    // The backend returns data in nested structure: { data: { penilaian: [...] } }
    const arr = response.data?.penilaian || [];
    const normalized = (arr as any[]).map((item) => ({
      ...item,
      admin_nama: item.admin_nama ?? item.dinilai_oleh_nama ?? item.diperiksa_oleh_nama ?? '',
    })) as AssessmentWithDetails[];
    return normalized;
  },

  /**
   * Get patient's latest assessment
   */
  getPatientLatestAssessment: async (patientId: number): Promise<AssessmentWithDetails | null> => {
    try {
      const assessments = await assessmentsApi.getPatientAssessments(patientId);
      return assessments.length > 0 ? assessments[0] : null;
    } catch (error) {
      return null;
    }
  },

  /**
   * Get assessment statistics for dashboard
   */
  getAssessmentStats: async (days: number = 30): Promise<{
    total: number;
    normal: number;
    perlu_perhatian: number;
    rujukan: number;
    recent: AssessmentWithDetails[];
  }> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const assessments = await assessmentsApi.getAssessments({
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0]
    });

    const stats = {
      total: assessments.length,
      normal: assessments.filter(a => a.kategori_penilaian === 'normal').length,
      perlu_perhatian: assessments.filter(a => a.kategori_penilaian === 'perlu_perhatian').length,
      rujukan: assessments.filter(a => a.kategori_penilaian === 'rujukan').length,
      recent: assessments.slice(0, 10) // Get 10 most recent
    };

    return stats;
  },

  /**
   * Get assessment recommendations based on examination data
   */
  getAssessmentRecommendations: async (
    physicalExamId?: number,
    advancedTestId?: number
  ): Promise<{
    suggestedCategory: AssessmentCategory;
    findings: string[];
    recommendations: string[];
  }> => {
    const params = new URLSearchParams();
    
    if (physicalExamId) {
      params.append('physicalExamId', physicalExamId.toString());
    }
    if (advancedTestId) {
      params.append('advancedTestId', advancedTestId.toString());
    }

    const queryString = params.toString();
    const url = `/penilaian/rekomendasi${queryString ? `?${queryString}` : ''}`;
    
    const response = await apiClient.get<{
      suggestedCategory: AssessmentCategory;
      findings: string[];
      recommendations: string[];
    }>(url);
    
    return response.data!;
  }
};