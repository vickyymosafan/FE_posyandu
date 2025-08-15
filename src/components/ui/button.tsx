// Enhanced Button component with variants and responsive support
import * as React from "react";
import { cn } from "@/lib/utils";
import { Loading } from "./loading";
import { useBreakpoint } from "@/lib/hooks/useBreakpoint";
import { responsiveButton } from "@/lib/utils/responsive";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "success" | "warning";
  size?: "default" | "sm" | "lg" | "icon" | "xs";
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  responsive?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    variant = "default", 
    size = "default", 
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    responsive = true,
    ...props 
  }, ref) => {
    const isDisabled = disabled || loading;
    const { currentBreakpoint } = useBreakpoint();

    return (
      <button
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          // Variant styles
          {
            "bg-blue-600 text-white shadow hover:bg-blue-700 focus-visible:ring-blue-500":
              variant === "default",
            "bg-red-600 text-white shadow-sm hover:bg-red-700 focus-visible:ring-red-500":
              variant === "destructive",
            "border border-gray-300 bg-white shadow-sm hover:bg-gray-50 focus-visible:ring-blue-500":
              variant === "outline",
            "bg-gray-100 text-gray-900 shadow-sm hover:bg-gray-200 focus-visible:ring-gray-500":
              variant === "secondary",
            "hover:bg-gray-100 focus-visible:ring-gray-500": 
              variant === "ghost",
            "text-blue-600 underline-offset-4 hover:underline focus-visible:ring-blue-500": 
              variant === "link",
            "bg-green-600 text-white shadow hover:bg-green-700 focus-visible:ring-green-500":
              variant === "success",
            "bg-yellow-600 text-white shadow hover:bg-yellow-700 focus-visible:ring-yellow-500":
              variant === "warning",
          },
          // Size styles - responsive or fixed
          responsive && size === "default" && responsiveButton[currentBreakpoint].height,
          responsive && size === "default" && responsiveButton[currentBreakpoint].padding,
          responsive && size === "default" && responsiveButton[currentBreakpoint].fontSize,
          responsive && size === "default" && responsiveButton[currentBreakpoint].minTouchTarget,
          // Non-responsive size styles
          !responsive && {
            "h-9 px-4 py-2 gap-2": size === "default",
            "h-7 rounded-md px-2 text-xs gap-1": size === "xs",
            "h-8 rounded-md px-3 text-xs gap-1": size === "sm",
            "h-11 rounded-md px-8 gap-2": size === "lg",
            "h-9 w-9": size === "icon",
          },
          // Fixed sizes for non-default sizes even when responsive
          responsive && {
            "h-7 rounded-md px-2 text-xs gap-1": size === "xs",
            "h-8 rounded-md px-3 text-xs gap-1": size === "sm",
            "h-11 rounded-md px-8 gap-2": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        ref={ref}
        disabled={isDisabled}
        {...props}
      >
        {loading && <Loading size="sm" className="text-current" />}
        {!loading && leftIcon && leftIcon}
        {children}
        {!loading && rightIcon && rightIcon}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };