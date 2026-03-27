'use client';

import { useState } from 'react';
import { Sidebar } from '@/app/components/Sidebar';
import { Header } from '@/app/components/Header';
import { Brain, Settings, Zap, TrendingUp, BarChart3 } from 'lucide-react';
import MetaGuidanceTab from './tabs/MetaGuidanceTab';
import GoogleGuidanceTab from './tabs/GoogleGuidanceTab';
import ChecklistTab from './tabs/ChecklistTab';
import MonitorTab from './tabs/MonitorTab';
import WeeklyComparisonTab from './tabs/WeeklyComparisonTab';

export default function CampaignAssistant() {
  const [activeTab, setActiveTab] = useState('meta-guidance');
  const [sidebarTab, setSidebarTab] = useState('campaign-assistant');

  const tabs = [
    { id: 'meta-guidance', label: 'Ghid Meta Ads', icon: Zap },
    { id: 'google-guidance', label: 'Ghid Google Ads', icon: TrendingUp },
    { id: 'checklist', label: 'Checklist Campanie', icon: BarChart3 },
    { id: 'monitor', label: 'Monitor Campanii', icon: Brain },
    { id: 'weekly', label: 'Comparație Săptămânală', icon: Settings },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'meta-guidance':
        return <MetaGuidanceTab />;
      case 'google-guidance':
        return <GoogleGuidanceTab />;
      case 'checklist':
        return <ChecklistTab />;
      case 'monitor':
        return <MonitorTab />;
      case 'weekly':
        return <WeeklyComparisonTab />;
      default:
        return <MetaGuidanceTab />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar activeTab={sidebarTab} onTabChange={setSidebarTab} />
      <main className="flex-1 ml-60 flex flex-col">
        <Header title="Asistent Campanii" days={30} onDaysChange={() => {}} />
        <div className="flex-1 overflow-auto">
          {/* Tab Navigation */}
          <div className="sticky top-0 bg-white border-b border-slate-200 z-40">
            <div className="max-w-7xl mx-auto px-8 py-4">
              <div className="flex gap-2 overflow-x-auto">
                {tabs.map((tab) => {
                  const IconComponent = tab.icon;
                  const isActive = activeTab === tab.id;

                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all duration-200 ${
                        isActive
                          ? 'bg-blue-600 text-white shadow-md'
                          : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      }`}
                    >
                      <IconComponent className="h-4 w-4" />
                      {tab.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Tab Content */}
          <div className="p-8 max-w-7xl mx-auto">
            {renderTabContent()}
          </div>
        </div>
      </main>
    </div>
  );
}
