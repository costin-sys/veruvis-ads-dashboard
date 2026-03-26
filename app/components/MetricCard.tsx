'use client';

import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  change?: string;
  color: 'blue' | 'green' | 'purple' | 'orange' | 'red' | 'pink' | 'cyan' | 'indigo' | 'lime' | 'rose';
}

const colorClasses = {
  blue: 'text-blue-600 bg-blue-100',
  green: 'text-green-600 bg-green-100',
  purple: 'text-purple-600 bg-purple-100',
  orange: 'text-orange-600 bg-orange-100',
  red: 'text-red-600 bg-red-100',
  pink: 'text-pink-600 bg-pink-100',
  cyan: 'text-cyan-600 bg-cyan-100',
  indigo: 'text-indigo-600 bg-indigo-100',
  lime: 'text-lime-600 bg-lime-100',
  rose: 'text-rose-600 bg-rose-100',
};

export function MetricCard({
  icon: Icon,
  label,
  value,
  change,
  color,
}: MetricCardProps) {
  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-slate-600 text-sm font-medium mb-1">{label}</p>
          <p className="text-3xl font-bold text-slate-900">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </p>
          {change && (
            <p className="text-xs text-green-600 mt-2">{change}</p>
          )}
        </div>
        <div className={`${colorClasses[color]} p-3 rounded-lg`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
    </div>
  );
}
