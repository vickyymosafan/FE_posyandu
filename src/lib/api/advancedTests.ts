// Advanced Tests API functions
import apiClient from '@/lib/api';
import { AdvancedTest, AdvancedTestData } from '@/types/examination';

export interface AdvancedTestFilters {
  patientId?: number;
  startDate?: string;
  endDate?: string;
  minGlucose?: number;
  maxGlucose?: number;
}

export const advancedTestsApi = {
  /**
   * Get all advanced tests with optional filtering
   */
  getAdvancedTests: async (filters?: AdvancedTestFilters): Promise<AdvancedTest[]> => {
    const params = new URLSearchParams();
    
    if (filters?.patientId) {
      params.append('patientId', filters.patientId.toString());
    }
    if (filters?.startDate) {
      params.append('startDate', filters.startDate);
    }
    if (filters?.endDate) {
      params.append('endDate', filters.endDate);
    }
    if (filters?.minGlucose) {
      params.append('minGlucose', filters.minGlucose.toString());
    }
    if (filters?.maxGlucose) {
      params.append('maxGlucose', filters.maxGlucose.toString());
    }

    const queryString = params.toString();
    const url = queryString ? `/tes-lanjutan?${queryString}` : '/tes-lanjutan';
    
    const response = await apiClient.get<AdvancedTest[]>(url);
    return response.data!;
  },

  /**
   * Get advanced test by ID
   */
  getAdvancedTest: async (id: number): Promise<AdvancedTest> => {
    const response = await apiClient.get<AdvancedTest>(`/tes-lanjutan/${id}`);
    return response.data!;
  },

  /**
   * Create new advanced test
   */
  createAdvancedTest: async (data: AdvancedTestData): Promise<AdvancedTest> => {
    const response = await apiClient.post<AdvancedTest>('/tes-lanjutan', data);
    return response.data!;
  },

  /**
   * Update advanced test
   */
  updateAdvancedTest: async (id: number, data: Partial<AdvancedTestData>): Promise<AdvancedTest> => {
    const response = await apiClient.put<AdvancedTest>(`/tes-lanjutan/${id}`, data);
    return response.data!;
  },

  /**
   * Delete advanced test
   */
  deleteAdvancedTest: async (id: number): Promise<void> => {
    await apiClient.delete(`/tes-lanjutan/${id}`);
  },

  /**
   * Get patient's advanced test history
   */
  getPatientAdvancedTests: async (patientId: number): Promise<AdvancedTest[]> => {
    const response = await apiClient.get<any>(`/pasien/${patientId}/tes-lanjutan`);
    // The backend returns data in nested structure: { data: { tes_lanjutan: [...] } }
    return response.data?.tes_lanjutan || [];
  },

  /**
   * Get patient's advanced test history with date filtering
   */
  getPatientAdvancedTestsFiltered: async (
    patientId: number, 
    startDate?: string, 
    endDate?: string
  ): Promise<AdvancedTest[]> => {
    const params = new URLSearchParams();
    
    if (startDate) {
      params.append('startDate', startDate);
    }
    if (endDate) {
      params.append('endDate', endDate);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `/pasien/${patientId}/tes-lanjutan?${queryString}` 
      : `/pasien/${patientId}/tes-lanjutan`;
    
    const response = await apiClient.get<any>(url);
    // The backend returns data in nested structure: { data: { tes_lanjutan: [...] } }
    return response.data?.tes_lanjutan || [];
  },

  /**
   * Get glucose trend analysis for a patient
   */
  getGlucoseTrend: async (patientId: number, days: number = 30): Promise<{
    tests: AdvancedTest[];
    trend: 'increasing' | 'decreasing' | 'stable';
    average: number;
    latest: number | null;
  }> => {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(endDate.getDate() - days);

    const tests = await advancedTestsApi.getPatientAdvancedTestsFiltered(
      patientId,
      startDate.toISOString().split('T')[0],
      endDate.toISOString().split('T')[0]
    );

    // Calculate trend and statistics
    const validTests = tests.filter(test => test.gula_darah != null);
    
    if (validTests.length === 0) {
      return {
        tests: [],
        trend: 'stable',
        average: 0,
        latest: null
      };
    }

    const glucoseValues = validTests.map(test => test.gula_darah!);
    const average = glucoseValues.reduce((sum, val) => sum + val, 0) / glucoseValues.length;
    const latest = validTests[0]?.gula_darah || null;

    // Simple trend calculation based on first half vs second half
    let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
    if (validTests.length >= 4) {
      const midPoint = Math.floor(validTests.length / 2);
      const firstHalf = validTests.slice(midPoint).map(t => t.gula_darah!);
      const secondHalf = validTests.slice(0, midPoint).map(t => t.gula_darah!);
      
      const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
      const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
      
      const difference = secondAvg - firstAvg;
      if (Math.abs(difference) > 10) { // Significant change threshold
        trend = difference > 0 ? 'increasing' : 'decreasing';
      }
    }

    return {
      tests: validTests,
      trend,
      average: Math.round(average * 10) / 10,
      latest
    };
  }
};