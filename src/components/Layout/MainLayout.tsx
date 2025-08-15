'use client';

import React, { useState, useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { formatDateTime } from '@/lib/utils';
import { useBreakpoint } from '@/lib/hooks/useBreakpoint';
import { 
  getResponsiveSpacing, 
  getResponsiveTypography,
  responsiveNavigation,
  combineResponsiveClasses 
} from '@/lib/utils/responsive';

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tabletSidebarCollapsed, setTabletSidebarCollapsed] = useState(true);
  const [tabletSidebarHovered, setTabletSidebarHovered] = useState(false);
  const { admin, logout } = useAuth();
  const pathname = usePathname();
  const { currentBreakpoint, isMobile, isTablet, isDesktop } = useBreakpoint();
  const sidebarRef = useRef<HTMLDivElement>(null);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const navigation = [
    {
      name: 'Dasbor',
      href: '/dashboard',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
        </svg>
      ),
    },
    {
      name: 'Pasien',
      href: '/pasien',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
        </svg>
      ),
    },
    {
      name: 'Pemeriksaan',
      href: '/pemeriksaan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      ),
    },
    {
      name: 'Tes Lanjutan',
      href: '/tes-lanjutan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      name: 'Penilaian',
      href: '/penilaian',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      name: 'Pengobatan',
      href: '/pengobatan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
      ),
    },
    {
      name: 'Pindai Barcode',
      href: '/scan',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
        </svg>
      ),
    },
  ];

  const isCurrentPath = (href: string) => {
    return pathname === href || pathname.startsWith(href + '/');
  };

  // Get responsive navigation configuration
  const navConfig = responsiveNavigation[currentBreakpoint];
  
  // Get responsive classes
  const containerPadding = getResponsiveSpacing('container', currentBreakpoint);
  const sectionPadding = getResponsiveSpacing('section', currentBreakpoint);
  const titleTypography = getResponsiveTypography('h1', currentBreakpoint);
  
  // Handle navigation based on breakpoint
  const shouldShowMobileNav = isMobile;
  const shouldShowTabletNav = isTablet;
  const shouldShowDesktopNav = isDesktop;

  // Swipe gesture handling for mobile
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;

    if (isLeftSwipe && sidebarOpen) {
      setSidebarOpen(false);
    }
  };

  // Auto-close sidebar when navigating (mobile only)
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  // Close sidebar when breakpoint changes from mobile
  useEffect(() => {
    if (!isMobile && sidebarOpen) {
      setSidebarOpen(false);
    }
  }, [isMobile, sidebarOpen]);

  // Load tablet sidebar state from localStorage
  useEffect(() => {
    if (shouldShowTabletNav) {
      const savedState = localStorage.getItem('tabletSidebarCollapsed');
      if (savedState !== null) {
        setTabletSidebarCollapsed(JSON.parse(savedState));
      }
    }
  }, [shouldShowTabletNav]);

  // Save tablet sidebar state to localStorage
  useEffect(() => {
    if (shouldShowTabletNav) {
      localStorage.setItem('tabletSidebarCollapsed', JSON.stringify(tabletSidebarCollapsed));
    }
  }, [tabletSidebarCollapsed, shouldShowTabletNav]);

  // Keyboard navigation for desktop
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Alt + M to toggle mobile sidebar
      if (event.altKey && event.key === 'm' && isMobile) {
        event.preventDefault();
        setSidebarOpen(!sidebarOpen);
      }
      
      // Alt + T to toggle tablet sidebar
      if (event.altKey && event.key === 't' && isTablet) {
        event.preventDefault();
        setTabletSidebarCollapsed(!tabletSidebarCollapsed);
      }
      
      // Escape to close mobile sidebar
      if (event.key === 'Escape' && isMobile && sidebarOpen) {
        setSidebarOpen(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isMobile, isTablet, sidebarOpen, tabletSidebarCollapsed]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar */}
      {shouldShowMobileNav && (
        <div className={`fixed inset-0 flex z-50 ${sidebarOpen ? '' : 'pointer-events-none'}`}>
          {/* Backdrop overlay */}
          <div
            className={`fixed inset-0 bg-gray-900 transition-opacity ease-in-out duration-300 ${
              sidebarOpen ? 'opacity-50' : 'opacity-0'
            }`}
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />

          {/* Sidebar panel */}
          <div
            ref={sidebarRef}
            className={`relative flex-1 flex flex-col ${navConfig.width} bg-white shadow-xl transform transition-transform ease-in-out duration-300 ${
              sidebarOpen ? 'translate-x-0' : '-translate-x-full'
            }`}
            onTouchStart={onTouchStart}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
          >
            {/* Close button */}
            <div className="absolute top-0 right-0 -mr-12 pt-2">
              <button
                type="button"
                className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white min-h-[44px] min-w-[44px] bg-gray-600 bg-opacity-20"
                onClick={() => setSidebarOpen(false)}
              >
                <span className="sr-only">Tutup menu</span>
                <svg
                  className="h-6 w-6 text-white"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Sidebar content */}
            <div className="flex-1 h-0 pt-5 pb-4 overflow-y-auto">
              {/* Logo and title */}
              <div className={`flex-shrink-0 flex items-center ${containerPadding}`}>
                <div className="h-10 w-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-md">
                  <span className="text-white font-bold text-base">P</span>
                </div>
                <span className="ml-3 text-xl font-semibold text-gray-900">Posyandu</span>
              </div>

              {/* Navigation menu */}
              <nav className="mt-8 px-2 space-y-2">
                {navigation.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={combineResponsiveClasses(
                      'group flex items-center px-3 py-3 text-base font-medium rounded-lg min-h-[44px] transition-all duration-200',
                      isCurrentPath(item.href)
                        ? 'bg-blue-100 text-blue-900 shadow-sm'
                        : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900 active:bg-gray-100'
                    )}
                    onClick={() => setSidebarOpen(false)}
                    style={{
                      animationDelay: sidebarOpen ? `${index * 50}ms` : '0ms'
                    }}
                  >
                    <span className={`mr-4 transition-colors duration-200 ${
                      isCurrentPath(item.href) 
                        ? 'text-blue-600' 
                        : 'text-gray-400 group-hover:text-gray-600'
                    }`}>
                      {item.icon}
                    </span>
                    <span className="font-medium">{item.name}</span>
                    {isCurrentPath(item.href) && (
                      <div className="ml-auto w-2 h-2 bg-blue-600 rounded-full"></div>
                    )}
                  </Link>
                ))}
              </nav>

              {/* Footer info */}
              <div className="mt-8 px-4 py-4 border-t border-gray-200">
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <span className="text-white font-medium text-sm">
                      {admin?.nama_lengkap?.charAt(0).toUpperCase() || 'A'}
                    </span>
                  </div>
                  <div className="ml-3">
                    <div className="text-sm font-medium text-gray-900">
                      {admin?.nama_lengkap || 'Administrator'}
                    </div>
                    <div className="text-xs text-gray-500">
                      {admin?.nama_pengguna || 'admin'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Static sidebar for tablet and desktop */}
      {!shouldShowMobileNav && (shouldShowTabletNav || shouldShowDesktopNav) && (
        <div 
          className={combineResponsiveClasses(
            'flex flex-col fixed inset-y-0 transition-all duration-300 ease-in-out z-30',
            shouldShowTabletNav 
              ? (tabletSidebarCollapsed && !tabletSidebarHovered ? 'w-16' : 'w-64')
              : 'w-64'
          )}
          onMouseEnter={() => shouldShowTabletNav && setTabletSidebarHovered(true)}
          onMouseLeave={() => shouldShowTabletNav && setTabletSidebarHovered(false)}
        >
          <div className="flex-1 flex flex-col min-h-0 border-r border-gray-200 bg-white shadow-sm">
            <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
              {/* Header with toggle button for tablet */}
              <div className={`flex items-center flex-shrink-0 ${containerPadding} ${shouldShowTabletNav ? 'justify-between' : ''}`}>
                <div className="flex items-center">
                  <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
                    <span className="text-white font-bold text-sm">P</span>
                  </div>
                  {(shouldShowDesktopNav || (shouldShowTabletNav && (!tabletSidebarCollapsed || tabletSidebarHovered))) && (
                    <span className="ml-2 text-lg font-semibold text-gray-900 transition-opacity duration-200">
                      Posyandu
                    </span>
                  )}
                </div>
                
                {/* Toggle button for tablet */}
                {shouldShowTabletNav && (
                  <button
                    onClick={() => setTabletSidebarCollapsed(!tabletSidebarCollapsed)}
                    className={combineResponsiveClasses(
                      'p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200',
                      tabletSidebarCollapsed && !tabletSidebarHovered ? 'opacity-0' : 'opacity-100'
                    )}
                    title={tabletSidebarCollapsed ? 'Perluas menu' : 'Ciutkan menu'}
                  >
                    <svg 
                      className={`h-5 w-5 transition-transform duration-200 ${tabletSidebarCollapsed ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                    </svg>
                  </button>
                )}
              </div>

              {/* Navigation menu */}
              <nav className="mt-5 flex-1 px-2 space-y-1">
                {navigation.map((item) => {
                  const isActive = isCurrentPath(item.href);
                  const showLabel = shouldShowDesktopNav || (shouldShowTabletNav && (!tabletSidebarCollapsed || tabletSidebarHovered));
                  
                  return (
                    <div key={item.name} className="relative">
                      <Link
                        href={item.href}
                        className={combineResponsiveClasses(
                          'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                          shouldShowTabletNav && tabletSidebarCollapsed && !tabletSidebarHovered ? 'justify-center' : '',
                          isActive
                            ? 'bg-blue-100 text-blue-900 shadow-sm'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 hover:shadow-sm'
                        )}
                        title={shouldShowTabletNav && tabletSidebarCollapsed && !tabletSidebarHovered ? item.name : undefined}
                        aria-current={isActive ? 'page' : undefined}
                      >
                        <span className={combineResponsiveClasses(
                          'transition-colors duration-200',
                          showLabel ? 'mr-3' : '',
                          isActive ? 'text-blue-500' : 'text-gray-400 group-hover:text-gray-500'
                        )}>
                          {item.icon}
                        </span>
                        
                        {showLabel && (
                          <span className="transition-opacity duration-200">
                            {item.name}
                          </span>
                        )}
                        
                        {isActive && (
                          <div className={combineResponsiveClasses(
                            'w-2 h-2 bg-blue-600 rounded-full transition-all duration-200',
                            showLabel ? 'ml-auto' : 'absolute -right-1 -top-1'
                          )}></div>
                        )}
                      </Link>
                      
                      {/* Tooltip for collapsed state */}
                      {shouldShowTabletNav && tabletSidebarCollapsed && !tabletSidebarHovered && (
                        <div className="absolute left-full ml-2 top-1/2 transform -translate-y-1/2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {item.name}
                        </div>
                      )}
                    </div>
                  );
                })}
              </nav>

              {/* User info section */}
              {(shouldShowDesktopNav || (shouldShowTabletNav && (!tabletSidebarCollapsed || tabletSidebarHovered))) && (
                <div className="mt-auto px-4 py-4 border-t border-gray-200">
                  <div className="flex items-center">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {admin?.nama_lengkap?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                    <div className="ml-3">
                      <div className="text-sm font-medium text-gray-900">
                        {admin?.nama_lengkap || 'Administrator'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {admin?.nama_pengguna || 'admin'}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      <div className={combineResponsiveClasses(
        'flex flex-col flex-1 transition-all duration-300 ease-in-out',
        shouldShowDesktopNav ? 'pl-64' : '',
        shouldShowTabletNav ? (tabletSidebarCollapsed && !tabletSidebarHovered ? 'pl-16' : 'pl-64') : '',
        shouldShowMobileNav ? 'pl-0' : ''
      )}>
        {/* Top header - Mobile hamburger */}
        {shouldShowMobileNav && (
          <div className={`sticky top-0 z-20 bg-gray-50 ${sectionPadding}`}>
            <button
              type="button"
              className="h-12 w-12 inline-flex items-center justify-center rounded-md text-gray-500 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500 min-h-[44px] min-w-[44px]"
              onClick={() => setSidebarOpen(true)}
            >
              <span className="sr-only">Buka menu</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className={`max-w-7xl mx-auto ${containerPadding}`}>
            <div className={`flex justify-between items-center ${sectionPadding}`}>
              <div className="flex-1">
                {/* Breadcrumb for desktop */}
                {shouldShowDesktopNav && (
                  <nav className="flex mb-2" aria-label="Breadcrumb">
                    <ol className="flex items-center space-x-2 text-sm text-gray-500">
                      <li>
                        <Link href="/dashboard" className="hover:text-gray-700 transition-colors duration-200">
                          Beranda
                        </Link>
                      </li>
                      {pathname !== '/dashboard' && (
                        <>
                          <li>
                            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                            </svg>
                          </li>
                          <li className="text-gray-900 font-medium">
                            {navigation.find(item => isCurrentPath(item.href))?.name || 'Halaman'}
                          </li>
                        </>
                      )}
                    </ol>
                  </nav>
                )}
                
                <h1 className={combineResponsiveClasses(titleTypography, 'text-gray-900')}>
                  {navigation.find(item => isCurrentPath(item.href))?.name || 'Dasbor'}
                </h1>
                <p className="text-sm text-gray-500 mt-1">
                  {formatDateTime(new Date())}
                </p>
              </div>

              {/* User menu */}
              <div className="flex items-center space-x-4">
                {/* Search for desktop */}
                {shouldShowDesktopNav && (
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <input
                      type="text"
                      placeholder="Cari pasien..."
                      className="block w-64 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    />
                  </div>
                )}

                {/* Notifications for desktop */}
                {shouldShowDesktopNav && (
                  <button
                    className="p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                    title="Notifikasi"
                  >
                    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-5 5v-5zM10.5 3.75a6 6 0 0 1 6 6v2.25l2.25 2.25v2.25H2.25V12l2.25-2.25V9.75a6 6 0 0 1 6-6z" />
                    </svg>
                  </button>
                )}

                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="h-8 w-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-medium text-sm">
                        {admin?.nama_lengkap?.charAt(0).toUpperCase() || 'A'}
                      </span>
                    </div>
                  </div>
                  {!isMobile && (
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {admin?.nama_lengkap || 'Administrator'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {admin?.nama_pengguna || 'admin'}
                      </div>
                    </div>
                  )}
                </div>

                <button
                  onClick={logout}
                  className={combineResponsiveClasses(
                    'inline-flex items-center border border-transparent font-medium rounded-md text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200',
                    isMobile ? 'px-2 py-2 text-sm min-h-[44px] min-w-[44px]' : 'px-3 py-2 text-sm'
                  )}
                  title="Keluar"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  {!isMobile && <span className="ml-2">Keluar</span>}
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1">
          <div className={`max-w-7xl mx-auto ${containerPadding} ${sectionPadding}`}>
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;