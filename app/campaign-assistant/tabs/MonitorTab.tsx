'use client';

import { useState } from 'react';
import { AlertTriangle, Activity, Sparkles } from 'lucide-react';

interface Campaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'ended';
  spend: number;
  impressions: number;
  clicks: number;
  ctr: number;
  cpc: number;
  dailySpendLimit: number;
}

// Mock data - in reality would come from Meta Ads API
const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: '1',
    name: 'Awareness - Wellness Retreat',
    status: 'active',
    spend: 450,
    impressions: 15000,
    clicks: 120,
    ctr: 0.8,
    cpc: 3.75,
    dailySpendLimit: 50,
  },
  {
    id: '2',
    name: 'Leads - Nutrition Program',
    status: 'active',
    spend: 620,
    impressions: 8000,
    clicks: 240,
    ctr: 3.0,
    cpc: 2.58,
    dailySpendLimit: 100,
  },
  {
    id: '3',
    name: 'Conversions - Product Sales',
    status: 'active',
    spend: 1200,
    impressions: 25000,
    clicks: 450,
    ctr: 1.8,
    cpc: 2.67,
    dailySpendLimit: 150,
  },
  {
    id: '4',
    name: 'Traffic - Blog Posts',
    status: 'paused',
    spend: 300,
    impressions: 5000,
    clicks: 45,
    ctr: 0.9,
    cpc: 6.67,
    dailySpendLimit: 30,
  },
];

const WELLNESS_BENCHMARKS = {
  ctr: { min: 2.0, max: 4.0 }, // 2-4% for health industry
  cpc: { min: 1.5, max: 5.0 }, // 1.5-5 RON for health
};

interface CampaignAnalysis {
  campaignId: string;
  analysis: string;
}

export default function MonitorTab() {
  const [campaigns] = useState<Campaign[]>(MOCK_CAMPAIGNS);
  const [loading, setLoading] = useState(false);
  const [analyses, setAnalyses] = useState<{ [key: string]: CampaignAnalysis }>({});
  const [selectedCampaignId, setSelectedCampaignId] = useState<string | null>(null);

  const getStatusColor = (campaign: Campaign) => {
    if (campaign.status !== 'active') return 'gray';
    if (campaign.ctr < 1) return 'red'; // Critical
    if (campaign.ctr < WELLNESS_BENCHMARKS.ctr.min) return 'yellow';
    return 'green';
  };

  const getStatusLabel = (campaign: Campaign) => {
    if (campaign.status !== 'active') return 'Pauzată';
    if (campaign.ctr < 1) return 'CRITIC - CTR prea mic';
    if (campaign.ctr < WELLNESS_BENCHMARKS.ctr.min)
      return 'ATENȚIE - Sub benchmark';
    return 'Bine';
  };

  const isDailySpendAlertActive = (campaign: Campaign) => {
    // Assuming we're checking current day's spend
    return campaign.spend / campaign.dailySpendLimit > 1;
  };

  const diagnoseAndAnalyze = async (campaignId: string) => {
    setLoading(true);
    const campaign = campaigns.find((c) => c.id === campaignId);
    if (!campaign) return;

    try {
      const response = await fetch('/api/analyze/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'campaign-diagnosis',
          campaign: {
            name: campaign.name,
            ctr: campaign.ctr,
            cpc: campaign.cpc,
            spend: campaign.spend,
            impressions: campaign.impressions,
            clicks: campaign.clicks,
          },
          benchmarks: WELLNESS_BENCHMARKS,
          industry: 'sănătate/wellness',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setAnalyses({
          ...analyses,
          [campaignId]: {
            campaignId,
            analysis: data.diagnosis,
          },
        });
        setSelectedCampaignId(campaignId);
      }
    } catch (error) {
      console.error('Error diagnosing campaign:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Alerts */}
      <div className="space-y-4">
        {campaigns.map((campaign) => {
          if (campaign.status !== 'active') return null;
          if (campaign.ctr < 1 || isDailySpendAlertActive(campaign)) {
            return (
              <div
                key={campaign.id}
                className="p-4 rounded-lg border-l-4 border-red-500 bg-red-50 flex items-start gap-3"
              >
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-red-900">{campaign.name}</p>
                  {campaign.ctr < 1 && (
                    <p className="text-red-700 text-sm">
                      ⚠️ CTR prea mic: {campaign.ctr.toFixed(2)}% (benchmark: {WELLNESS_BENCHMARKS.ctr.min}-{WELLNESS_BENCHMARKS.ctr.max}%)
                    </p>
                  )}
                  {isDailySpendAlertActive(campaign) && (
                    <p className="text-red-700 text-sm">
                      💰 Spend zilnic depășit: {campaign.spend.toFixed(2)} RON
                    </p>
                  )}
                </div>
              </div>
            );
          }
          return null;
        })}
      </div>

      {/* Campaigns Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {campaigns.map((campaign) => {
          const statusColor = getStatusColor(campaign);
          const statusLabel = getStatusLabel(campaign);
          const statusBgColor =
            statusColor === 'red'
              ? 'bg-red-100 text-red-800'
              : statusColor === 'yellow'
              ? 'bg-yellow-100 text-yellow-800'
              : statusColor === 'green'
              ? 'bg-green-100 text-green-800'
              : 'bg-gray-100 text-gray-800';

          return (
            <div key={campaign.id} className="bg-white rounded-lg shadow p-6 space-y-4">
              {/* Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-lg">{campaign.name}</h3>
                  <div className="flex gap-2 mt-2">
                    <span
                      className={`px-3 py-1 rounded-full text-sm font-semibold ${statusBgColor}`}
                    >
                      {statusLabel}
                    </span>
                    {campaign.status === 'active' && (
                      <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-100 text-blue-800 flex items-center gap-1">
                        <Activity className="w-4 h-4" /> Live
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Metrics */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold">SPEND</p>
                  <p className="text-xl font-bold text-slate-900">
                    {campaign.spend.toFixed(2)} RON
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold">IMPRESSIONS</p>
                  <p className="text-xl font-bold text-slate-900">
                    {campaign.impressions.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold">CLICKS</p>
                  <p className="text-xl font-bold text-slate-900">
                    {campaign.clicks.toLocaleString()}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <p className="text-xs text-slate-600 font-semibold">CPC</p>
                  <p className="text-xl font-bold text-slate-900">
                    {campaign.cpc.toFixed(2)} RON
                  </p>
                </div>
              </div>

              {/* CTR Comparison */}
              <div className="p-4 bg-slate-50 rounded-lg space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-slate-900">CTR Actual vs Benchmark</span>
                  <span className="text-lg font-bold text-slate-900">
                    {campaign.ctr.toFixed(2)}% / {WELLNESS_BENCHMARKS.ctr.min}-{WELLNESS_BENCHMARKS.ctr.max}%
                  </span>
                </div>
                <div className="w-full h-3 bg-slate-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all ${
                      campaign.ctr >= WELLNESS_BENCHMARKS.ctr.min
                        ? 'bg-green-500'
                        : campaign.ctr >= 1
                        ? 'bg-yellow-500'
                        : 'bg-red-500'
                    }`}
                    style={{
                      width: `${Math.min(
                        100,
                        (campaign.ctr / (WELLNESS_BENCHMARKS.ctr.max * 1.5)) * 100
                      )}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Diagnostics Button */}
              {campaign.status === 'active' && (
                <button
                  onClick={() => diagnoseAndAnalyze(campaign.id)}
                  disabled={loading && selectedCampaignId !== campaign.id}
                  className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:opacity-50 text-white font-semibold py-2 px-4 rounded-lg flex items-center justify-center gap-2 transition-all"
                >
                  <Sparkles className="w-4 h-4" />
                  {loading && selectedCampaignId === campaign.id
                    ? 'Se diagnostichează...'
                    : 'Diagnostichează'}
                </button>
              )}

              {/* Analysis Display */}
              {analyses[campaign.id] && (
                <div className="p-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg space-y-2">
                  <p className="font-bold text-slate-900 flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    Diagnosticul AI:
                  </p>
                  <p className="text-slate-700 text-sm leading-relaxed">
                    {analyses[campaign.id].analysis}
                  </p>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
