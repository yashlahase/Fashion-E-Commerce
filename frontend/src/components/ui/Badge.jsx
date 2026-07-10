import React from 'react';

const Badge = ({ children, variant = 'primary', className = '' }) => {
  const variantClasses = {
    primary: 'bg-primary-50 text-primary-700 dark:bg-primary-950/30 dark:text-primary-300 border-primary-200 dark:border-primary-800/40',
    secondary: 'bg-gray-100 text-gray-800 dark:bg-slate-800 dark:text-slate-200 border-gray-200 dark:border-slate-700',
    success: 'bg-green-50 text-green-700 dark:bg-green-950/20 dark:text-green-400 border-green-200 dark:border-green-800/40',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 border-amber-200 dark:border-amber-800/40',
    danger: 'bg-red-50 text-red-700 dark:bg-red-950/20 dark:text-red-400 border-red-200 dark:border-red-800/40',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/20 dark:text-blue-400 border-blue-200 dark:border-blue-800/40',
  };

  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold tracking-wide transition-colors duration-150 ${variantClasses[variant]} ${className}`}
    >
      {children}
    </span>
  );
};

export default Badge;
