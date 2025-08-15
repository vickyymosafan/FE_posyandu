'use client';

import React from 'react';
import { useBreakpoint } from '../../lib/hooks/useBreakpoint';
import { getResponsiveTypography, combineResponsiveClasses } from '../../lib/utils/responsive';
import { cn } from '../../lib/utils';

interface ResponsiveTextProps {
  children: React.ReactNode;
  as?: React.ElementType;
  variant?: 'h1' | 'h2' | 'h3' | 'body' | 'caption';
  className?: string;
  weight?: 'normal' | 'medium' | 'semibold' | 'bold';
  color?: 'default' | 'muted' | 'primary' | 'destructive';
}

/**
 * Komponen teks responsif yang menyesuaikan ukuran font berdasarkan breakpoint
 */
export function ResponsiveText({
  children,
  as: Component = 'p',
  variant = 'body',
  className,
  weight = 'normal',
  color = 'default'
}: ResponsiveTextProps) {
  const { currentBreakpoint } = useBreakpoint();

  const getWeightClass = () => {
    switch (weight) {
      case 'medium': return 'font-medium';
      case 'semibold': return 'font-semibold';
      case 'bold': return 'font-bold';
      default: return 'font-normal';
    }
  };

  const getColorClass = () => {
    switch (color) {
      case 'muted': return 'text-muted-foreground';
      case 'primary': return 'text-primary';
      case 'destructive': return 'text-destructive';
      default: return 'text-foreground';
    }
  };

  const textClasses = combineResponsiveClasses(
    getResponsiveTypography(variant, currentBreakpoint),
    getWeightClass(),
    getColorClass(),
    className
  );

  return (
    <Component className={cn(textClasses)}>
      {children}
    </Component>
  );
}

interface ResponsiveHeadingProps {
  children: React.ReactNode;
  level: 1 | 2 | 3 | 4 | 5 | 6;
  className?: string;
  color?: 'default' | 'muted' | 'primary';
}

/**
 * Komponen heading responsif
 */
export function ResponsiveHeading({
  children,
  level,
  className,
  color = 'default'
}: ResponsiveHeadingProps) {
  const Component = `h${level}` as React.ElementType;

  const getVariant = (): 'h1' | 'h2' | 'h3' => {
    if (level <= 1) return 'h1';
    if (level <= 2) return 'h2';
    return 'h3';
  };

  return (
    <ResponsiveText
      as={Component}
      variant={getVariant()}
      weight="bold"
      color={color}
      className={className}
    >
      {children}
    </ResponsiveText>
  );
}

interface ResponsiveLabelProps {
  children: React.ReactNode;
  htmlFor?: string;
  className?: string;
  required?: boolean;
}

/**
 * Label responsif untuk form
 */
export function ResponsiveLabel({
  children,
  htmlFor,
  className,
  required = false
}: ResponsiveLabelProps) {
  return (
    <ResponsiveText
      as="label"
      variant="body"
      weight="medium"
      className={cn('block', className)}
      {...(htmlFor && { htmlFor })}
    >
      {children}
      {required && <span className="text-destructive ml-1">*</span>}
    </ResponsiveText>
  );
}

interface ResponsiveCaptionProps {
  children: React.ReactNode;
  className?: string;
  color?: 'default' | 'muted' | 'destructive';
}

/**
 * Caption responsif untuk teks kecil
 */
export function ResponsiveCaption({
  children,
  className,
  color = 'muted'
}: ResponsiveCaptionProps) {
  return (
    <ResponsiveText
      as="span"
      variant="caption"
      color={color}
      className={className}
    >
      {children}
    </ResponsiveText>
  );
}