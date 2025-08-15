import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import MainLayout from '../MainLayout';
import { useAuth } from '@/contexts/AuthContext';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';

// Mock the dependencies
jest.mock('@/contexts/AuthContext');
jest.mock('@/lib/hooks/useBreakpoint');
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
}));

const mockUseAuth = useAuth as jest.MockedFunction<typeof useAuth>;
const mockUseBreakpoint = useBreakpoint as jest.MockedFunction<typeof useBreakpoint>;

describe('MainLayout Responsive Integration', () => {
  const mockAdmin = {
    id: 1,
    nama_lengkap: 'Test Admin',
    nama_pengguna: 'admin',
    email: 'admin@test.com',
  };

  const mockLogout = jest.fn();

  beforeEach(() => {
    mockUseAuth.mockReturnValue({
      admin: mockAdmin,
      logout: mockLogout,
      login: jest.fn(),
      refreshToken: jest.fn(),
      isLoading: false,
      isAuthenticated: true,
    });
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should render mobile navigation when breakpoint is mobile', () => {
    mockUseBreakpoint.mockReturnValue({
      currentBreakpoint: 'mobile',
      screenSize: { width: 375, height: 667 },
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait',
      touchDevice: true,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Should show hamburger button for mobile
    const hamburgerButton = screen.getByRole('button', { name: /buka menu/i });
    expect(hamburgerButton).toBeInTheDocument();

    // Should not show static sidebar for mobile (sidebar is hidden by default)
    const mobileSidebar = screen.queryByText('Posyandu');
    // Mobile sidebar exists but is hidden (translate-x-full)
    expect(mobileSidebar).toBeInTheDocument();
  });

  it('should render tablet navigation when breakpoint is tablet', () => {
    mockUseBreakpoint.mockReturnValue({
      currentBreakpoint: 'tablet',
      screenSize: { width: 768, height: 1024 },
      isMobile: false,
      isTablet: true,
      isDesktop: false,
      orientation: 'portrait',
      touchDevice: true,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Should show toggle button for collapsible sidebar
    const toggleButton = screen.getByTitle(/ciutkan menu|perluas menu/i);
    expect(toggleButton).toBeInTheDocument();

    // Should not show hamburger button for tablet
    expect(screen.queryByRole('button', { name: /buka menu/i })).not.toBeInTheDocument();
  });

  it('should render desktop navigation when breakpoint is desktop', () => {
    mockUseBreakpoint.mockReturnValue({
      currentBreakpoint: 'desktop',
      screenSize: { width: 1440, height: 900 },
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
      touchDevice: false,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Should show persistent sidebar for desktop
    expect(screen.getByText('Posyandu')).toBeInTheDocument();

    // Should show search input for desktop
    const searchInput = screen.getByPlaceholderText(/cari pasien/i);
    expect(searchInput).toBeInTheDocument();

    // Should show breadcrumb navigation
    expect(screen.getByText('Beranda')).toBeInTheDocument();
  });

  it('should open mobile sidebar when hamburger is clicked', () => {
    mockUseBreakpoint.mockReturnValue({
      currentBreakpoint: 'mobile',
      screenSize: { width: 375, height: 667 },
      isMobile: true,
      isTablet: false,
      isDesktop: false,
      orientation: 'portrait',
      touchDevice: true,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    const hamburgerButton = screen.getByRole('button', { name: /buka menu/i });
    fireEvent.click(hamburgerButton);

    // Should show sidebar content after clicking hamburger
    expect(screen.getByText('Posyandu')).toBeInTheDocument();
    // Use getAllByText to handle multiple instances
    const dasborElements = screen.getAllByText('Dasbor');
    expect(dasborElements.length).toBeGreaterThan(0);
    expect(screen.getByText('Pasien')).toBeInTheDocument();
  });

  it('should use Indonesian navigation labels', () => {
    mockUseBreakpoint.mockReturnValue({
      currentBreakpoint: 'desktop',
      screenSize: { width: 1440, height: 900 },
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
      touchDevice: false,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // Check Indonesian navigation labels (using getAllByText for multiple instances)
    expect(screen.getAllByText('Dasbor').length).toBeGreaterThan(0);
    expect(screen.getByText('Pasien')).toBeInTheDocument();
    expect(screen.getByText('Pemeriksaan')).toBeInTheDocument();
    expect(screen.getByText('Pindai Barcode')).toBeInTheDocument();
    expect(screen.getByText('Keluar')).toBeInTheDocument();
  });

  it('should show user information correctly', () => {
    mockUseBreakpoint.mockReturnValue({
      currentBreakpoint: 'desktop',
      screenSize: { width: 1440, height: 900 },
      isMobile: false,
      isTablet: false,
      isDesktop: true,
      orientation: 'landscape',
      touchDevice: false,
    });

    render(
      <MainLayout>
        <div>Test Content</div>
      </MainLayout>
    );

    // User info appears in multiple places (header and sidebar)
    expect(screen.getAllByText('Test Admin').length).toBeGreaterThan(0);
    expect(screen.getAllByText('admin').length).toBeGreaterThan(0);
  });
});