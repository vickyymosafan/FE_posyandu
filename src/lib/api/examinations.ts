// Examination API functions
import apiClient from '@/lib/api';
import { 
  PhysicalExamination, 
  PhysicalExaminationData, 
  AdvancedTest, 
  AdvancedTestData,
  ExaminationHistory 
} from '@/types/examination';

export const examinationsApi = {
  /**
   * Get all physical examinations
   */
  getPhysicalExaminations: async (): Promise<PhysicalExamination[]> => {
    const response = await apiClient.get<PhysicalExamination[]>('/pemeriksaan');
    return response.data!;
  },

  /**
   * Get physical examination by ID
   */
  getPhysicalExamination: async (id: number): Promise<PhysicalExamination> => {
    const response = await apiClient.get<PhysicalExamination>(`/pemeriksaan/${id}`);
    return response.data!;
  },

  /**
   * Create new physical examination
   */
  createPhysicalExamination: async (data: PhysicalExaminationData): Promise<PhysicalExamination> => {
    const response = await apiClient.post<PhysicalExamination>('/pemeriksaan', data);
    return response.data!;
  },

  /**
   * Update physical examination
   */
  updatePhysicalExamination: async (id: number, data: Partial<PhysicalExaminationData>): Promise<PhysicalExamination> => {
    const response = await apiClient.put<PhysicalExamination>(`/pemeriksaan/${id}`, data);
    return response.data!;
  },

  /**
   * Delete physical examination
   */
  deletePhysicalExamination: async (id: number): Promise<void> => {
    await apiClient.delete(`/pemeriksaan/${id}`);
  },

  /**
   * Get patient's examination history
   */
  getPatientExaminations: async (patientId: number): Promise<PhysicalExamination[]> => {
    const response = await apiClient.get<PhysicalExamination[]>(`/pasien/${patientId}/pemeriksaan`);
    return response.data!;
  },

  /**
   * Get all advanced tests
   */
  getAdvancedTests: async (): Promise<AdvancedTest[]> => {
    const response = await apiClient.get<AdvancedTest[]>('/tes-lanjutan');
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
    const response = await apiClient.get<AdvancedTest[]>(`/pasien/${patientId}/tes-lanjutan`);
    return response.data!;
  },

  /**
   * Get complete examination history for a patient
   */
  getPatientExaminationHistory: async (patientId: number): Promise<ExaminationHistory> => {
    const [physicalExams, advancedTests] = await Promise.all([
      examinationsApi.getPatientExaminations(patientId),
      examinationsApi.getPatientAdvancedTests(patientId)
    ]);

    return {
      pemeriksaan_fisik: physicalExams,
      tes_lanjutan: advancedTests
    };
  }
};