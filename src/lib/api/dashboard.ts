// Dashboard API functions
import apiClient from '@/lib/api';
import { 
  DashboardStatistics, 
  RecentActivity, 
  PendingFollowUps 
} from '@/types/dashboard';

export const dashboardApi = {
  /**
   * Get dashboard statistics
   */
  getStatistics: async (): Promise<DashboardStatistics> => {
    const response = await apiClient.get<DashboardStatistics>('/dashboard/statistik');
    return response.data!;
  },

  /**
   * Get recent activities
   */
  getRecentActivities: async (limit?: number): Promise<RecentActivity[]> => {
    const queryParams = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get<RecentActivity[]>(`/dashboard/aktivitas-terbaru${queryParams}`);
    return response.data!;
  },

  /**
   * Get pending follow-ups
   */
  getPendingFollowUps: async (): Promise<PendingFollowUps> => {
    const response = await apiClient.get<PendingFollowUps>('/dashboard/tindak-lanjut-tertunda');
    return response.data!;
  },
};