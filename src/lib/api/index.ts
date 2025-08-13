// API exports
export { authApi } from './auth';
export { patientsApi } from './patients';
export { dashboardApi } from './dashboard';
export { examinationsApi } from './examinations';
export { advancedTestsApi } from './advancedTests';
export { assessmentsApi } from './assessments';
export { treatmentsApi } from './treatments';
export { referralsApi } from './referrals';

// Re-export the main API client
export { default as apiClient } from '@/lib/api';