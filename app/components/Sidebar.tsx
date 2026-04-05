'use client';

import { BarChart3, TrendingUp, Zap, Brain, Sparkles } from 'lucide-react';
import Link from 'next/link';

interface TokenStatus {
  valid: boolean;
  daysUntilExpiry: number | null;
  needsRefresh: boolean;
  isExpired: boolean;
}

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  metaTokenStatus?: TokenStatus | null;
}

export function Sidebar({ activeTab, onTabChange, metaTokenStatus }: SidebarProps) {
  const navItems = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'ga4', label: 'GA4 Analytics', icon: TrendingUp },
    { id: 'meta', label: 'Meta Ads', icon: Zap },
    { id: 'ai-analysis', label: 'Analizează cu AI', icon: Sparkles },
  ];

  const assistantItems = [
    { id: 'campaign-assistant', label: 'Asistent Campanii', icon: Brain, href: '/campaign-assistant' },
  ];

  return (
    <aside className="fixed left-0 top-0 h-screen w-60 bg-gradient-to-b from-slate-900 to-slate-800 text-white p-6 shadow-2xl z-50">
      {/* Logo */}
      <div className="mb-12 flex items-center gap-3">
        <div className="h-10 w-10 rounded-lg bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center font-bold text-lg">
          V
        </div>
        <div>
          <h1 className="text-xl font-bold">VERUVIS</h1>
          <p className="text-xs text-slate-400">Analytics</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive && item.id === 'ai-analysis'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : isActive
                  ? 'bg-blue-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium flex-1 text-left">{item.label}</span>
              {item.id === 'meta' && metaTokenStatus && (
                <span
                  title={
                    metaTokenStatus.isExpired
                      ? 'Token expirat!'
                      : metaTokenStatus.needsRefresh
                      ? `Token expiră în ${metaTokenStatus.daysUntilExpiry} zile`
                      : `Token valid — ${metaTokenStatus.daysUntilExpiry ?? '?'} zile`
                  }
                  className={`h-2 w-2 rounded-full flex-shrink-0 ${
                    metaTokenStatus.isExpired || !metaTokenStatus.valid
                      ? 'bg-red-400'
                      : metaTokenStatus.needsRefresh
                      ? 'bg-yellow-400 animate-pulse'
                      : 'bg-green-400'
                  }`}
                />
              )}
            </button>
          );
        })}

        {/* Divider */}
        <div className="h-px bg-slate-700 my-4"></div>

        {/* Assistant Section */}
        <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold px-4 py-2">
          Asistent
        </div>
        {assistantItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive
                  ? 'bg-purple-600 text-white shadow-lg'
                  : 'text-slate-300 hover:bg-slate-700/50 hover:text-white'
              }`}
              onClick={() => onTabChange(item.id)}
            >
              <IconComponent className="h-5 w-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="absolute bottom-6 left-6 right-6">
        <div className="rounded-lg bg-blue-600/20 border border-blue-500/30 p-4">
          <p className="text-xs text-slate-300 mb-2">Last Updated</p>
          <p className="text-sm font-semibold text-white">Today</p>
        </div>
      </div>
    </aside>
  );
}
