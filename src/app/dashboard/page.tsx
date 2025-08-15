'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PendingFollowUps from '@/components/dashboard/PendingFollowUps';
import DashboardCharts from '@/components/dashboard/DashboardCharts';
import { dashboardApi } from '@/lib/api/dashboard';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const router = useRouter();
  const { admin } = useAuth();

  // Fetch dashboard data with SWR
  const { 
    data: statistics, 
    error: statsError, 
    isLoading: statsLoading,
    mutate: mutateStats
  } = useSWR('dashboard-statistics', dashboardApi.getStatistics, {
    refreshInterval: 30000, // Refresh every 30 seconds
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
  });

  const { 
    data: activities, 
    error: activitiesError, 
    isLoading: activitiesLoading,
    mutate: mutateActivities
  } = useSWR('dashboard-activities', () => dashboardApi.getRecentActivities(10), {
    refreshInterval: 60000, // Refresh every minute
    revalidateOnFocus: true,
  });

  const { 
    data: pendingFollowUps, 
    error: followUpsError, 
    isLoading: followUpsLoading,
    mutate: mutateFollowUps
  } = useSWR('dashboard-follow-ups', dashboardApi.getPendingFollowUps, {
    refreshInterval: 120000, // Refresh every 2 minutes
    revalidateOnFocus: true,
  });

  // Manual refresh functions
  const handleRefreshStats = () => {
    mutateStats();
  };

  const handleRefreshActivities = () => {
    mutateActivities();
  };

  const handleRefreshFollowUps = () => {
    mutateFollowUps();
  };

  const handleRefreshAll = () => {
    mutateStats();
    mutateActivities();
    mutateFollowUps();
  };

  // Quick action handlers
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'register-patient':
        router.push('/pasien?action=register');
        break;
      case 'scan-barcode':
        router.push('/scan');
        break;
      case 'new-examination':
        router.push('/pemeriksaan?action=new');
        break;
      default:
        break;
    }
  };

  return (
    <AuthGuard>
      <MainLayout>
        <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            {/* Welcome Section - Enhanced */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-8">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-16 w-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                        <svg
                          className="h-10 w-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
                          />
                        </svg>
                      </div>
                    </div>
                    <div>
                      <h1 className="text-2xl sm:text-3xl font-bold text-white">
                        Selamat Datang, {admin?.nama_lengkap || 'Administrator'}
                      </h1>
                      <p className="text-white text-lg font-medium mt-1">
                        Sistem Manajemen Posyandu Lansia
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={handleRefreshAll}
                    className="mt-4 sm:mt-0 inline-flex items-center px-4 py-2 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white hover:bg-white/30 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-blue-600"
                    title="Refresh semua data"
                  >
                    <svg className="h-5 w-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                    Refresh Data
                  </button>
                </div>
              </div>
              <div className="px-6 py-6">
                <p className="text-gray-600 text-base leading-relaxed">
                  Sistem ini membantu Anda mengelola data pasien lansia, melakukan pemeriksaan kesehatan, 
                  dan memberikan perawatan yang optimal di posyandu. Semua data tersimpan dengan aman dan dapat diakses dengan mudah.
                </p>
              </div>
            </div>

            {/* Statistics Cards - Enhanced Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
              <StatCard
                title="Total Pasien"
                value={statistics?.totalPasien || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                  </svg>
                }
                color="blue"
                loading={statsLoading}
                showMiniChart={true}
                chartData={[
                  { date: '2024-01-01', value: (statistics?.totalPasien || 0) * 0.7 },
                  { date: '2024-01-02', value: (statistics?.totalPasien || 0) * 0.8 },
                  { date: '2024-01-03', value: (statistics?.totalPasien || 0) * 0.85 },
                  { date: '2024-01-04', value: (statistics?.totalPasien || 0) * 0.9 },
                  { date: '2024-01-05', value: (statistics?.totalPasien || 0) * 0.95 },
                  { date: '2024-01-06', value: statistics?.totalPasien || 0 }
                ]}
              />

              <StatCard
                title="Pemeriksaan Hari Ini"
                value={statistics?.pemeriksaanHariIni || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                  </svg>
                }
                color="green"
                loading={statsLoading}
                showMiniChart={true}
                chartData={[
                  { date: '2024-01-01', value: Math.max(0, (statistics?.pemeriksaanHariIni || 0) - 5) },
                  { date: '2024-01-02', value: Math.max(0, (statistics?.pemeriksaanHariIni || 0) - 3) },
                  { date: '2024-01-03', value: Math.max(0, (statistics?.pemeriksaanHariIni || 0) - 2) },
                  { date: '2024-01-04', value: Math.max(0, (statistics?.pemeriksaanHariIni || 0) - 1) },
                  { date: '2024-01-05', value: statistics?.pemeriksaanHariIni || 0 }
                ]}
              />

              <StatCard
                title="Tindak Lanjut Tertunda"
                value={
                  (pendingFollowUps?.penilaian_tertunda?.length || 0) + 
                  (pendingFollowUps?.pemeriksaan_tertunda?.length || 0)
                }
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                }
                color="yellow"
                loading={followUpsLoading}
              />

              <StatCard
                title="Pasien Perlu Perhatian"
                value={statistics?.pasienPerluPerhatian || 0}
                icon={
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                  </svg>
                }
                color="red"
                loading={statsLoading}
              />
            </div>

            {/* Quick Actions - Enhanced */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="h-6 w-6 text-blue-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  Aksi Cepat
                </h3>
                <p className="text-gray-600 mt-1">Akses cepat ke fungsi-fungsi utama sistem</p>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
                  <button 
                    onClick={() => handleQuickAction('register-patient')}
                    className="group relative bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-xl border border-blue-200 hover:from-blue-100 hover:to-blue-200 hover:border-blue-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-blue-600 rounded-xl flex items-center justify-center group-hover:bg-blue-700 transition-colors">
                          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-blue-900 transition-colors">
                          Daftar Pasien Baru
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-blue-700 transition-colors">
                          Tambahkan pasien lansia baru ke sistem
                        </p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleQuickAction('scan-barcode')}
                    className="group relative bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-xl border border-green-200 hover:from-green-100 hover:to-green-200 hover:border-green-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-green-600 rounded-xl flex items-center justify-center group-hover:bg-green-700 transition-colors">
                          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-green-900 transition-colors">
                          Scan Barcode
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-green-700 transition-colors">
                          Scan barcode pasien untuk akses cepat
                        </p>
                      </div>
                    </div>
                  </button>

                  <button 
                    onClick={() => handleQuickAction('new-examination')}
                    className="group relative bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-xl border border-purple-200 hover:from-purple-100 hover:to-purple-200 hover:border-purple-300 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 transform hover:scale-105"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-12 w-12 bg-purple-600 rounded-xl flex items-center justify-center group-hover:bg-purple-700 transition-colors">
                          <svg className="h-7 w-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                          </svg>
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-lg font-semibold text-gray-900 group-hover:text-purple-900 transition-colors">
                          Pemeriksaan Baru
                        </h4>
                        <p className="text-sm text-gray-600 group-hover:text-purple-700 transition-colors">
                          Mulai pemeriksaan kesehatan pasien
                        </p>
                      </div>
                    </div>
                  </button>
                </div>
              </div>
            </div>

            {/* Dashboard Charts Section */}
            <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
              <div className="px-6 py-6 border-b border-gray-100">
                <h3 className="text-xl font-bold text-gray-900 flex items-center">
                  <svg className="h-6 w-6 text-purple-600 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                  Grafik dan Analisis
                </h3>
                <p className="text-gray-600 mt-1">Visualisasi data kesehatan dan tren pasien</p>
              </div>
              <div className="p-6">
                <DashboardCharts loading={statsLoading} />
              </div>
            </div>

            {/* Main Content Grid - Enhanced */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
              {/* Activity Feed */}
              <div className="xl:col-span-1">
                <ActivityFeed
                  activities={activities || []}
                  loading={activitiesLoading}
                  onRefresh={handleRefreshActivities}
                />
              </div>

              {/* Pending Follow-ups */}
              <div className="xl:col-span-1">
                <PendingFollowUps
                  data={pendingFollowUps || { penilaian_tertunda: [], pemeriksaan_tertunda: [] }}
                  loading={followUpsLoading}
                  onRefresh={handleRefreshFollowUps}
                />
              </div>
            </div>

            {/* Error States - Enhanced */}
            {(statsError || activitiesError || followUpsError) && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <div className="h-10 w-10 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-4 flex-1">
                    <h3 className="text-lg font-semibold text-red-800">
                      Terjadi kesalahan saat memuat data
                    </h3>
                    <div className="mt-2 text-red-700">
                      <p>
                        Beberapa data mungkin tidak dapat dimuat. Silakan coba refresh halaman atau hubungi administrator.
                      </p>
                    </div>
                    <div className="mt-4">
                      <button
                        onClick={handleRefreshAll}
                        className="bg-red-100 px-4 py-2 rounded-lg text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                      >
                        Coba Lagi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </MainLayout>
    </AuthGuard>
  );
}