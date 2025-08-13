'use client';

import React from 'react';
import { RecentActivity } from '@/types/dashboard';
import { formatDateTime, formatRelativeTime } from '@/lib/utils';

interface PatientActivityFeedProps {
  activities: RecentActivity[];
  loading?: boolean;
  onRefresh?: () => void;
}

const PatientActivityFeed: React.FC<PatientActivityFeedProps> = ({
  activities,
  loading = false,
  onRefresh
}) => {
  const getActivityIcon = (jenis: RecentActivity['jenis']) => {
    switch (jenis) {
      case 'pemeriksaan_fisik':
        return (
          <div className="bg-blue-100 rounded-lg p-2">
            <svg className="h-5 w-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
            </svg>
          </div>
        );
      case 'tes_lanjutan':
        return (
          <div className="bg-purple-100 rounded-lg p-2">
            <svg className="h-5 w-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      case 'penilaian_kesehatan':
        return (
          <div className="bg-green-100 rounded-lg p-2">
            <svg className="h-5 w-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        );
      case 'pengobatan':
        return (
          <div className="bg-yellow-100 rounded-lg p-2">
            <svg className="h-5 w-5 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
          </div>
        );
      case 'rujukan':
        return (
          <div className="bg-red-100 rounded-lg p-2">
            <svg className="h-5 w-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </div>
        );
      default:
        return (
          <div className="bg-gray-100 rounded-lg p-2">
            <svg className="h-5 w-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        );
    }
  };

  const getActivityLabel = (jenis: RecentActivity['jenis']) => {
    switch (jenis) {
      case 'pemeriksaan_fisik':
        return 'Pemeriksaan Fisik';
      case 'tes_lanjutan':
        return 'Tes Lanjutan';
      case 'penilaian_kesehatan':
        return 'Penilaian Kesehatan';
      case 'pengobatan':
        return 'Pengobatan';
      case 'rujukan':
        return 'Rujukan';
      default:
        return 'Aktivitas';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start space-x-3 animate-pulse">
            <div className="h-10 w-10 bg-gray-200 rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <svg className="w-12 h-12 mx-auto mb-2 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
        <p>Belum ada aktivitas pemeriksaan</p>
        <p className="text-sm text-gray-400 mt-1">
          Mulai dengan melakukan pemeriksaan fisik
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <ul className="-mb-8">
        {activities.map((activity, activityIdx) => (
          <li key={`${activity.jenis}-${activity.id}-${activityIdx}`}>
            <div className="relative pb-8">
              {activityIdx !== activities.length - 1 ? (
                <span
                  className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                  aria-hidden="true"
                />
              ) : null}
              <div className="relative flex space-x-3">
                <div>
                  {getActivityIcon(activity.jenis)}
                </div>
                <div className="min-w-0 flex-1 pt-1.5 flex justify-between space-x-4">
                  <div>
                    <div className="text-sm">
                      <span className="font-medium text-gray-900">
                        {getActivityLabel(activity.jenis)}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500">
                      {activity.deskripsi}
                    </p>
                    <div className="mt-2 flex items-center space-x-2 text-xs text-gray-500">
                      <span>oleh {activity.admin_nama}</span>
                      <span>•</span>
                      <time dateTime={activity.waktu} title={formatDateTime(new Date(activity.waktu))}>
                        {formatRelativeTime(new Date(activity.waktu))}
                      </time>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default PatientActivityFeed;
