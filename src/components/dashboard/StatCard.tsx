'use client';

import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  loading?: boolean;
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple' | 'gray';
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon,
  trend,
  loading = false,
  color = 'gray'
}) => {
  const colorClasses = {
    blue: 'text-blue-600 bg-blue-50',
    green: 'text-green-600 bg-green-50',
    yellow: 'text-yellow-600 bg-yellow-50',
    red: 'text-red-600 bg-red-50',
    purple: 'text-purple-600 bg-purple-50',
    gray: 'text-gray-600 bg-gray-50'
  };

  const trendColorClasses = {
    positive: 'text-green-600 bg-green-100',
    negative: 'text-red-600 bg-red-100'
  };

  if (loading) {
    return (
      <div className="bg-white overflow-hidden shadow rounded-lg animate-pulse">
        <div className="p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-gray-200 rounded"></div>
            </div>
            <div className="ml-5 w-0 flex-1">
              <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
              <div className="h-6 bg-gray-200 rounded w-1/2"></div>
            </div>
          </div>
          {trend && (
            <div className="mt-4">
              <div className="h-4 bg-gray-200 rounded w-1/3"></div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
              {icon}
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="text-2xl font-bold text-gray-900">
                {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
              </dd>
            </dl>
          </div>
        </div>
        
        {trend && (
          <div className="mt-4">
            <div className="flex items-center">
              <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                trend.isPositive ? trendColorClasses.positive : trendColorClasses.negative
              }`}>
                <svg
                  className={`-ml-1 mr-0.5 h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.293 9.707a1 1 0 010-1.414l4-4a1 1 0 011.414 0l4 4a1 1 0 01-1.414 1.414L11 7.414V15a1 1 0 11-2 0V7.414L6.707 9.707a1 1 0 01-1.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
                {Math.abs(trend.value)}%
              </div>
              <span className="ml-2 text-sm text-gray-500">
                {trend.label}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;