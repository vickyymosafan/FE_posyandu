// Enhanced Input component with validation states
import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type, 
    error = false,
    success = false,
    helperText,
    label,
    leftIcon,
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
  const inputId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={inputId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border bg-white px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
              // Default border
              "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500",
              // Error state
              error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
              // Success state
              success && "border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500",
              // Icon padding
              leftIcon && "pl-10",
              rightIcon && "pr-10",
              className
            )}
            ref={ref}
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>
        {helperText && (
          <p className={cn(
            "mt-1 text-xs",
            error && "text-red-600",
            success && "text-green-600",
            !error && !success && "text-gray-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

// Textarea component
export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: boolean;
  success?: boolean;
  helperText?: string;
  label?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    error = false,
    success = false,
    helperText,
    label,
    id,
    ...props 
  }, ref) => {
    const generatedId = React.useId();
  const textareaId = id || generatedId;

    return (
      <div className="w-full">
        {label && (
          <label 
            htmlFor={textareaId}
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            {label}
          </label>
        )}
        <textarea
          id={textareaId}
          className={cn(
            "flex min-h-[60px] w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm transition-colors placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 resize-vertical",
            // Default border
            "border-gray-300 focus-visible:ring-blue-500 focus-visible:border-blue-500",
            // Error state
            error && "border-red-500 focus-visible:ring-red-500 focus-visible:border-red-500",
            // Success state
            success && "border-green-500 focus-visible:ring-green-500 focus-visible:border-green-500",
            className
          )}
          ref={ref}
          {...props}
        />
        {helperText && (
          <p className={cn(
            "mt-1 text-xs",
            error && "text-red-600",
            success && "text-green-600",
            !error && !success && "text-gray-500"
          )}>
            {helperText}
          </p>
        )}
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Input, Textarea };