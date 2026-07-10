import React from 'react';
import { Link } from 'react-router-dom';

const EmptyState = ({
  icon: Icon,
  title,
  description,
  actionText,
  actionLink = '/products',
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && (
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400 dark:bg-slate-800 dark:text-slate-500">
          <Icon size={32} />
        </div>
      )}
      <h3 className="mt-4 text-lg font-bold text-gray-800 dark:text-slate-100">
        {title}
      </h3>
      <p className="mx-auto mt-2 max-w-sm text-sm text-gray-500 dark:text-slate-400">
        {description}
      </p>
      {actionText && (
        <Link
          to={actionLink}
          className="mt-6 inline-flex rounded-xl bg-slate-900 px-6 py-3 text-sm font-semibold text-white shadow-md hover:bg-slate-800 dark:bg-slate-100 dark:text-slate-900 dark:hover:bg-slate-200"
        >
          {actionText}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
