import React from 'react';
import { clsx } from 'clsx';

export const Card: React.FC<{ children: React.ReactNode; className?: string; onClick?: () => void }> = ({
  children,
  className,
  onClick,
}) => (
  <div
    onClick={onClick}
    className={clsx(
      'bg-white rounded-xl border border-gray-200/80 shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden',
      onClick && 'cursor-pointer hover:border-agri-400',
      className
    )}
  >
    {children}
  </div>
);

export const CardHeader: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('px-6 py-4 border-b border-gray-100 flex items-center justify-between', className)}>
    {children}
  </div>
);

export const CardTitle: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <h3 className={clsx('text-lg font-semibold text-gray-900', className)}>{children}</h3>
);

export const CardContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={clsx('p-6', className)}>{children}</div>
);
