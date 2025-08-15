'use client';

import React, { useState } from 'react';
import {
  ResponsiveForm,
  ResponsiveFormField,
  ResponsiveFormGroup,
  ResponsiveFormActions,
  ResponsiveFormSection
} from './ResponsiveForm';
import { Input, Textarea } from './input';
import { Button } from './button';
import { Card } from './card';
import { toast } from 'react-hot-toast';

interface DemoFormData {
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  kota: string;
  kodePos: string;
  catatan: string;
}

/**
 * Demo component untuk menunjukkan penggunaan ResponsiveForm
 */
export function ResponsiveFormDemo() {
  const [formData, setFormData] = useState<DemoFormData>({
    nama: '',
    email: '',
    telepon: '',
    alamat: '',
    kota: '',
    kodePos: '',
    catatan: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleInputChange = (field: keyof DemoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Form berhasil disimpan!');
      
      // Reset form
      setFormData({
        nama: '',
        email: '',
        telepon: '',
        alamat: '',
        kota: '',
        kodePos: '',
        catatan: ''
      });
    } catch (error) {
      toast.error('Gagal menyimpan form');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData({
      nama: '',
      email: '',
      telepon: '',
      alamat: '',
      kota: '',
      kodePos: '',
      catatan: ''
    });
    toast.success('Form berhasil direset');
  };

  return (
    <Card className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Demo Form Responsif
        </h2>
        <p className="text-gray-600">
          Contoh penggunaan ResponsiveForm dengan layout yang menyesuaikan ukuran layar
        </p>
      </div>

      <ResponsiveForm onSubmit={handleSubmit} layout="adaptive">
        {/* Section 1: Informasi Personal */}
        <ResponsiveFormSection
          title="Informasi Personal"
          description="Data pribadi dan kontak"
          className="col-span-full"
        >
          <ResponsiveForm layout="adaptive" spacing={true}>
            {/* Nama Lengkap - Full width */}
            <ResponsiveFormField fullWidth>
              <Input
                label="Nama Lengkap *"
                type="text"
                value={formData.nama}
                onChange={(e) => handleInputChange('nama', e.target.value)}
                placeholder="Masukkan nama lengkap"
                required
                responsive
              />
            </ResponsiveFormField>

            {/* Email dan Telepon - Side by side on tablet/desktop */}
            <ResponsiveFormField>
              <Input
                label="Email *"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="nama@email.com"
                required
                responsive
              />
            </ResponsiveFormField>

            <ResponsiveFormField>
              <Input
                label="Nomor Telepon"
                type="tel"
                value={formData.telepon}
                onChange={(e) => handleInputChange('telepon', e.target.value)}
                placeholder="081234567890"
                responsive
              />
            </ResponsiveFormField>
          </ResponsiveForm>
        </ResponsiveFormSection>

        {/* Section 2: Alamat */}
        <ResponsiveFormSection
          title="Alamat"
          description="Informasi alamat lengkap"
          className="col-span-full"
          collapsible
          defaultExpanded={true}
        >
          <ResponsiveForm layout="adaptive" spacing={true}>
            {/* Alamat - Full width */}
            <ResponsiveFormField fullWidth>
              <Textarea
                label="Alamat Lengkap"
                value={formData.alamat}
                onChange={(e) => handleInputChange('alamat', e.target.value)}
                placeholder="Masukkan alamat lengkap"
                rows={3}
                responsive
              />
            </ResponsiveFormField>

            {/* Kota dan Kode Pos - Side by side */}
            <ResponsiveFormField>
              <Input
                label="Kota"
                type="text"
                value={formData.kota}
                onChange={(e) => handleInputChange('kota', e.target.value)}
                placeholder="Nama kota"
                responsive
              />
            </ResponsiveFormField>

            <ResponsiveFormField>
              <Input
                label="Kode Pos"
                type="text"
                value={formData.kodePos}
                onChange={(e) => {
                  const value = e.target.value.replace(/\D/g, '').slice(0, 5);
                  handleInputChange('kodePos', value);
                }}
                placeholder="12345"
                maxLength={5}
                responsive
              />
            </ResponsiveFormField>
          </ResponsiveForm>
        </ResponsiveFormSection>

        {/* Section 3: Catatan */}
        <ResponsiveFormSection
          title="Catatan Tambahan"
          description="Informasi tambahan (opsional)"
          className="col-span-full"
          collapsible
          defaultExpanded={false}
        >
          <ResponsiveFormField fullWidth>
            <Textarea
              label="Catatan"
              value={formData.catatan}
              onChange={(e) => handleInputChange('catatan', e.target.value)}
              placeholder="Tambahkan catatan jika diperlukan"
              rows={4}
              responsive
            />
          </ResponsiveFormField>
        </ResponsiveFormSection>

        {/* Form Actions */}
        <ResponsiveFormActions 
          className="col-span-full"
          alignment="space-between"
        >
          <Button
            type="button"
            variant="outline"
            onClick={handleReset}
            disabled={isSubmitting}
            responsive
          >
            Reset Form
          </Button>
          
          <div className="flex gap-3">
            <Button
              type="button"
              variant="ghost"
              disabled={isSubmitting}
              responsive
            >
              Batal
            </Button>
            
            <Button
              type="submit"
              loading={isSubmitting}
              disabled={isSubmitting}
              responsive
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Data'}
            </Button>
          </div>
        </ResponsiveFormActions>
      </ResponsiveForm>
    </Card>
  );
}

/**
 * Simple form example untuk penggunaan dasar
 */
export function SimpleResponsiveFormExample() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Form sederhana berhasil dikirim!');
    setName('');
    setEmail('');
    setMessage('');
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto">
      <h3 className="text-lg font-semibold mb-4">Form Sederhana</h3>
      
      <ResponsiveForm onSubmit={handleSubmit} layout="single">
        <ResponsiveFormField>
          <Input
            label="Nama"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Masukkan nama"
            required
            responsive
          />
        </ResponsiveFormField>

        <ResponsiveFormField>
          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="nama@email.com"
            required
            responsive
          />
        </ResponsiveFormField>

        <ResponsiveFormField>
          <Textarea
            label="Pesan"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tulis pesan Anda"
            rows={4}
            required
            responsive
          />
        </ResponsiveFormField>

        <ResponsiveFormActions alignment="right">
          <Button type="submit" responsive>
            Kirim Pesan
          </Button>
        </ResponsiveFormActions>
      </ResponsiveForm>
    </Card>
  );
}

export default ResponsiveFormDemo;