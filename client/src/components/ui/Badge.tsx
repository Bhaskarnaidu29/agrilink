import React from 'react';
import { clsx } from 'clsx';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'earth' | 'neutral';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, variant = 'neutral', className }) => {
  const styles = {
    success: 'bg-agri-100 text-agri-800 border-agri-200',
    warning: 'bg-amber-100 text-amber-800 border-amber-200',
    danger: 'bg-rose-100 text-rose-800 border-rose-200',
    info: 'bg-sky-100 text-sky-800 border-sky-200',
    earth: 'bg-earth-100 text-earth-900 border-earth-200',
    neutral: 'bg-gray-100 text-gray-700 border-gray-200',
  };

  return (
    <span
      className={clsx(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border',
        styles[variant],
        className
      )}
    >
      {children}
    </span>
  );
};
