// Enhanced Loading component with skeleton states
import { cn } from "@/lib/utils";

interface LoadingProps {
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  color?: "blue" | "gray" | "white";
}

export function Loading({ size = "md", className, color = "blue" }: LoadingProps) {
  const sizeClasses = {
    xs: "h-3 w-3",
    sm: "h-4 w-4",
    md: "h-6 w-6",
    lg: "h-8 w-8",
    xl: "h-12 w-12",
  };

  const colorClasses = {
    blue: "border-gray-300 border-t-blue-600",
    gray: "border-gray-200 border-t-gray-600",
    white: "border-white/30 border-t-white",
  };

  return (
    <div
      className={cn(
        "animate-spin rounded-full border-2",
        sizeClasses[size],
        colorClasses[color],
        className
      )}
    />
  );
}

interface LoadingSpinnerProps {
  text?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
}

export function LoadingSpinner({ text = "Memuat...", className, size = "md" }: LoadingSpinnerProps) {
  return (
    <div className={cn("flex items-center justify-center space-x-2", className)}>
      <Loading size={size} />
      <span className="text-sm text-gray-600">{text}</span>
    </div>
  );
}

export function LoadingPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingSpinner text="Memuat halaman..." size="lg" />
    </div>
  );
}

// Skeleton components
interface SkeletonProps {
  className?: string;
}

export function Skeleton({ className }: SkeletonProps) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-gray-200",
        className
      )}
    />
  );
}

export function SkeletonText({ lines = 3, className }: { lines?: number; className?: string }) {
  return (
    <div className={cn("space-y-2", className)}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={i}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-3/4" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonCard({ className }: SkeletonProps) {
  return (
    <div className={cn("p-4 border rounded-lg space-y-3", className)}>
      <Skeleton className="h-4 w-1/2" />
      <SkeletonText lines={2} />
      <div className="flex space-x-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-8 w-16" />
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 4, className }: { 
  rows?: number; 
  columns?: number; 
  className?: string; 
}) {
  return (
    <div className={cn("space-y-3", className)}>
      {/* Header */}
      <div className="flex space-x-4 p-4 border-b">
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton key={i} className="h-4 flex-1" />
        ))}
      </div>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex space-x-4 p-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton key={colIndex} className="h-4 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}

export function SkeletonList({ items = 5, className }: { items?: number; className?: string }) {
  return (
    <div className={cn("space-y-3", className)}>
      {Array.from({ length: items }).map((_, i) => (
        <div key={i} className="flex items-center space-x-3 p-3 border rounded-lg">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-1/3" />
            <Skeleton className="h-3 w-2/3" />
          </div>
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
  );
}

export function SkeletonForm({ fields = 4, className }: { fields?: number; className?: string }) {
  return (
    <div className={cn("space-y-4", className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-9 w-full" />
        </div>
      ))}
      <div className="flex space-x-2 pt-4">
        <Skeleton className="h-9 w-20" />
        <Skeleton className="h-9 w-20" />
      </div>
    </div>
  );
}

// Loading states for specific components
export function LoadingButton({ children, loading, ...props }: any) {
  return (
    <button {...props} disabled={loading || props.disabled}>
      {loading ? (
        <div className="flex items-center space-x-2">
          <Loading size="sm" />
          <span>Memuat...</span>
        </div>
      ) : (
        children
      )}
    </button>
  );
}