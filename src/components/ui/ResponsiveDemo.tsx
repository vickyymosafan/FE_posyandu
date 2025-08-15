'use client';

import React from 'react';
import { useBreakpoint } from '../../lib/hooks/useBreakpoint';
import { ResponsiveContainer, ResponsiveGrid, ResponsiveCard } from './ResponsiveContainer';
import { ResponsiveHeading, ResponsiveText } from './ResponsiveTypography';

/**
 * Demo component untuk menampilkan responsive behavior
 * Hanya untuk testing dan development
 */
export function ResponsiveDemo() {
  const {
    currentBreakpoint,
    screenSize,
    isMobile,
    isTablet,
    isDesktop,
    orientation,
    touchDevice
  } = useBreakpoint();

  return (
    <ResponsiveContainer className="py-8">
      <ResponsiveHeading level={1} className="mb-6">
        Demo Responsif Sistem Posyandu
      </ResponsiveHeading>

      <ResponsiveGrid columns={{ mobile: 1, tablet: 2, desktop: 3 }} className="mb-8">
        <ResponsiveCard>
          <ResponsiveHeading level={3} className="mb-4">
            Informasi Breakpoint
          </ResponsiveHeading>
          <div className="space-y-2">
            <ResponsiveText>
              <strong>Breakpoint Saat Ini:</strong> {currentBreakpoint}
            </ResponsiveText>
            <ResponsiveText>
              <strong>Ukuran Layar:</strong> {screenSize.width} x {screenSize.height}
            </ResponsiveText>
            <ResponsiveText>
              <strong>Orientasi:</strong> {orientation}
            </ResponsiveText>
            <ResponsiveText>
              <strong>Perangkat Touch:</strong> {touchDevice ? 'Ya' : 'Tidak'}
            </ResponsiveText>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveHeading level={3} className="mb-4">
            Status Perangkat
          </ResponsiveHeading>
          <div className="space-y-2">
            <div className={`p-2 rounded ${isMobile ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              Mobile: {isMobile ? 'Aktif' : 'Tidak Aktif'}
            </div>
            <div className={`p-2 rounded ${isTablet ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              Tablet: {isTablet ? 'Aktif' : 'Tidak Aktif'}
            </div>
            <div className={`p-2 rounded ${isDesktop ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
              Desktop: {isDesktop ? 'Aktif' : 'Tidak Aktif'}
            </div>
          </div>
        </ResponsiveCard>

        <ResponsiveCard>
          <ResponsiveHeading level={3} className="mb-4">
            Contoh Typography
          </ResponsiveHeading>
          <div className="space-y-3">
            <ResponsiveText variant="h1">Heading 1</ResponsiveText>
            <ResponsiveText variant="h2">Heading 2</ResponsiveText>
            <ResponsiveText variant="h3">Heading 3</ResponsiveText>
            <ResponsiveText variant="body">
              Ini adalah contoh teks body yang akan menyesuaikan ukuran berdasarkan breakpoint.
            </ResponsiveText>
            <ResponsiveText variant="caption" color="muted">
              Caption text dengan warna muted
            </ResponsiveText>
          </div>
        </ResponsiveCard>
      </ResponsiveGrid>

      <ResponsiveCard className="mb-8">
        <ResponsiveHeading level={2} className="mb-4">
          Contoh Form Responsif
        </ResponsiveHeading>
        <div className="form-responsive">
          <div className="form-group-responsive">
            <label className="text-responsive-sm font-medium">Nama Lengkap:</label>
            <input 
              type="text" 
              className="input-responsive border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Masukkan nama lengkap"
            />
          </div>
          <div className="form-group-responsive">
            <label className="text-responsive-sm font-medium">Tanggal Lahir:</label>
            <input 
              type="date" 
              className="input-responsive border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent"
            />
          </div>
          <div className="form-group-responsive">
            <label className="text-responsive-sm font-medium">Alamat:</label>
            <textarea 
              className="input-responsive border border-border rounded focus:ring-2 focus:ring-primary focus:border-transparent min-h-[80px]"
              placeholder="Masukkan alamat lengkap"
              rows={3}
            />
          </div>
        </div>
      </ResponsiveCard>

      <ResponsiveCard>
        <ResponsiveHeading level={2} className="mb-4">
          Contoh Button Responsif
        </ResponsiveHeading>
        <div className="flex flex-wrap gap-4">
          <button className="touch-target bg-primary text-primary-foreground px-6 py-3 rounded-md font-medium hover:bg-primary/90 transition-colors">
            Button Primary
          </button>
          <button className="touch-target bg-secondary text-secondary-foreground px-6 py-3 rounded-md font-medium hover:bg-secondary/90 transition-colors">
            Button Secondary
          </button>
          <button className="touch-target border border-border text-foreground px-6 py-3 rounded-md font-medium hover:bg-accent transition-colors">
            Button Outline
          </button>
        </div>
      </ResponsiveCard>

      <div className="mt-8 p-4 bg-muted rounded-lg">
        <ResponsiveText variant="caption" color="muted">
          Demo ini menampilkan berbagai komponen responsif yang telah diimplementasi. 
          Coba ubah ukuran browser untuk melihat perubahan layout dan typography.
        </ResponsiveText>
      </div>
    </ResponsiveContainer>
  );
}