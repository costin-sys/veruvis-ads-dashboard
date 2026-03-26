'use client';

import { Calendar } from 'lucide-react';

interface HeaderProps {
  title: string;
  days: number;
  onDaysChange: (days: number) => void;
}

export function Header({ title, days, onDaysChange }: HeaderProps) {
  const dateRanges = [
    { label: '7 Days', value: 7 },
    { label: '30 Days', value: 30 },
    { label: '90 Days', value: 90 },
  ];

  return (
    <div className="bg-white border-b border-slate-200 px-8 py-6">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{title}</h1>
          <p className="text-slate-500 mt-1">Last 30 days performance metrics</p>
        </div>

        {/* Date Filter Buttons */}
        <div className="flex items-center gap-2 bg-slate-100 rounded-lg p-1">
          {dateRanges.map((range) => (
            <button
              key={range.value}
              onClick={() => onDaysChange(range.value)}
              className={`px-4 py-2 rounded-md transitions transition-all duration-200 font-medium text-sm ${
                days === range.value
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-slate-600 hover:bg-slate-200'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
