'use client';

import React from 'react';
import { useBreakpoint } from '../../lib/hooks/useBreakpoint';
import { getResponsiveSpacing, combineResponsiveClasses, responsiveForm } from '../../lib/utils/responsive';
import { cn } from '../../lib/utils';

interface ResponsiveFormProps {
  children: React.ReactNode;
  className?: string;
  onSubmit?: (e: React.FormEvent) => void;
  layout?: 'single' | 'adaptive' | 'multi';
  spacing?: boolean;
}

/**
 * Form responsif yang menyesuaikan layout berdasarkan breakpoint
 * - Mobile: Single column layout
 * - Tablet: Adaptive two-column layout
 * - Desktop: Multi-column layout
 */
export function ResponsiveForm({
  children,
  className,
  onSubmit,
  layout = 'adaptive',
  spacing = true
}: ResponsiveFormProps) {
  const { currentBreakpoint } = useBreakpoint();

  const getFormLayout = () => {
    if (layout === 'single') return 'grid-cols-1';
    
    switch (currentBreakpoint) {
      case 'mobile':
        return 'grid-cols-1';
      case 'tablet':
        return layout === 'multi' ? 'grid-cols-2' : 'grid-cols-1 sm:grid-cols-2';
      case 'desktop':
        return layout === 'multi' ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 sm:grid-cols-2';
      default:
        return 'grid-cols-1';
    }
  };

  const formClasses = combineResponsiveClasses(
    'grid',
    getFormLayout(),
    spacing ? getResponsiveSpacing('gap', currentBreakpoint) : '',
    className
  );

  return (
    <form onSubmit={onSubmit} className={cn(formClasses)}>
      {children}
    </form>
  );
}

interface ResponsiveFormFieldProps {
  children: React.ReactNode;
  className?: string;
  span?: {
    mobile?: number;
    tablet?: number;
    desktop?: number;
  };
  fullWidth?: boolean;
}

/**
 * Field wrapper responsif untuk mengatur span kolom
 */
export function ResponsiveFormField({
  children,
  className,
  span,
  fullWidth = false
}: ResponsiveFormFieldProps) {
  const { currentBreakpoint } = useBreakpoint();

  const getColumnSpan = () => {
    if (fullWidth) {
      switch (currentBreakpoint) {
        case 'mobile':
          return 'col-span-1';
        case 'tablet':
          return 'col-span-2';
        case 'desktop':
          return 'col-span-3';
        default:
          return 'col-span-1';
      }
    }

    if (span) {
      const spanValue = span[currentBreakpoint] || 1;
      return `col-span-${spanValue}`;
    }

    return 'col-span-1';
  };

  const fieldClasses = combineResponsiveClasses(
    getColumnSpan(),
    className
  );

  return (
    <div className={cn(fieldClasses)}>
      {children}
    </div>
  );
}

interface ResponsiveFormGroupProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  spacing?: boolean;
}

/**
 * Group untuk mengelompokkan field-field yang terkait
 */
export function ResponsiveFormGroup({
  children,
  className,
  title,
  description,
  spacing = true
}: ResponsiveFormGroupProps) {
  const { currentBreakpoint } = useBreakpoint();

  const groupClasses = combineResponsiveClasses(
    spacing ? getResponsiveSpacing('section', currentBreakpoint) : '',
    className
  );

  return (
    <div className={cn(groupClasses)}>
      {(title || description) && (
        <div className="mb-4">
          {title && (
            <h3 className="text-lg font-medium text-gray-900 mb-1">
              {title}
            </h3>
          )}
          {description && (
            <p className="text-sm text-gray-600">
              {description}
            </p>
          )}
        </div>
      )}
      {children}
    </div>
  );
}

interface ResponsiveFormActionsProps {
  children: React.ReactNode;
  className?: string;
  alignment?: 'left' | 'center' | 'right' | 'space-between';
  stacked?: boolean;
}

/**
 * Container untuk action buttons di form
 */
export function ResponsiveFormActions({
  children,
  className,
  alignment = 'right',
  stacked = false
}: ResponsiveFormActionsProps) {
  const { currentBreakpoint, isMobile } = useBreakpoint();

  const getFlexDirection = () => {
    if (stacked || isMobile) {
      return 'flex-col';
    }
    return 'flex-row';
  };

  const getJustifyContent = () => {
    if (stacked || isMobile) {
      return 'justify-stretch';
    }
    
    switch (alignment) {
      case 'left':
        return 'justify-start';
      case 'center':
        return 'justify-center';
      case 'right':
        return 'justify-end';
      case 'space-between':
        return 'justify-between';
      default:
        return 'justify-end';
    }
  };

  const actionsClasses = combineResponsiveClasses(
    'flex',
    getFlexDirection(),
    getJustifyContent(),
    getResponsiveSpacing('gap', currentBreakpoint),
    'pt-4 border-t border-gray-200',
    className
  );

  return (
    <div className={cn(actionsClasses)}>
      {children}
    </div>
  );
}

interface ResponsiveFormSectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  collapsible?: boolean;
  defaultExpanded?: boolean;
}

/**
 * Section untuk membagi form menjadi bagian-bagian logis
 */
export function ResponsiveFormSection({
  children,
  className,
  title,
  description,
  collapsible = false,
  defaultExpanded = true
}: ResponsiveFormSectionProps) {
  const [isExpanded, setIsExpanded] = React.useState(defaultExpanded);
  const { currentBreakpoint } = useBreakpoint();

  const sectionClasses = combineResponsiveClasses(
    'border border-gray-200 rounded-lg',
    getResponsiveSpacing('card', currentBreakpoint),
    className
  );

  const headerClasses = combineResponsiveClasses(
    'border-b border-gray-200 pb-3 mb-4',
    collapsible ? 'cursor-pointer select-none' : ''
  );

  const handleToggle = () => {
    if (collapsible) {
      setIsExpanded(!isExpanded);
    }
  };

  return (
    <div className={cn(sectionClasses)}>
      {(title || description) && (
        <div className={cn(headerClasses)} onClick={handleToggle}>
          <div className="flex items-center justify-between">
            <div>
              {title && (
                <h3 className="text-lg font-medium text-gray-900">
                  {title}
                </h3>
              )}
              {description && (
                <p className="text-sm text-gray-600 mt-1">
                  {description}
                </p>
              )}
            </div>
            {collapsible && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label={isExpanded ? 'Tutup section' : 'Buka section'}
              >
                <svg
                  className={cn(
                    'w-5 h-5 transition-transform',
                    isExpanded ? 'rotate-180' : ''
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      )}
      
      {(!collapsible || isExpanded) && (
        <div className="space-y-4">
          {children}
        </div>
      )}
    </div>
  );
}

// Components are exported individually above