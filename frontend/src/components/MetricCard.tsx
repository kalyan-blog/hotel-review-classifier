import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  variant?: 'blue' | 'green' | 'red' | 'slate';
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = 'blue',
}) => {
  const styles = {
    blue: {
      border: 'border-blue-100 hover:border-blue-200',
      iconBg: 'bg-blue-50 text-blue-600',
      accent: 'text-blue-600',
    },
    green: {
      border: 'border-emerald-100 hover:border-emerald-200',
      iconBg: 'bg-emerald-50 text-emerald-600',
      accent: 'text-emerald-600',
    },
    red: {
      border: 'border-rose-100 hover:border-rose-200',
      iconBg: 'bg-rose-50 text-rose-600',
      accent: 'text-rose-600',
    },
    slate: {
      border: 'border-slate-200 hover:border-slate-300',
      iconBg: 'bg-slate-100 text-slate-700',
      accent: 'text-slate-800',
    },
  };

  const current = styles[variant];

  return (
    <div className={`bg-white rounded-xl border p-5 shadow-card transition-all duration-200 hover:shadow-card-hover ${current.border}`}>
      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
            {title}
          </span>
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 font-mono">
            {value}
          </div>
        </div>

        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${current.iconBg}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          {subtitle}
        </div>
      )}
    </div>
  );
};
