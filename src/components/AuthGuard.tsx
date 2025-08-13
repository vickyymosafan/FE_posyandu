'use client';

import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

const AuthGuard: React.FC<AuthGuardProps> = ({ 
  children, 
  requireAuth = true,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!isLoading) {
      if (requireAuth && !isAuthenticated) {
        // Store the current path for redirect after login
        const redirectPath = pathname !== '/login' ? pathname : '/dashboard';
        const loginUrl = `${redirectTo}?redirect=${encodeURIComponent(redirectPath)}`;
        router.push(loginUrl);
      } else if (!requireAuth && isAuthenticated) {
        // If user is authenticated but trying to access auth pages, redirect to dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, isLoading, requireAuth, router, pathname, redirectTo]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600 text-sm">Memuat...</p>
        </div>
      </div>
    );
  }

  // Don't render children if auth requirements are not met
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  if (!requireAuth && isAuthenticated) {
    return null;
  }

  return <>{children}</>;
};

export default AuthGuard;