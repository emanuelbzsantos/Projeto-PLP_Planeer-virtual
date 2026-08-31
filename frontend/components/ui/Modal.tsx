import React from 'react';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

export function Modal({ open, onClose, title, children }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm" 
        onClick={onClose} 
      />
      {/* Content */}
      <div className="relative bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-[var(--color-border)] dark:border-slate-700 p-6 w-full max-w-md mx-auto animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-lg font-semibold text-[var(--color-text)]">{title}</h2>
          <button 
            onClick={onClose}
            className="text-[var(--color-text-secondary)] hover:text-[var(--color-text)] transition-colors p-1"
          >
            ✕
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}