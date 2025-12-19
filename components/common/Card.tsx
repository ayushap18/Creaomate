import React from 'react';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '', ...props }) => {
  return (
    <div className={`bg-white dark:bg-slate-800 rounded-2xl shadow-lg shadow-slate-200/60 dark:shadow-black/20 p-6 sm:p-8 ${className}`} {...props}>
      {children}
    </div>
  );
};

export const CardHeader: React.FC<CardProps> = ({ children, className = '' }) => {
    return <div className={`border-b border-slate-200 dark:border-slate-700 pb-4 mb-6 ${className}`}>{children}</div>;
};

export const CardTitle: React.FC<CardProps> = ({ children, className = '' }) => {
    return <h3 className={`text-xl font-bold text-slate-800 dark:text-slate-100 ${className}`}>{children}</h3>;
};

export const CardContent: React.FC<CardProps> = ({ children, className = '' }) => {
    return <div className={`${className}`}>{children}</div>;
};

export default Card;
