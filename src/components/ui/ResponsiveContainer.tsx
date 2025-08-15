'use client';

import React from 'react';
import { useBreakpoint } from '../../lib/hooks/useBreakpoint';
import { getResponsiveSpacing, combineResponsiveClasses } from '../../lib/utils/responsive';
import { cn } from '../../lib/utils';

interface ResponsiveContainerProps {
    children: React.ReactNode;
    className?: string;
    as?: React.ElementType;
    maxWidth?: boolean;
    padding?: boolean;
}

/**
 * Container responsif yang menyesuaikan padding dan max-width berdasarkan breakpoint
 */
export function ResponsiveContainer({
    children,
    className,
    as: Component = 'div',
    maxWidth = true,
    padding = true
}: ResponsiveContainerProps) {
    const { currentBreakpoint } = useBreakpoint();

    const containerClasses = combineResponsiveClasses(
        'w-full mx-auto',
        maxWidth && currentBreakpoint === 'desktop' ? 'max-w-6xl' : '',
        maxWidth && currentBreakpoint === 'tablet' ? 'max-w-4xl' : '',
        padding ? getResponsiveSpacing('container', currentBreakpoint) : '',
        className
    );

    return (
        <Component className={cn(containerClasses)}>
            {children}
        </Component>
    );
}

interface ResponsiveGridProps {
    children: React.ReactNode;
    className?: string;
    columns?: {
        mobile?: number;
        tablet?: number;
        desktop?: number;
    };
    gap?: boolean;
}

/**
 * Grid responsif yang menyesuaikan jumlah kolom berdasarkan breakpoint
 */
export function ResponsiveGrid({
    children,
    className,
    columns = { mobile: 1, tablet: 2, desktop: 3 },
    gap = true
}: ResponsiveGridProps) {
    const { currentBreakpoint } = useBreakpoint();

    const getGridCols = () => {
        const cols = columns[currentBreakpoint] || 1;
        return `grid-cols-${cols}`;
    };

    const gridClasses = combineResponsiveClasses(
        'grid',
        getGridCols(),
        gap ? getResponsiveSpacing('gap', currentBreakpoint) : '',
        className
    );

    return (
        <div className={cn(gridClasses)}>
            {children}
        </div>
    );
}

interface ResponsiveStackProps {
    children: React.ReactNode;
    className?: string;
    spacing?: boolean;
    direction?: 'vertical' | 'horizontal';
}

/**
 * Stack responsif untuk layout vertikal atau horizontal
 */
export function ResponsiveStack({
    children,
    className,
    spacing = true,
    direction = 'vertical'
}: ResponsiveStackProps) {
    const { currentBreakpoint } = useBreakpoint();

    const stackClasses = combineResponsiveClasses(
        'flex',
        direction === 'vertical' ? 'flex-col' : 'flex-row',
        spacing && direction === 'vertical' ? getResponsiveSpacing('gap', currentBreakpoint) : '',
        spacing && direction === 'horizontal' ? getResponsiveSpacing('gap', currentBreakpoint) : '',
        className
    );

    return (
        <div className={cn(stackClasses)}>
            {children}
        </div>
    );
}

interface ResponsiveCardProps {
    children: React.ReactNode;
    className?: string;
    padding?: boolean;
    shadow?: boolean;
    border?: boolean;
}

/**
 * Card responsif dengan padding dan styling yang menyesuaikan breakpoint
 */
export function ResponsiveCard({
    children,
    className,
    padding = true,
    shadow = true,
    border = true
}: ResponsiveCardProps) {
    const { currentBreakpoint } = useBreakpoint();

    const cardClasses = combineResponsiveClasses(
        'bg-card text-card-foreground',
        padding ? getResponsiveSpacing('card', currentBreakpoint) : '',
        shadow ? 'shadow-sm' : '',
        border ? 'border border-border' : '',
        currentBreakpoint === 'mobile' ? 'rounded-lg' : 'rounded-md',
        className
    );

    return (
        <div className={cn(cardClasses)}>
            {children}
        </div>
    );
}