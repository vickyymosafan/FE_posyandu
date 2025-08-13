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
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      iconBg: 'bg-blue-600',
      iconHover: 'group-hover:bg-blue-700',
      text: 'text-blue-900',
      border: 'border-blue-200',
      shadow: 'shadow-blue-100'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      iconBg: 'bg-green-600',
      iconHover: 'group-hover:bg-green-700',
      text: 'text-green-900',
      border: 'border-green-200',
      shadow: 'shadow-green-100'
    },
    yellow: {
      bg: 'bg-gradient-to-br from-yellow-50 to-yellow-100',
      iconBg: 'bg-yellow-600',
      iconHover: 'group-hover:bg-yellow-700',
      text: 'text-yellow-900',
      border: 'border-yellow-200',
      shadow: 'shadow-yellow-100'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      iconBg: 'bg-red-600',
      iconHover: 'group-hover:bg-red-700',
      text: 'text-red-900',
      border: 'border-red-200',
      shadow: 'shadow-red-100'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      iconBg: 'bg-purple-600',
      iconHover: 'group-hover:bg-purple-700',
      text: 'text-purple-900',
      border: 'border-purple-200',
      shadow: 'shadow-purple-100'
    },
    gray: {
      bg: 'bg-gradient-to-br from-gray-50 to-gray-100',
      iconBg: 'bg-gray-600',
      iconHover: 'group-hover:bg-gray-700',
      text: 'text-gray-900',
      border: 'border-gray-200',
      shadow: 'shadow-gray-100'
    }
  };

  const trendColorClasses = {
    positive: 'text-green-700 bg-green-100 border-green-200',
    negative: 'text-red-700 bg-red-100 border-red-200'
  };

  const currentColor = colorClasses[color];

  if (loading) {
    return (
      <div className={`${currentColor.bg} rounded-2xl border ${currentColor.border} shadow-lg animate-pulse overflow-hidden`}>
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="h-12 w-12 bg-gray-200 rounded-xl"></div>
            </div>
            <div className="flex-1 space-y-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
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
    <div className={`group ${currentColor.bg} rounded-2xl border ${currentColor.border} shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 overflow-hidden`}>
      <div className="p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-shrink-0">
            <div className={`h-12 w-12 ${currentColor.iconBg} ${currentColor.iconHover} rounded-xl flex items-center justify-center transition-colors duration-200 shadow-lg`}>
              <div className="text-white">
                {icon}
              </div>
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-medium text-gray-600 truncate">
              {title}
            </h3>
            <p className="text-3xl font-bold text-gray-900 mt-1">
              {typeof value === 'number' ? value.toLocaleString('id-ID') : value}
            </p>
          </div>
        </div>
        
        {trend && (
          <div className="mt-4 flex items-center">
            <div className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${trend.isPositive ? trendColorClasses.positive : trendColorClasses.negative}`}>
              <svg
                className={`mr-1 h-3 w-3 ${trend.isPositive ? '' : 'rotate-180'}`}
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
        )}
      </div>
    </div>
  );
};

export default StatCard;