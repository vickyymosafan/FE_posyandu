'use client';

import React from 'react';
import { ResponsiveFormDemo, SimpleResponsiveFormExample } from '@/components/ui/ResponsiveFormDemo';
import { ResponsiveContainer } from '@/components/ui/ResponsiveContainer';

export default function ResponsiveFormDemoPage() {
  return (
    <ResponsiveContainer className="py-8">
      <div className="space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Demo Form Responsif
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Demonstrasi komponen ResponsiveForm yang menyesuaikan layout berdasarkan ukuran layar.
            Coba ubah ukuran browser untuk melihat perubahan layout.
          </p>
        </div>

        {/* Breakpoint Indicator */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h2 className="text-lg font-semibold text-blue-900 mb-2">
            Indikator Breakpoint Saat Ini
          </h2>
          <div className="flex gap-4">
            <div className="block sm:hidden bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-medium">
              📱 Mobile (&lt; 640px)
            </div>
            <div className="hidden sm:block md:hidden bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              📱 Small (640px - 768px)
            </div>
            <div className="hidden md:block lg:hidden bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
              📱 Tablet (768px - 1024px)
            </div>
            <div className="hidden lg:block xl:hidden bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
              💻 Desktop (1024px - 1280px)
            </div>
            <div className="hidden xl:block bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm font-medium">
              🖥️ Large Desktop (&gt; 1280px)
            </div>
          </div>
        </div>

        {/* Layout Behavior Guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Perilaku Layout Responsif
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Mobile</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Layout single column</li>
                <li>• Input lebih besar (16px font)</li>
                <li>• Button full width</li>
                <li>• Spacing lebih kecil</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">📱 Tablet</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Layout two-column adaptif</li>
                <li>• Input ukuran sedang</li>
                <li>• Button side-by-side</li>
                <li>• Spacing sedang</li>
              </ul>
            </div>
            <div className="bg-white p-4 rounded-lg border">
              <h3 className="font-semibold text-gray-900 mb-2">💻 Desktop</h3>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Layout multi-column</li>
                <li>• Input ukuran standar</li>
                <li>• Button compact</li>
                <li>• Spacing lebih besar</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Complex Form Demo */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Form Kompleks dengan Section
          </h2>
          <ResponsiveFormDemo />
        </div>

        {/* Simple Form Demo */}
        <div>
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Form Sederhana
          </h2>
          <SimpleResponsiveFormExample />
        </div>

        {/* Usage Guide */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Cara Penggunaan
          </h2>
          <div className="prose prose-sm max-w-none">
            <h3>1. Import Komponen</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`import {
  ResponsiveForm,
  ResponsiveFormField,
  ResponsiveFormSection,
  ResponsiveFormActions
} from '@/components/ui/ResponsiveForm';`}
            </pre>

            <h3>2. Struktur Dasar</h3>
            <pre className="bg-gray-800 text-gray-100 p-4 rounded-lg overflow-x-auto">
{`<ResponsiveForm onSubmit={handleSubmit} layout="adaptive">
  <ResponsiveFormSection title="Data Personal">
    <ResponsiveForm layout="adaptive">
      <ResponsiveFormField fullWidth>
        <Input label="Nama Lengkap" />
      </ResponsiveFormField>
      
      <ResponsiveFormField>
        <Input label="Email" />
      </ResponsiveFormField>
      
      <ResponsiveFormField>
        <Input label="Telepon" />
      </ResponsiveFormField>
    </ResponsiveForm>
  </ResponsiveFormSection>
  
  <ResponsiveFormActions alignment="right">
    <Button type="submit">Simpan</Button>
  </ResponsiveFormActions>
</ResponsiveForm>`}
            </pre>

            <h3>3. Layout Options</h3>
            <ul>
              <li><strong>single</strong>: Selalu single column</li>
              <li><strong>adaptive</strong>: Mobile=1, Tablet=2, Desktop=2 kolom</li>
              <li><strong>multi</strong>: Mobile=1, Tablet=2, Desktop=3 kolom</li>
            </ul>
          </div>
        </div>
      </div>
    </ResponsiveContainer>
  );
}