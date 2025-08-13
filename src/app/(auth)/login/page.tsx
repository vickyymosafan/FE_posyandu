'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useAuth } from '@/contexts/AuthContext';
import { LoginCredentials } from '@/types/auth';

interface LoginFormData {
  nama_pengguna: string;
  kata_sandi: string;
  remember: boolean;
}

export default function LoginPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
    setFocus,
  } = useForm<LoginFormData>({
    defaultValues: {
      nama_pengguna: '',
      kata_sandi: '',
      remember: false,
    },
  });

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check for redirect parameter
      const urlParams = new URLSearchParams(window.location.search);
      const redirectTo = urlParams.get('redirect') || '/dashboard';
      router.push(redirectTo);
    }
  }, [isAuthenticated, isLoading, router]);

  // Focus on username field when component mounts
  useEffect(() => {
    setFocus('nama_pengguna');
  }, [setFocus]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      setIsSubmitting(true);
      
      const credentials: LoginCredentials = {
        nama_pengguna: data.nama_pengguna,
        kata_sandi: data.kata_sandi,
      };

      await login(credentials);
      
      // Login success is handled in AuthContext
    } catch (error) {
      // Error is already handled in AuthContext with toast
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Show loading spinner while checking auth state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
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
                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sistem Manajemen Posyandu
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Masuk ke akun administrator Anda
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="nama_pengguna" className="sr-only">
                Nama Pengguna
              </label>
              <input
                {...register('nama_pengguna', {
                  required: 'Nama pengguna wajib diisi',
                  minLength: {
                    value: 3,
                    message: 'Nama pengguna minimal 3 karakter',
                  },
                })}
                type="text"
                autoComplete="username"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.nama_pengguna
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                } rounded-t-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Nama Pengguna"
                disabled={isSubmitting}
              />
              {errors.nama_pengguna && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.nama_pengguna.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="kata_sandi" className="sr-only">
                Kata Sandi
              </label>
              <input
                {...register('kata_sandi', {
                  required: 'Kata sandi wajib diisi',
                  minLength: {
                    value: 6,
                    message: 'Kata sandi minimal 6 karakter',
                  },
                })}
                type="password"
                autoComplete="current-password"
                className={`appearance-none rounded-none relative block w-full px-3 py-2 border ${
                  errors.kata_sandi
                    ? 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500'
                    : 'border-gray-300 placeholder-gray-500 text-gray-900 focus:ring-blue-500 focus:border-blue-500'
                } rounded-b-md focus:outline-none focus:z-10 sm:text-sm`}
                placeholder="Kata Sandi"
                disabled={isSubmitting}
              />
              {errors.kata_sandi && (
                <p className="mt-1 text-sm text-red-600">
                  {errors.kata_sandi.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                {...register('remember')}
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                disabled={isSubmitting}
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-900">
                Ingat saya
              </label>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
              } focus:outline-none transition duration-150 ease-in-out`}
            >
              {isSubmitting && (
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              )}
              {isSubmitting ? 'Memproses...' : 'Masuk'}
            </button>
          </div>

          <div className="text-center">
            <p className="text-xs text-gray-500">
              Sistem Manajemen Posyandu untuk Perawatan Lansia
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}