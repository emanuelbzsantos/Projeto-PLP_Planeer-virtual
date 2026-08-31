"use client";

import React from 'react';
import { AlertCircle } from 'lucide-react';

interface BaseFieldProps {
  label: string;
  error?: string;
  required?: boolean;
  maxLength?: number;
  currentLength?: number;
  className?: string;
}

interface FormInputProps extends React.InputHTMLAttributes<HTMLInputElement>, BaseFieldProps {}

export function FormInput({
  label,
  error,
  required,
  maxLength,
  currentLength,
  id,
  className = '',
  ...props
}: FormInputProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {maxLength !== undefined && currentLength !== undefined && (
          <span className={`text-[11px] ${
            currentLength >= maxLength ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <input
        id={id}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-all text-sm ${
          error 
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/50 focus:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20' 
            : 'border-[var(--color-border)] dark:border-slate-700 focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] bg-white dark:bg-slate-800 text-[var(--color-text)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium animate-in fade-in duration-150">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormTextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement>, BaseFieldProps {}

export function FormTextarea({
  label,
  error,
  required,
  maxLength,
  currentLength,
  id,
  className = '',
  ...props
}: FormTextareaProps) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)]">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
        {maxLength !== undefined && currentLength !== undefined && (
          <span className={`text-[11px] ${
            currentLength >= maxLength ? 'text-rose-500 font-semibold' : 'text-slate-400 dark:text-slate-500'
          }`}>
            {currentLength}/{maxLength}
          </span>
        )}
      </div>
      <textarea
        id={id}
        maxLength={maxLength}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-all text-sm resize-none ${
          error 
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/50 focus:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20' 
            : 'border-[var(--color-border)] dark:border-slate-700 focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)] bg-white dark:bg-slate-800 text-[var(--color-text)]'
        } ${className}`}
        {...props}
      />
      {error && (
        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium animate-in fade-in duration-150">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}

interface FormSelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  required?: boolean;
}

export function FormSelect({
  label,
  error,
  required,
  id,
  children,
  className = '',
  ...props
}: FormSelectProps) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--color-text)] mb-1">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      <select
        id={id}
        className={`w-full px-3 py-2 border rounded-lg focus:outline-none transition-all text-sm bg-white dark:bg-slate-800 text-[var(--color-text)] ${
          error 
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-200 dark:focus:ring-rose-900/50 focus:border-rose-500 bg-rose-50/20 dark:bg-rose-950/20' 
            : 'border-[var(--color-border)] dark:border-slate-700 focus:ring-2 focus:ring-[var(--color-primary-light)] focus:border-[var(--color-primary)]'
        } ${className}`}
        {...props}
      >
        {children}
      </select>
      {error && (
        <p className="text-xs text-rose-500 mt-1.5 flex items-center gap-1 font-medium animate-in fade-in duration-150">
          <AlertCircle size={13} className="shrink-0" />
          {error}
        </p>
      )}
    </div>
  );
}