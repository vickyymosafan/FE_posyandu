// Toast notifications with react-hot-toast integration
import toast, { Toaster, ToastOptions } from 'react-hot-toast';

// Custom toast functions with Indonesian messages
export const showToast = {
  success: (message: string, options?: ToastOptions) => {
    return toast.success(message, {
      duration: 4000,
      position: 'top-right',
      style: {
        background: '#10B981',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#10B981',
      },
      ...options,
    });
  },

  error: (message: string, options?: ToastOptions) => {
    return toast.error(message, {
      duration: 5000,
      position: 'top-right',
      style: {
        background: '#EF4444',
        color: '#fff',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    });
  },

  loading: (message: string, options?: ToastOptions) => {
    return toast.loading(message, {
      position: 'top-right',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  },

  info: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: 'ℹ️',
      style: {
        background: '#3B82F6',
        color: '#fff',
      },
      ...options,
    });
  },

  warning: (message: string, options?: ToastOptions) => {
    return toast(message, {
      duration: 4000,
      position: 'top-right',
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
      },
      ...options,
    });
  },

  promise: <T,>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => {
    return toast.promise(
      promise,
      messages,
      {
        position: 'top-right',
        style: {
          minWidth: '250px',
        },
        success: {
          style: {
            background: '#10B981',
            color: '#fff',
          },
        },
        error: {
          style: {
            background: '#EF4444',
            color: '#fff',
          },
        },
        loading: {
          style: {
            background: '#3B82F6',
            color: '#fff',
          },
        },
        ...options,
      }
    );
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId);
  },

  remove: (toastId?: string) => {
    return toast.remove(toastId);
  },
};

// Common toast messages for the application
export const toastMessages = {
  // Success messages
  success: {
    save: 'Data berhasil disimpan',
    update: 'Data berhasil diperbarui',
    delete: 'Data berhasil dihapus',
    login: 'Login berhasil',
    logout: 'Logout berhasil',
    register: 'Pendaftaran berhasil',
    upload: 'File berhasil diunggah',
    download: 'File berhasil diunduh',
    copy: 'Berhasil disalin ke clipboard',
    send: 'Data berhasil dikirim',
  },

  // Error messages
  error: {
    save: 'Gagal menyimpan data',
    update: 'Gagal memperbarui data',
    delete: 'Gagal menghapus data',
    login: 'Login gagal. Periksa kredensial Anda',
    logout: 'Gagal logout',
    register: 'Pendaftaran gagal',
    upload: 'Gagal mengunggah file',
    download: 'Gagal mengunduh file',
    network: 'Koneksi bermasalah. Coba lagi nanti',
    validation: 'Data tidak valid. Periksa input Anda',
    unauthorized: 'Anda tidak memiliki akses',
    notFound: 'Data tidak ditemukan',
    serverError: 'Terjadi kesalahan server',
    generic: 'Terjadi kesalahan. Coba lagi nanti',
  },

  // Loading messages
  loading: {
    save: 'Menyimpan data...',
    update: 'Memperbarui data...',
    delete: 'Menghapus data...',
    login: 'Sedang login...',
    logout: 'Sedang logout...',
    upload: 'Mengunggah file...',
    download: 'Mengunduh file...',
    fetch: 'Memuat data...',
    send: 'Mengirim data...',
  },

  // Info messages
  info: {
    noData: 'Tidak ada data tersedia',
    selectItem: 'Pilih item terlebih dahulu',
    confirmAction: 'Konfirmasi tindakan Anda',
    sessionExpired: 'Sesi Anda telah berakhir',
    maintenance: 'Sistem sedang dalam pemeliharaan',
  },

  // Warning messages
  warning: {
    unsavedChanges: 'Ada perubahan yang belum disimpan',
    deleteConfirm: 'Data yang dihapus tidak dapat dikembalikan',
    largeFile: 'Ukuran file terlalu besar',
    slowConnection: 'Koneksi lambat terdeteksi',
    browserSupport: 'Browser Anda mungkin tidak mendukung fitur ini',
  },
};

// Toast provider component
export function ToastProvider() {
  return (
    <Toaster
      position="top-right"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
          borderRadius: '8px',
          padding: '12px 16px',
          maxWidth: '400px',
        },
        // Default options for specific types
        success: {
          iconTheme: {
            primary: '#10B981',
            secondary: '#fff',
          },
        },
        error: {
          iconTheme: {
            primary: '#EF4444',
            secondary: '#fff',
          },
        },
      }}
    />
  );
}

// Utility functions for common operations
export const handleApiResponse = {
  success: (message?: string) => {
    showToast.success(message || toastMessages.success.save);
  },

  error: (error: any, fallbackMessage?: string) => {
    let message = fallbackMessage || toastMessages.error.generic;
    
    if (error?.response?.data?.message) {
      message = error.response.data.message;
    } else if (error?.message) {
      message = error.message;
    } else if (typeof error === 'string') {
      message = error;
    }

    showToast.error(message);
  },

  promise: <T,>(
    promise: Promise<T>,
    loadingMessage?: string,
    successMessage?: string,
    errorMessage?: string
  ) => {
    return showToast.promise(
      promise,
      {
        loading: loadingMessage || toastMessages.loading.save,
        success: successMessage || toastMessages.success.save,
        error: (error) => {
          if (error?.response?.data?.message) {
            return error.response.data.message;
          }
          return errorMessage || toastMessages.error.generic;
        },
      }
    );
  },
};

// Export the original toast for advanced usage
export { toast };
export default showToast;