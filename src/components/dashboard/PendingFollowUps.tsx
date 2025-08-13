'use client';

import React, { useState } from 'react';
import { PendingFollowUps, PendingFollowUp } from '@/types/dashboard';
import { formatRelativeTime } from '@/lib/utils';

interface PendingFollowUpsProps {
  data: PendingFollowUps;
  loading?: boolean;
  onRefresh?: () => void;
}

const PendingFollowUpsComponent: React.FC<PendingFollowUpsProps> = ({
  data,
  loading = false,
  onRefresh
}) => {
  const [activeTab, setActiveTab] = useState<'penilaian' | 'pemeriksaan'>('penilaian');

  const getPriorityColor = (prioritas: PendingFollowUp['prioritas']) => {
    switch (prioritas) {
      case 'Tinggi':
        return 'bg-red-100 text-red-800';
      case 'Sedang':
        return 'bg-yellow-100 text-yellow-800';
      case 'Rendah':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityIcon = (prioritas: PendingFollowUp['prioritas']) => {
    switch (prioritas) {
      case 'Tinggi':
        return (
          <svg className="h-4 w-4 text-red-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        );
      case 'Sedang':
        return (
          <svg className="h-4 w-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        );
      case 'Rendah':
        return (
          <svg className="h-4 w-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
        );
      default:
        return null;
    }
  };

  const renderFollowUpItem = (item: PendingFollowUp, type: 'penilaian' | 'pemeriksaan') => (
    <div key={`${type}-${item.id}`} className="border-l-4 border-l-blue-400 bg-blue-50 p-4 rounded-r-lg">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <h4 className="text-sm font-medium text-gray-900">
              {item.nama} ({item.id_pasien})
            </h4>
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(item.prioritas)}`}>
              {getPriorityIcon(item.prioritas)}
              <span className="ml-1">{item.prioritas}</span>
            </span>
          </div>
          
          {item.nomor_hp && (
            <p className="text-sm text-gray-600 mt-1">
              📞 {item.nomor_hp}
            </p>
          )}

          {type === 'penilaian' && (
            <>
              {item.kategori_penilaian && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Kategori:</span> {item.kategori_penilaian}
                </p>
              )}
              {item.temuan && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Temuan:</span> {item.temuan}
                </p>
              )}
              {item.rekomendasi && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Rekomendasi:</span> {item.rekomendasi}
                </p>
              )}
              {item.tanggal_penilaian && (
                <p className="text-xs text-gray-500 mt-2">
                  Penilaian: {formatRelativeTime(new Date(item.tanggal_penilaian))}
                  {item.hari_sejak_penilaian && ` (${item.hari_sejak_penilaian} hari yang lalu)`}
                </p>
              )}
            </>
          )}

          {type === 'pemeriksaan' && (
            <>
              {item.pemeriksaan_terakhir && (
                <p className="text-xs text-gray-500 mt-2">
                  Pemeriksaan terakhir: {formatRelativeTime(new Date(item.pemeriksaan_terakhir))}
                  {item.hari_sejak_pemeriksaan && ` (${item.hari_sejak_pemeriksaan} hari yang lalu)`}
                </p>
              )}
              {item.jenis_tindak_lanjut && (
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-medium">Tindak lanjut:</span> {item.jenis_tindak_lanjut}
                </p>
              )}
            </>
          )}

          {item.status_rujukan && (
            <p className="text-sm text-gray-600 mt-1">
              <span className="font-medium">Status rujukan:</span> {item.status_rujukan}
              {item.fasilitas_rujukan && ` ke ${item.fasilitas_rujukan}`}
            </p>
          )}
        </div>

        <div className="flex-shrink-0 ml-4">
          <button className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            Tindak Lanjut
          </button>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tindak Lanjut Tertunda
            </h3>
            <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border-l-4 border-l-gray-200 bg-gray-50 p-4 rounded-r-lg animate-pulse">
                <div className="space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const totalPending = data.penilaian_tertunda.length + data.pemeriksaan_tertunda.length;

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-2">
            <h3 className="text-lg leading-6 font-medium text-gray-900">
              Tindak Lanjut Tertunda
            </h3>
            {totalPending > 0 && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                {totalPending}
              </span>
            )}
          </div>
          {onRefresh && (
            <button
              onClick={onRefresh}
              className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <svg className="h-3 w-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          )}
        </div>

        {totalPending === 0 ? (
          <div className="text-center py-8">
            <svg
              className="mx-auto h-12 w-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">Tidak ada tindak lanjut tertunda</h3>
            <p className="mt-1 text-sm text-gray-500">
              Semua pasien sudah mendapat tindak lanjut yang sesuai.
            </p>
          </div>
        ) : (
          <>
            {/* Tabs */}
            <div className="border-b border-gray-200 mb-4">
              <nav className="-mb-px flex space-x-8">
                <button
                  onClick={() => setActiveTab('penilaian')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'penilaian'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Penilaian Tertunda
                  {data.penilaian_tertunda.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {data.penilaian_tertunda.length}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => setActiveTab('pemeriksaan')}
                  className={`py-2 px-1 border-b-2 font-medium text-sm ${
                    activeTab === 'pemeriksaan'
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  Pemeriksaan Tertunda
                  {data.pemeriksaan_tertunda.length > 0 && (
                    <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                      {data.pemeriksaan_tertunda.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Tab Content */}
            <div className="space-y-4">
              {activeTab === 'penilaian' && (
                <>
                  {data.penilaian_tertunda.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">Tidak ada penilaian yang tertunda</p>
                    </div>
                  ) : (
                    data.penilaian_tertunda.map(item => renderFollowUpItem(item, 'penilaian'))
                  )}
                </>
              )}

              {activeTab === 'pemeriksaan' && (
                <>
                  {data.pemeriksaan_tertunda.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-sm text-gray-500">Tidak ada pemeriksaan yang tertunda</p>
                    </div>
                  ) : (
                    data.pemeriksaan_tertunda.map(item => renderFollowUpItem(item, 'pemeriksaan'))
                  )}
                </>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PendingFollowUpsComponent;