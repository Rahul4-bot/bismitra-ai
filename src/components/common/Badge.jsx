import React from 'react';

export default function Badge({ children, variant = 'default', size = 'md', className = '' }) {
  const baseStyles = 'inline-flex items-center font-medium rounded-full transition-colors';
  
  const sizeStyles = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3 py-1.5 text-sm',
  };

  const variants = {
    default: 'bg-slate-100 text-slate-700 border border-slate-200',
    primary: 'bg-blue-50 text-blue-700 border border-blue-200',
    mandatory: 'bg-red-50 text-red-700 border border-red-200',
    voluntary: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    warning: 'bg-amber-50 text-amber-800 border border-amber-200',
    source: 'bg-indigo-50 text-indigo-700 border border-indigo-200',
    gold: 'bg-yellow-50 text-yellow-800 border border-yellow-300',
    gov: 'bg-slate-900 text-slate-100 border border-slate-700',
  };

  return (
    <span className={`${baseStyles} ${sizeStyles[size] || sizeStyles.md} ${variants[variant] || variants.default} ${className}`}>
      {children}
    </span>
  );
}
