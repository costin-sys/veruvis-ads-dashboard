'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface MetricComparison {
  metric: string;
  currentWeek: number;
  previousWeek: number;
  change: number;
  changePercent: number;
}

interface WeeklyReport {
  reportGenerated: boolean;
  summary: string;
  recommendations: string[];
}

// Mock data for visualization
const MOCK_GA4_DATA = [
  { day: 'Luni', currentWeek: 1200, previousWeek: 1100 },
  { day: 'Marți', currentWeek: 1400, previousWeek: 1300 },
  { day: 'Miercuri', currentWeek: 1600, previousWeek: 1450 },
  { day: 'Joi', currentWeek: 1300, previousWeek: 1200 },
  { day: 'Vineri', currentWeek: 1800, previousWeek: 1600 },
  { day: 'Sâmbătă', currentWeek: 2000, previousWeek: 1800 },
  { day: 'Duminică', currentWeek: 1500, previousWeek: 1400 },
];

const MOCK_META_DATA = [
  { day: 'Luni', currentWeek: 450, previousWeek: 420 },
  { day: 'Marți', currentWeek: 520, previousWeek: 480 },
  { day: 'Miercuri', currentWeek: 580, previousWeek: 500 },
  { day: 'Joi', currentWeek: 490, previousWeek: 460 },
  { day: 'Vineri', currentWeek: 650, previousWeek: 600 },
  { day: 'Sâmbătă', currentWeek: 720, previousWeek: 650 },
  { day: 'Duminică', currentWeek: 560, previousWeek: 520 },
];

const MOCK_METRICS: MetricComparison[] = [
  { metric: 'Sesiuni', currentWeek: 10200, previousWeek: 9200, change: 1000, changePercent: 10.8 },
  { metric: 'Utilizatori', currentWeek: 7850, previousWeek: 7200, change: 650, changePercent: 9.0 },
  { metric: 'Pageviews', currentWeek: 18540, previousWeek: 16800, change: 1740, changePercent: 10.3 },
  { metric: 'Bounce Rate', currentWeek: 42, previousWeek: 45, change: -3, changePercent: -6.7 },
  { metric: 'Meta Spend', currentWeek: 4370, previousWeek: 4110, change: 260, changePercent: 6.3 },
  { metric: 'Meta Impressions', currentWeek: 125000, previousWeek: 118000, change: 7000, changePercent: 5.9 },
];

export default function WeeklyComparisonTab() {
  const [report, setReport] = useState<WeeklyReport>({
    reportGenerated: false,
    summary: '',
    recommendations: [],
  });
  const [loadingReport, setLoadingReport] = useState(false);

  const generateWeeklyReport = async () => {
    setLoadingReport(true);
    try {
      const response = await fetch('/api/analyze/campaign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'weekly-report',
          metrics: MOCK_METRICS,
          ga4Data: MOCK_GA4_DATA,
          metaData: MOCK_META_DATA,
          industry: 'sănătate/wellness',
        }),
      });
      const data = await response.json();
      if (data.success) {
        setReport({
          reportGenerated: true,
          summary: data.summary,
          recommendations: data.recommendations,
        });
      }
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoadingReport(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Comparație Săptămânală</h2>
            <p className="text-slate-600 mt-1">
              Săptămâna curentă vs săptămâna anterioară
            </p>
          </div>
          <button
            onClick={generateWeeklyReport}
            disabled={loadingReport}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 text-white font-semibold py-3 px-6 rounded-lg flex items-center gap-2 transition-all"
          >
            <Sparkles className="w-5 h-5" />
            {loadingReport ? 'Se generează raportul...' : 'Generează Raport Săptămânal AI'}
          </button>
        </div>
      </div>

      {/* AI Report */}
      {report.reportGenerated && (
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-lg p-6 space-y-4">
          <div className="flex gap-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <p className="font-bold text-slate-900 mb-2">📊 Sumar Executiv:</p>
              <p className="text-slate-700 leading-relaxed mb-4">{report.summary}</p>

              {report.recommendations.length > 0 && (
                <div>
                  <p className="font-bold text-slate-900 mb-2">🎯 3 Acțiuni Prioritare:</p>
                  <ol className="space-y-2">
                    {report.recommendations.map((rec, idx) => (
                      <li key={idx} className="text-slate-700 flex gap-3">
                        <span className="font-bold text-blue-600">{idx + 1}.</span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_METRICS.map((metric) => {
          const isPositive = metric.changePercent > 0;
          const isNeutral = metric.metric === 'Bounce Rate' ? !isPositive : isPositive;

          return (
            <div key={metric.metric} className="bg-white rounded-lg shadow p-6">
              <p className="text-slate-600 font-semibold text-sm mb-3">{metric.metric}</p>
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">
                    {metric.currentWeek.toLocaleString()}
                  </p>
                  <p className="text-xs text-slate-500 mt-1">
                    Prev: {metric.previousWeek.toLocaleString()}
                  </p>
                </div>
                <div
                  className={`flex items-center gap-1 px-3 py-2 rounded-lg font-semibold text-sm ${
                    isNeutral
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {isNeutral ? (
                    <TrendingUp className="w-4 h-4" />
                  ) : (
                    <TrendingDown className="w-4 h-4" />
                  )}
                  {Math.abs(metric.changePercent).toFixed(1)}%
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* GA4 Trend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">📈 Trend GA4 - Sesiuni</h3>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={MOCK_GA4_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="currentWeek"
              stroke="#3b82f6"
              strokeWidth={2}
              name="Săptămâna curentă"
            />
            <Line
              type="monotone"
              dataKey="previousWeek"
              stroke="#94a3b8"
              strokeWidth={2}
              name="Săptămâna anterioară"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Meta Ads Spend Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-6">💰 Trend Meta Ads - Spend</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={MOCK_META_DATA}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="currentWeek" fill="#8b5cf6" name="Săptămâna curentă" />
            <Bar dataKey="previousWeek" fill="#d1d5db" name="Săptămâna anterioară" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Weekly Goals */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-bold text-slate-900 mb-4">🎯 Obiective săptămânale</h3>
        <div className="space-y-4">
          {[
            { goal: 'Creștere sesiuni > 5%', achieved: true, value: '10.8%' },
            { goal: 'Scădere bounce rate > 3%', achieved: true, value: '6.7%' },
            { goal: 'ROAS > 3', achieved: false, value: '2.1' },
            { goal: 'CPA sub 150 RON', achieved: true, value: '125 RON' },
          ].map((obj, idx) => (
            <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
              <div>
                <p className="font-semibold text-slate-900">{obj.goal}</p>
                <p className={`text-sm ${obj.achieved ? 'text-green-700' : 'text-orange-700'}`}>
                  Actual: {obj.value}
                </p>
              </div>
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                  obj.achieved
                    ? 'bg-green-100 text-green-700'
                    : 'bg-orange-100 text-orange-700'
                }`}
              >
                {obj.achieved ? '✓' : '!'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
