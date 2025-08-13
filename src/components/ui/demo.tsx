// Demo page to showcase all UI components
'use client';

import React, { useState } from 'react';
import {
  Button,
  Input,
  Textarea,
  Modal,
  ConfirmModal,
  AlertModal,
  DataTable,
  Loading,
  LoadingSpinner,
  Skeleton,
  SkeletonCard,
  SkeletonTable,
  showToast,
  toastMessages,
} from './index';

// Sample data for table demo
const sampleData = [
  { id: 1, name: 'John Doe', email: 'john@example.com', role: 'Admin', status: 'Active' },
  { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'User', status: 'Active' },
  { id: 3, name: 'Bob Johnson', email: 'bob@example.com', role: 'User', status: 'Inactive' },
  { id: 4, name: 'Alice Brown', email: 'alice@example.com', role: 'Moderator', status: 'Active' },
  { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', role: 'User', status: 'Active' },
];

const tableColumns = [
  { key: 'name', title: 'Nama', sortable: true },
  { key: 'email', title: 'Email', sortable: true },
  { key: 'role', title: 'Role', sortable: false },
  {
    key: 'status',
    title: 'Status',
    sortable: true,
    render: (value: string) => (
      <span
        className={`px-2 py-1 rounded-full text-xs font-medium ${
          value === 'Active'
            ? 'bg-green-100 text-green-800'
            : 'bg-red-100 text-red-800'
        }`}
      >
        {value}
      </span>
    ),
  },
  {
    key: 'actions',
    title: 'Aksi',
    sortable: false,
    render: (_: any, row: any) => (
      <div className="flex space-x-2">
        <Button size="sm" variant="outline">
          Edit
        </Button>
        <Button size="sm" variant="destructive">
          Hapus
        </Button>
      </div>
    ),
  },
];

export default function UIComponentsDemo() {
  const [modalOpen, setModalOpen] = useState(false);
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [alertModalOpen, setAlertModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);

  const handleToastDemo = (type: string) => {
    switch (type) {
      case 'success':
        showToast.success(toastMessages.success.save);
        break;
      case 'error':
        showToast.error(toastMessages.error.network);
        break;
      case 'loading':
        const loadingToast = showToast.loading(toastMessages.loading.save);
        setTimeout(() => {
          showToast.dismiss(loadingToast);
          showToast.success('Selesai!');
        }, 2000);
        break;
      case 'warning':
        showToast.warning(toastMessages.warning.unsavedChanges);
        break;
      case 'info':
        showToast.info(toastMessages.info.noData);
        break;
      case 'promise':
        const promise = new Promise((resolve, reject) => {
          setTimeout(() => {
            Math.random() > 0.5 ? resolve('Success!') : reject('Failed!');
          }, 2000);
        });
        showToast.promise(promise, {
          loading: 'Memproses...',
          success: 'Berhasil!',
          error: 'Gagal!',
        });
        break;
    }
  };

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const handleSkeletonDemo = () => {
    setShowSkeleton(true);
    setTimeout(() => setShowSkeleton(false), 3000);
  };

  const validateInput = (value: string) => {
    setInputValue(value);
    setInputError(value.length < 3);
  };

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">
        UI Components Demo
      </h1>

      {/* Buttons */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Buttons</h2>
        <div className="flex flex-wrap gap-4">
          <Button variant="default">Default</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="link">Link</Button>
          <Button variant="success">Success</Button>
          <Button variant="warning">Warning</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="default">Default</Button>
          <Button size="lg">Large</Button>
          <Button size="icon">🔍</Button>
        </div>
        <div className="flex flex-wrap gap-4">
          <Button loading>Loading</Button>
          <Button leftIcon={<span>📁</span>}>With Left Icon</Button>
          <Button rightIcon={<span>→</span>}>With Right Icon</Button>
          <Button disabled>Disabled</Button>
        </div>
      </section>

      {/* Inputs */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Inputs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Basic Input"
            placeholder="Enter text..."
            helperText="This is a helper text"
          />
          <Input
            label="Input with Error"
            value={inputValue}
            onChange={(e) => validateInput(e.target.value)}
            error={inputError}
            helperText={inputError ? "Minimum 3 characters required" : "Looks good!"}
            success={!inputError && inputValue.length > 0}
          />
          <Input
            label="Input with Left Icon"
            leftIcon={<span>🔍</span>}
            placeholder="Search..."
          />
          <Input
            label="Input with Right Icon"
            rightIcon={<span>👁️</span>}
            type="password"
            placeholder="Password..."
          />
        </div>
        <Textarea
          label="Textarea"
          placeholder="Enter your message..."
          helperText="Maximum 500 characters"
          rows={4}
        />
      </section>

      {/* Modals */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Modals</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
          <Button onClick={() => setConfirmModalOpen(true)}>Confirm Modal</Button>
          <Button onClick={() => setAlertModalOpen(true)}>Alert Modal</Button>
        </div>

        <Modal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          title="Sample Modal"
          description="This is a sample modal dialog"
        >
          <div className="space-y-4">
            <p>This is the modal content. You can put any content here.</p>
            <Input label="Sample Input" placeholder="Type something..." />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setModalOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setModalOpen(false)}>
                Save
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmModal
          isOpen={confirmModalOpen}
          onClose={() => setConfirmModalOpen(false)}
          onConfirm={() => {
            showToast.success('Action confirmed!');
            setConfirmModalOpen(false);
          }}
          title="Confirm Action"
          message="Are you sure you want to proceed with this action?"
          variant="destructive"
        />

        <AlertModal
          isOpen={alertModalOpen}
          onClose={() => setAlertModalOpen(false)}
          title="Information"
          message="This is an informational alert modal."
          variant="info"
        />
      </section>

      {/* Loading States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Loading States</h2>
        <div className="flex flex-wrap gap-4 items-center">
          <Loading size="xs" />
          <Loading size="sm" />
          <Loading size="md" />
          <Loading size="lg" />
          <Loading size="xl" />
        </div>
        <div className="space-y-4">
          <LoadingSpinner text="Loading data..." />
          <Button onClick={handleLoadingDemo}>
            {loading ? 'Loading...' : 'Demo Loading'}
          </Button>
          {loading && <LoadingSpinner text="Processing..." />}
        </div>
      </section>

      {/* Skeleton States */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Skeleton States</h2>
        <Button onClick={handleSkeletonDemo}>
          {showSkeleton ? 'Loading...' : 'Demo Skeleton'}
        </Button>
        {showSkeleton ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-48" />
            <SkeletonCard />
            <SkeletonTable rows={3} columns={4} />
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Sample Content</h3>
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2">Sample Card</h4>
              <p className="text-gray-600 mb-4">This is sample content that would be replaced by skeleton loading.</p>
              <div className="flex space-x-2">
                <Button size="sm">Action 1</Button>
                <Button size="sm" variant="outline">Action 2</Button>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Toast Notifications */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Toast Notifications</h2>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => handleToastDemo('success')} variant="success">
            Success Toast
          </Button>
          <Button onClick={() => handleToastDemo('error')} variant="destructive">
            Error Toast
          </Button>
          <Button onClick={() => handleToastDemo('loading')}>
            Loading Toast
          </Button>
          <Button onClick={() => handleToastDemo('warning')} variant="warning">
            Warning Toast
          </Button>
          <Button onClick={() => handleToastDemo('info')}>
            Info Toast
          </Button>
          <Button onClick={() => handleToastDemo('promise')}>
            Promise Toast
          </Button>
        </div>
      </section>

      {/* Data Table */}
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold text-gray-800">Data Table</h2>
        <DataTable
          data={sampleData}
          columns={tableColumns}
          pagination
          pageSize={3}
          selectable
          sortable
          emptyMessage="No data available"
        />
      </section>
    </div>
  );
}