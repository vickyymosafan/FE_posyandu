'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import useSWR from 'swr';
import AuthGuard from '@/components/AuthGuard';
import MainLayout from '@/components/Layout/MainLayout';
import StatCard from '@/components/dashboard/StatCard';
import ActivityFeed from '@/components/dashboard/ActivityFeed';
import PendingFollowUps from '@/components/dashboard/PendingFollowUps';
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
        <div className="space-y-6">
          {/* Welcome Section */}
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <div className="h-12 w-12 bg-blue-100 rounded-lg flex items-center justify-center">
                      <svg
                        className="h-8 w-8 text-blue-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z"
                        />
                      </svg>
                    </div>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">
                        Selamat Datang, {admin?.nama_lengkap || 'Administrator'}
                      </dt>
                      <dd className="text-lg font-medium text-gray-900">
                        Sistem Manajemen Posyandu
                      </dd>
                    </dl>
                  </div>
                </div>
                <button
                  onClick={handleRefreshAll}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  title="Refresh semua data"
                >
                  <svg className="h-4 w-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Refresh
                </button>
              </div>
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  Sistem ini membantu Anda mengelola data pasien lansia, melakukan pemeriksaan kesehatan, 
                  dan memberikan perawatan yang optimal di posyandu.
                </p>
              </div>
            </div>
          </div>

          {/* Statistics Cards */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard
              title="Total Pasien"
              value={statistics?.totalPasien || 0}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                </svg>
              }
              color="blue"
              loading={statsLoading}
            />

            <StatCard
              title="Pemeriksaan Hari Ini"
              value={statistics?.pemeriksaanHariIni || 0}
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                </svg>
              }
              color="green"
              loading={statsLoading}
            />

            <StatCard
              title="Tindak Lanjut Tertunda"
              value={
                (pendingFollowUps?.penilaian_tertunda?.length || 0) + 
                (pendingFollowUps?.pemeriksaan_tertunda?.length || 0)
              }
              icon={
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.35 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              }
              color="red"
              loading={statsLoading}
            />
          </div>

          {/* Quick Actions */}
          <div className="bg-white shadow rounded-lg">
            <div className="px-4 py-5 sm:p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
                Aksi Cepat
              </h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <button 
                  onClick={() => handleQuickAction('register-patient')}
                  className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-blue-50 text-blue-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Daftar Pasien Baru
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Tambahkan pasien lansia baru ke sistem
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => handleQuickAction('scan-barcode')}
                  className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-green-50 text-green-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Scan Barcode
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Scan barcode pasien untuk akses cepat
                    </p>
                  </div>
                </button>

                <button 
                  onClick={() => handleQuickAction('new-examination')}
                  className="relative group bg-gray-50 p-6 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div>
                    <span className="rounded-lg inline-flex p-3 bg-purple-50 text-purple-700 ring-4 ring-white">
                      <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
                      </svg>
                    </span>
                  </div>
                  <div className="mt-8">
                    <h3 className="text-lg font-medium">
                      <span className="absolute inset-0" aria-hidden="true" />
                      Pemeriksaan Baru
                    </h3>
                    <p className="mt-2 text-sm text-gray-500">
                      Mulai pemeriksaan kesehatan pasien
                    </p>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Activity Feed */}
            <div className="lg:col-span-1">
              <ActivityFeed
                activities={activities || []}
                loading={activitiesLoading}
                onRefresh={handleRefreshActivities}
              />
            </div>

            {/* Pending Follow-ups */}
            <div className="lg:col-span-1">
              <PendingFollowUps
                data={pendingFollowUps || { penilaian_tertunda: [], pemeriksaan_tertunda: [] }}
                loading={followUpsLoading}
                onRefresh={handleRefreshFollowUps}
              />
            </div>
          </div>

          {/* Error States */}
          {(statsError || activitiesError || followUpsError) && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">
                    Terjadi kesalahan saat memuat data
                  </h3>
                  <div className="mt-2 text-sm text-red-700">
                    <p>
                      Beberapa data mungkin tidak dapat dimuat. Silakan coba refresh halaman atau hubungi administrator.
                    </p>
                  </div>
                  <div className="mt-4">
                    <button
                      onClick={handleRefreshAll}
                      className="bg-red-100 px-3 py-2 rounded-md text-sm font-medium text-red-800 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Coba Lagi
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </MainLayout>
    </AuthGuard>
  );
}