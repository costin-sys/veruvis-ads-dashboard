'use client';

import { useEffect, useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { MetricCard } from './components/MetricCard';
import {
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  Users,
  TrendingUp,
  Eye,
  MousePointerClick,
  Zap,
  Globe,
  BarChart3,
  ShoppingCart,
  DollarSign,
  Activity,
  Sparkles,
  FileText,
} from 'lucide-react';

interface GA4Data {
  sessions: number;
  users: number;
  pageviews: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{ page: string; views: string }>;
  dailyData: Array<{ date: string; sessions: number }>;
  trafficData: Array<{ source: string; sessions: number }>;
  deviceData: Array<{ name: string; value: number }>;
  countriesData: Array<{ country: string; sessions: number }>;
  landingPages: Array<{ page: string; sessions: string }>;
  exitPages: Array<{ page: string; sessions: string }>;
  events: Array<{ event: string; count: number }>;
}

interface MetaData {
  totalSpend: number;
  totalImpressions: number;
  totalClicks: number;
  averageCtr: number;
  activeCampaigns: number;
  topCampaigns: Array<{
    name: string;
    spend: number;
    impressions: number;
    clicks: number;
    ctr: string;
  }>;
  dateRange: {
    from: string;
    to: string;
  };
}

interface FinancialData {
  totalRevenue: number;
  unpaidAmount: number;
  invoiceCount: number;
  invoicesPaid: number;
  invoicesUnpaid: number;
  averageInvoiceValue: number;
  dateRange: {
    from: string;
    to: string;
  };
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Home() {
  const [activeTab, setActiveTab] = useState('overview');
  const [days, setDays] = useState(30);
  const [data, setData] = useState<GA4Data | null>(null);
  const [metaData, setMetaData] = useState<MetaData | null>(null);
  const [financialData, setFinancialData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [metaError, setMetaError] = useState<string | null>(null);
  const [financialError, setFinancialError] = useState<string | null>(null);
  const [analysisLoading, setAnalysisLoading] = useState(false);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [agencyGuide, setAgencyGuide] = useState<string | null>(null);

  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        // Fetch GA4 data
        const ga4Response = await fetch(`/api/ga4?days=${days}`);
        const ga4Json = await ga4Response.json();
        if (ga4Json.success) {
          setData(ga4Json.data);
        } else {
          setError(ga4Json.error || 'Failed to load GA4 data');
        }

        // Fetch Meta data
        const metaResponse = await fetch(`/api/meta?days=${days}`);
        const metaJson = await metaResponse.json();
        if (metaJson.success) {
          setMetaData(metaJson.data);
        } else {
          setMetaError(metaJson.error || 'Failed to load Meta Ads data');
        }

        // Fetch Financial data
        const financialResponse = await fetch(`/api/smartbill?days=${days}`);
        const financialJson = await financialResponse.json();
        if (financialJson.success) {
          setFinancialData(financialJson.data);
        } else {
          setFinancialError(financialJson.error || 'Failed to load financial data');
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchAllData();
  }, [days]);

  const handleAnalyze = async () => {
    console.log('Handle analyze called');
    console.log('Data available:', { data, metaData });

    if (!data || !metaData) {
      console.error('Missing data or metaData:', { data, metaData });
      setError('Data not loaded yet. Please wait for GA4 and Meta Ads data to load.');
      return;
    }

    setAnalysisLoading(true);
    setError(null);

    try {
      const payload = {
        ga4Data: {
          sessions: data.sessions,
          users: data.users,
          pageviews: data.pageviews,
          bounceRate: data.bounceRate,
          avgSessionDuration: data.avgSessionDuration,
          topPages: data.topPages,
        },
        metaData: {
          totalSpend: metaData.totalSpend,
          totalImpressions: metaData.totalImpressions,
          totalClicks: metaData.totalClicks,
          averageCtr: metaData.averageCtr,
          activeCampaigns: metaData.activeCampaigns,
          topCampaigns: metaData.topCampaigns,
        },
      };

      console.log('Sending payload to /api/analyze:', payload);

      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response result:', result);

      if (response.ok && result.success) {
        console.log('Analysis successful');
        setAnalysis(result.analysis);
        setAgencyGuide(result.agencyGuide);
      } else {
        const errorMsg = result.error || `API returned status ${response.status}`;
        console.error('Analysis failed:', errorMsg);
        setError(errorMsg);
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to generate analysis';
      console.error('Catch error:', err);
      setError(errorMsg);
    } finally {
      setAnalysisLoading(false);
    }
  };

  const getTabTitle = () => {
    switch (activeTab) {
      case 'ga4':
        return 'GA4 Analytics';
      case 'meta':
        return 'Meta Ads Performance';
      case 'financial':
        return 'Date Financiare';
      default:
        return 'Dashboard Overview';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content */}
      <div className="ml-60 flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <Header title={getTabTitle()} days={days} onDaysChange={setDays} />

        {/* Content */}
        <main className="flex-1 overflow-auto bg-slate-50 p-8">
          <div className="max-w-7xl mx-auto">
            {loading ? (
              <div className="flex items-center justify-center h-96">
                <div className="text-center">
                  <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                  <p className="text-slate-600">Loading analytics data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Analysis Button and Report */}
                {data && metaData && (
                  <>
                    {/* Error Alert */}
                    {error && (
                      <div className="mb-8 bg-red-50 border border-red-300 rounded-lg p-4 text-red-800">
                        <div className="flex items-start gap-3">
                          <div className="text-red-500 font-bold">⚠️</div>
                          <div>
                            <h4 className="font-semibold">Error</h4>
                            <p className="text-sm">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mb-8 flex justify-end">
                      <button
                        onClick={handleAnalyze}
                        disabled={analysisLoading}
                        className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
                      >
                        {analysisLoading ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            Claude analizează datele...
                          </>
                        ) : (
                          <>
                            <Sparkles className="h-5 w-5" />
                            Analizează datele cu AI
                          </>
                        )}
                      </button>
                    </div>

                    {/* Analysis Report */}
                    {analysis && (
                      <div className="mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200 shadow-lg">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">📊 Analiza datelor</h3>
                        <div className="prose prose-sm max-w-none text-slate-800 whitespace-pre-wrap font-sans leading-relaxed">
                          {analysis}
                        </div>
                      </div>
                    )}

                    {/* Agency Guide Report */}
                    {agencyGuide && (
                      <div className="mb-8 bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-8 border border-amber-300 shadow-lg">
                        <h3 className="text-lg font-bold text-amber-900 mb-4">📋 Ce să ceri agenției</h3>
                        <div className="prose prose-sm max-w-none text-amber-900 whitespace-pre-wrap font-sans leading-relaxed">
                          {agencyGuide}
                        </div>
                      </div>
                    )}
                  </>
                )}

                {/* Overview Tab */}
                {activeTab === 'overview' && data && metaData && (
                  <div className="space-y-8">
                    {/* GA4 Quick Metrics */}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-4">Website Analytics (GA4)</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <MetricCard
                          icon={Users}
                          label="Sessions"
                          value={data.sessions}
                          color="blue"
                        />
                        <MetricCard
                          icon={TrendingUp}
                          label="Users"
                          value={data.users}
                          color="green"
                        />
                        <MetricCard
                          icon={Eye}
                          label="Pageviews"
                          value={data.pageviews}
                          color="purple"
                        />
                        <MetricCard
                          icon={Activity}
                          label="Bounce Rate"
                          value={`${data.bounceRate}%`}
                          color="orange"
                        />
                        <MetricCard
                          icon={Zap}
                          label="Avg Session"
                          value={`${data.avgSessionDuration}s`}
                          color="red"
                        />
                      </div>
                    </div>

                    {/* Meta Quick Metrics */}
                    <div>
                      <h2 className="text-xl font-bold text-slate-900 mb-4">Ads Performance (Meta)</h2>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <MetricCard
                          icon={DollarSign}
                          label="Total Spend"
                          value={`$${metaData.totalSpend.toFixed(2)}`}
                          color="pink"
                        />
                        <MetricCard
                          icon={Eye}
                          label="Impressions"
                          value={metaData.totalImpressions.toLocaleString()}
                          color="cyan"
                        />
                        <MetricCard
                          icon={MousePointerClick}
                          label="Clicks"
                          value={metaData.totalClicks.toLocaleString()}
                          color="indigo"
                        />
                        <MetricCard
                          icon={BarChart3}
                          label="Avg CTR"
                          value={`${metaData.averageCtr.toFixed(2)}%`}
                          color="lime"
                        />
                        <MetricCard
                          icon={ShoppingCart}
                          label="Active Campaigns"
                          value={metaData.activeCampaigns}
                          color="rose"
                        />
                      </div>
                    </div>

                    {/* Financial Data */}
                    {financialData && (
                      <div>
                        <h2 className="text-xl font-bold text-slate-900 mb-4">
                          💰 Date Financiare (SmartBill)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <MetricCard
                            icon={DollarSign}
                            label="Venituri"
                            value={`${financialData.totalRevenue.toFixed(2)} RON`}
                            color="green"
                          />
                          <MetricCard
                            icon={FileText}
                            label="Creanțe"
                            value={`${financialData.unpaidAmount.toFixed(2)} RON`}
                            color="orange"
                          />
                          <MetricCard
                            icon={FileText}
                            label="Total Facturi"
                            value={financialData.invoiceCount}
                            color="blue"
                          />
                          <MetricCard
                            icon={BarChart3}
                            label="Incasate"
                            value={financialData.invoicesPaid}
                            color="lime"
                          />
                          <MetricCard
                            icon={Activity}
                            label="Neîncasate"
                            value={financialData.invoicesUnpaid}
                            color="red"
                          />
                        </div>
                      </div>
                    )}

                    {financialError && (
                      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-yellow-800">
                        <div className="flex items-start gap-3">
                          <div className="text-yellow-500 font-bold">⚠️</div>
                          <div>
                            <h4 className="font-semibold">Financial Data</h4>
                            <p className="text-sm">{financialError}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Charts Row */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Daily Sessions */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Daily Sessions</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <LineChart data={data.dailyData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                              }}
                            />
                            <Line
                              type="monotone"
                              dataKey="sessions"
                              stroke="#3b82f6"
                              dot={false}
                              strokeWidth={2}
                            />
                          </LineChart>
                        </ResponsiveContainer>
                      </div>

                      {/* Traffic Sources */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Traffic Sources</h3>
                        <ResponsiveContainer width="100%" height={300}>
                          <PieChart>
                            <Pie
                              data={data.trafficData}
                              dataKey="sessions"
                              nameKey="source"
                              cx="50%"
                              cy="50%"
                              outerRadius={80}
                              label
                            >
                              {data.trafficData.map((_, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                              ))}
                            </Pie>
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                              }}
                            />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                )}

                {/* GA4 Analytics Tab */}
                {activeTab === 'ga4' && data && (
                  <div className="space-y-8">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Top Pages */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Top Pages</h3>
                        <div className="space-y-3">
                          {data.topPages.slice(0, 5).map((page, idx) => (
                            <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-b-0">
                              <p className="text-sm text-slate-700 truncate">{page.page}</p>
                              <p className="text-sm font-semibold text-slate-900">{parseInt(page.views).toLocaleString()}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Top Countries */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Top Countries</h3>
                        <ResponsiveContainer width="100%" height={250}>
                          <BarChart data={data.countriesData}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="country" stroke="#64748b" style={{ fontSize: '12px' }} />
                            <YAxis stroke="#64748b" style={{ fontSize: '12px' }} />
                            <Tooltip
                              contentStyle={{
                                backgroundColor: '#1e293b',
                                border: 'none',
                                borderRadius: '8px',
                                color: '#f1f5f9',
                              }}
                            />
                            <Bar dataKey="sessions" fill="#3b82f6" />
                          </BarChart>
                        </ResponsiveContainer>
                      </div>
                    </div>

                    {/* Events Table */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Top 10 Events</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Event</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Triggers</th>
                            </tr>
                          </thead>
                          <tbody>
                            {data.events.map((event, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-slate-900">{event.event}</td>
                                <td className="text-right py-3 px-4 font-medium text-slate-900">{event.count.toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Meta Ads Tab */}
                {activeTab === 'meta' && metaData && (
                  <div className="space-y-8">
                    {/* Top Campaigns */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-4">Top Campaigns</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b border-slate-200">
                              <th className="text-left py-3 px-4 font-semibold text-slate-700">Campaign</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Spend</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Impressions</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">Clicks</th>
                              <th className="text-right py-3 px-4 font-semibold text-slate-700">CTR</th>
                            </tr>
                          </thead>
                          <tbody>
                            {metaData.topCampaigns.map((campaign, idx) => (
                              <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50">
                                <td className="py-3 px-4 text-slate-900 font-medium">{campaign.name}</td>
                                <td className="text-right py-3 px-4 text-slate-900">${campaign.spend.toFixed(2)}</td>
                                <td className="text-right py-3 px-4 text-slate-900">{campaign.impressions.toLocaleString()}</td>
                                <td className="text-right py-3 px-4 text-slate-900">{campaign.clicks.toLocaleString()}</td>
                                <td className="text-right py-3 px-4 font-medium text-slate-900">{campaign.ctr}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}

                {/* Financial Data Tab */}
                {activeTab === 'financial' && financialData && (
                  <div className="space-y-8">
                    {/* Financial Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                      <MetricCard
                        icon={DollarSign}
                        label="Venituri"
                        value={`${financialData.totalRevenue.toFixed(2)} RON`}
                        color="green"
                      />
                      <MetricCard
                        icon={FileText}
                        label="Creanțe"
                        value={`${financialData.unpaidAmount.toFixed(2)} RON`}
                        color="orange"
                      />
                      <MetricCard
                        icon={FileText}
                        label="Total Facturi"
                        value={financialData.invoiceCount}
                        color="blue"
                      />
                      <MetricCard
                        icon={BarChart3}
                        label="Incasate"
                        value={financialData.invoicesPaid}
                        color="lime"
                      />
                      <MetricCard
                        icon={Activity}
                        label="Neîncasate"
                        value={financialData.invoicesUnpaid}
                        color="red"
                      />
                    </div>

                    {/* Financial Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                      {/* Revenue Summary */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Rezumat Venituri</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <span className="text-slate-600">Venituri Incasate:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {financialData.totalRevenue.toFixed(2)} RON
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <span className="text-slate-600">Creanțe (Neîncasate):</span>
                            <span className="text-2xl font-bold text-orange-600">
                              {financialData.unpaidAmount.toFixed(2)} RON
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Total Potențial:</span>
                            <span className="text-2xl font-bold text-blue-600">
                              {(financialData.totalRevenue + financialData.unpaidAmount).toFixed(2)} RON
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Invoice Statistics */}
                      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                        <h3 className="text-lg font-bold text-slate-900 mb-6">Statistici Facturi</h3>
                        <div className="space-y-4">
                          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <span className="text-slate-600">Total Facturi:</span>
                            <span className="text-2xl font-bold text-slate-900">
                              {financialData.invoiceCount}
                            </span>
                          </div>
                          <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                            <span className="text-slate-600">Facturi Incasate:</span>
                            <span className="text-2xl font-bold text-green-600">
                              {financialData.invoicesPaid}
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-slate-600">Facturi În Așteptare:</span>
                            <span className="text-2xl font-bold text-orange-600">
                              {financialData.invoicesUnpaid}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Average Invoice */}
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
                      <div className="text-center">
                        <p className="text-slate-600 font-semibold mb-2">Valoare Medie pe Factură</p>
                        <p className="text-5xl font-bold text-blue-600">
                          {financialData.averageInvoiceValue.toFixed(2)} RON
                        </p>
                        <p className="text-sm text-slate-600 mt-2">
                          Pentru perioada: {financialData.dateRange.from} - {financialData.dateRange.to}
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {error && activeTab === 'ga4' && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                    <p className="font-semibold">Error loading GA4 data</p>
                    <p className="text-sm mt-1">{error}</p>
                  </div>
                )}

                {metaError && activeTab === 'meta' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
                    <p className="font-semibold">Could not load Meta Ads data</p>
                    <p className="text-sm mt-1">{metaError}</p>
                  </div>
                )}

                {financialError && activeTab === 'financial' && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-yellow-800">
                    <p className="font-semibold">Could not load Financial data</p>
                    <p className="text-sm mt-1">{financialError}</p>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
