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
  totalUnpaidAmount: number;
  totalInvoiceCount: number;
  companies: Array<{
    cif: string;
    companyName: string;
    totalRevenue: number;
    invoiceCount: number;
    unpaidAmount: number;
    invoicesPaid: number;
    invoicesUnpaid: number;
    averageInvoiceValue: number;
  }>;
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
  const [analysisSectionBlocks, setAnalysisSectionBlocks] = useState<Array<{icon: string; title: string; text: string}>>([]);
  const [agencyGuide, setAgencyGuide] = useState<string | null>(null);
  const [metaTokenStatus, setMetaTokenStatus] = useState<{
    valid: boolean;
    daysUntilExpiry: number | null;
    needsRefresh: boolean;
    isExpired: boolean;
    expiresAt: number | null;
    source: string;
  } | null>(null);
  const [tokenRefreshing, setTokenRefreshing] = useState(false);
  const [refreshResult, setRefreshResult] = useState<{
    newToken: string;
    expiresDate: string;
    daysUntilExpiry: number;
  } | null>(null);

  const parseAnalysisSections = (text: string) => {
    const lines = text.split('\n');
    const blocks: Array<{icon: string; title: string; text: string}> = [];
    let current = {icon: '📋', title: 'Rezumat AI', text: ''};
    const sectionRegex = /^\s*([✅⚠️📋]+)\s*(.*)$/;

    for (const line of lines) {
      const match = sectionRegex.exec(line);
      if (match) {
        if (current.text.trim().length > 0) {
          blocks.push({ ...current, text: current.text.trim() });
        }
        current = { icon: match[1], title: match[2] || 'Secțiune', text: '' };
      } else {
        current.text += (current.text ? '\n' : '') + line;
      }
    }
    if (current.text.trim().length > 0 || blocks.length === 0) {
      blocks.push({ ...current, text: current.text.trim() });
    }
    return blocks;
  };

  const formatRON = (value: any) => {
    if (typeof value === 'number') {
      return `${value.toFixed(2)} RON`;
    }
    return '';
  };

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

  // Fetch token status o singură dată la mount
  useEffect(() => {
    fetch('/api/meta/token-status')
      .then((r) => r.json())
      .then((d) => { if (d.success) setMetaTokenStatus(d); })
      .catch(() => {});
  }, []);

  const handleRefreshToken = async () => {
    setTokenRefreshing(true);
    setRefreshResult(null);
    try {
      const res = await fetch('/api/meta/refresh-token', { method: 'POST' });
      const json = await res.json();
      if (json.success) {
        setRefreshResult({
          newToken: json.newToken,
          expiresDate: json.expiresDate,
          daysUntilExpiry: json.daysUntilExpiry,
        });
        // Actualizăm statusul tokenului local
        setMetaTokenStatus((prev) => prev ? { ...prev, needsRefresh: false, isExpired: false, valid: true, daysUntilExpiry: json.daysUntilExpiry } : prev);
      } else {
        alert(`Eroare refresh token: ${json.error}`);
      }
    } catch {
      alert('Eroare la reînnoirea tokenului.');
    } finally {
      setTokenRefreshing(false);
    }
  };

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
        setAnalysisSectionBlocks(parseAnalysisSections(result.analysis || ''));
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
      case 'ai-analysis':
        return 'Analizează cu AI';
      default:
        return 'Dashboard Overview';
    }
  };

  return (
    <div className="flex h-screen bg-slate-100">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} metaTokenStatus={metaTokenStatus} />

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
                {/* AI Analysis Tab */}
                {activeTab === 'ai-analysis' && (
                  <div className="space-y-6">
                    {/* Hero Card */}
                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
                      <div className="flex items-center gap-3 mb-3">
                        <Sparkles className="h-7 w-7" />
                        <h2 className="text-2xl font-bold">Analizează date cu AI</h2>
                      </div>
                      <p className="text-indigo-100 mb-6 max-w-xl">
                        Claude analizează datele tale din GA4 și Meta Ads și generează insights acționabile
                        și recomandări concrete pentru echipa de marketing.
                      </p>
                      {data && metaData ? (
                        <button
                          onClick={handleAnalyze}
                          disabled={analysisLoading}
                          className="inline-flex items-center gap-2 px-6 py-3 bg-white text-indigo-700 font-semibold rounded-xl hover:bg-indigo-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-md"
                        >
                          {analysisLoading ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-indigo-600"></div>
                              Claude analizează datele...
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-5 w-5" />
                              {analysis ? 'Regenerează analiza' : 'Pornește analiza'}
                            </>
                          )}
                        </button>
                      ) : (
                        <p className="text-indigo-200 text-sm">Se încarcă datele GA4 și Meta Ads...</p>
                      )}
                    </div>

                    {/* Error from analysis */}
                    {error && (
                      <div className="bg-red-50 border border-red-300 rounded-xl p-4 text-red-800">
                        <div className="flex items-start gap-3">
                          <span className="font-bold">⚠️</span>
                          <div>
                            <h4 className="font-semibold">Eroare</h4>
                            <p className="text-sm">{error}</p>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Empty state */}
                    {!analysis && !analysisLoading && (
                      <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-50 mb-4">
                          <Sparkles className="h-8 w-8 text-indigo-500" />
                        </div>
                        <h3 className="text-lg font-semibold text-slate-900 mb-2">Nicio analiză încă</h3>
                        <p className="text-slate-500 text-sm max-w-sm mx-auto">
                          Apasă butonul de mai sus pentru a genera o analiză completă a datelor tale de marketing.
                        </p>
                      </div>
                    )}

                    {/* Analysis Results — Section 1 */}
                    {analysis && (
                      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-100 bg-slate-50">
                          <h3 className="font-bold text-slate-900">📊 Analiza datelor</h3>
                        </div>
                        <div className="p-6 space-y-4">
                          {analysisSectionBlocks.length === 0 ? (
                            <pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-700 leading-relaxed">
                              {analysis}
                            </pre>
                          ) : (
                            analysisSectionBlocks.map((section, idx) => {
                              const base = section.icon.includes('✅')
                                ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                                : section.icon.includes('⚠️')
                                ? 'bg-amber-50 border-amber-200 text-amber-900'
                                : 'bg-blue-50 border-blue-200 text-blue-900';
                              return (
                                <div key={`${section.title}-${idx}`} className={`rounded-xl border p-4 ${base}`}>
                                  <div className="flex items-center gap-2 text-sm font-semibold mb-2">
                                    <span>{section.icon}</span>
                                    <span>{section.title || 'Secțiune'}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap leading-relaxed text-sm font-sans">{section.text}</p>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    )}

                    {/* Agency Guide — Section 2 */}
                    {agencyGuide && (
                      <div className="bg-white rounded-2xl border border-amber-200 shadow-sm overflow-hidden">
                        <div className="px-6 py-4 border-b border-amber-100 bg-amber-50">
                          <h3 className="font-bold text-amber-900">📋 Ghid pentru agenție</h3>
                        </div>
                        <div className="p-6">
                          <pre className="whitespace-pre-wrap break-words font-sans text-sm text-slate-700 leading-relaxed">
                            {agencyGuide}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
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
                          💰 Date Financiare Consolidate (SmartBill)
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                          <MetricCard
                            icon={DollarSign}
                            label="Total Venituri"
                            value={`${financialData.totalRevenue.toFixed(2)} RON`}
                            color="green"
                          />
                          <MetricCard
                            icon={FileText}
                            label="Total Creanțe"
                            value={`${financialData.totalUnpaidAmount.toFixed(2)} RON`}
                            color="orange"
                          />
                          <MetricCard
                            icon={FileText}
                            label="Total Facturi"
                            value={financialData.totalInvoiceCount}
                            color="blue"
                          />
                          <MetricCard
                            icon={BarChart3}
                            label="3 Firme"
                            value={financialData.companies.length}
                            color="purple"
                          />
                          <MetricCard
                            icon={Activity}
                            label="Avg/Firmă"
                            value={`${(financialData.totalRevenue / financialData.companies.length).toFixed(2)} RON`}
                            color="cyan"
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

                    {/* Token Status Card */}
                    {metaTokenStatus && (
                      <div className={`rounded-xl p-5 border flex flex-col sm:flex-row sm:items-center gap-4 ${
                        metaTokenStatus.isExpired || !metaTokenStatus.valid
                          ? 'bg-red-50 border-red-200'
                          : metaTokenStatus.needsRefresh
                          ? 'bg-yellow-50 border-yellow-300'
                          : 'bg-green-50 border-green-200'
                      }`}>
                        <div className="flex items-center gap-3 flex-1">
                          <span className={`text-2xl ${
                            metaTokenStatus.isExpired ? '🔴' : metaTokenStatus.needsRefresh ? '🟡' : '🟢'
                          }`}>
                            {metaTokenStatus.isExpired ? '🔴' : metaTokenStatus.needsRefresh ? '⚠️' : '✅'}
                          </span>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">
                              {metaTokenStatus.isExpired
                                ? 'Token Meta Ads expirat — datele nu se mai pot încărca'
                                : metaTokenStatus.needsRefresh
                                ? `Token expiră în ${metaTokenStatus.daysUntilExpiry} zile — reînnoire recomandată`
                                : `Token valid — mai sunt ${metaTokenStatus.daysUntilExpiry ?? '?'} zile până la expirare`}
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Sursă: {metaTokenStatus.source === 'file' ? 'fișier local (meta-token.json)' : 'variabilă de mediu (.env.local)'}
                              {metaTokenStatus.expiresAt && ` · Expiră: ${new Date(metaTokenStatus.expiresAt * 1000).toLocaleDateString('ro-RO')}`}
                            </p>
                          </div>
                        </div>
                        <button
                          onClick={handleRefreshToken}
                          disabled={tokenRefreshing}
                          className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                          {tokenRefreshing ? (
                            <>
                              <span className="animate-spin h-4 w-4 border-b-2 border-white rounded-full" />
                              Se reînnoiește...
                            </>
                          ) : (
                            '🔄 Reînnoiește tokenul'
                          )}
                        </button>
                      </div>
                    )}

                    {/* Refresh Result — afișăm noul token */}
                    {refreshResult && (
                      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
                        <p className="font-semibold text-blue-900 mb-2">✅ Token reînnoit cu succes!</p>
                        <p className="text-xs text-blue-700 mb-3">
                          Valabil până la: <strong>{refreshResult.expiresDate}</strong> ({refreshResult.daysUntilExpiry} zile)
                        </p>
                        <p className="text-xs text-slate-600 mb-2 font-medium">Copiază tokenul și actualizează <code className="bg-white px-1 py-0.5 rounded border">META_ACCESS_TOKEN</code> în Vercel → Settings → Environment Variables:</p>
                        <div className="flex items-center gap-2">
                          <code className="flex-1 block bg-white border border-blue-200 rounded-lg px-3 py-2 text-xs text-slate-800 break-all font-mono">
                            {refreshResult.newToken}
                          </code>
                          <button
                            onClick={() => navigator.clipboard.writeText(refreshResult.newToken)}
                            className="flex-shrink-0 px-3 py-2 bg-blue-600 text-white text-xs rounded-lg hover:bg-blue-700 transition"
                          >
                            📋 Copiază
                          </button>
                        </div>
                      </div>
                    )}

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
                    {/* Consolidated Summary */}
                    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-8 border border-blue-200">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="text-center">
                          <p className="text-slate-600 font-semibold mb-2">Total Venituri Consolidate</p>
                          <p className="text-4xl font-bold text-green-600">
                            {financialData.totalRevenue.toFixed(2)} RON
                          </p>
                        </div>
                        <div className="text-center border-l border-r border-slate-300">
                          <p className="text-slate-600 font-semibold mb-2">Total Creanțe</p>
                          <p className="text-4xl font-bold text-orange-600">
                            {financialData.totalUnpaidAmount.toFixed(2)} RON
                          </p>
                        </div>
                        <div className="text-center">
                          <p className="text-slate-600 font-semibold mb-2">Total Potențial</p>
                          <p className="text-4xl font-bold text-blue-600">
                            {(financialData.totalRevenue + financialData.totalUnpaidAmount).toFixed(2)} RON
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-slate-600 mt-6 text-center">
                        Pentru perioada: {financialData.dateRange.from} - {financialData.dateRange.to}
                      </p>
                    </div>

                    {/* Companies Breakdown */}
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 mb-6">Detalii pe Firme</h2>
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {financialData.companies.map((company, idx) => (
                          <div
                            key={company.cif}
                            className="bg-white rounded-xl p-6 shadow-sm border border-slate-200 hover:shadow-md transition-shadow"
                          >
                            <div className="mb-4">
                              <h3 className="text-lg font-bold text-slate-900">{company.companyName}</h3>
                              <p className="text-sm text-slate-500">CIF: {company.cif}</p>
                            </div>

                            <div className="space-y-4">
                              <div className="bg-green-50 rounded-lg p-4">
                                <p className="text-xs text-slate-600 font-semibold uppercase">Venituri Incasate</p>
                                <p className="text-2xl font-bold text-green-600 mt-1">
                                  {company.totalRevenue.toFixed(2)} RON
                                </p>
                              </div>

                              <div className="bg-orange-50 rounded-lg p-4">
                                <p className="text-xs text-slate-600 font-semibold uppercase">Creanțe</p>
                                <p className="text-2xl font-bold text-orange-600 mt-1">
                                  {company.unpaidAmount.toFixed(2)} RON
                                </p>
                              </div>

                              <div className="grid grid-cols-2 gap-4">
                                <div className="bg-blue-50 rounded-lg p-3">
                                  <p className="text-xs text-slate-600 font-semibold">Total Facturi</p>
                                  <p className="text-xl font-bold text-blue-600 mt-1">{company.invoiceCount}</p>
                                </div>
                                <div className="bg-slate-50 rounded-lg p-3">
                                  <p className="text-xs text-slate-600 font-semibold">Medie/Factură</p>
                                  <p className="text-xl font-bold text-slate-900 mt-1">
                                    {company.averageInvoiceValue.toFixed(0)} RON
                                  </p>
                                </div>
                              </div>

                              <div className="border-t border-slate-200 pt-4">
                                <div className="flex justify-between text-sm mb-2">
                                  <span className="text-green-700 font-semibold">Incasate: {company.invoicesPaid}</span>
                                  <span className="text-orange-700 font-semibold">Neîncasate: {company.invoicesUnpaid}</span>
                                </div>
                                <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
                                  <div
                                    className="bg-green-600 h-full"
                                    style={{
                                      width: `${company.invoiceCount > 0 ? (company.invoicesPaid / company.invoiceCount) * 100 : 0}%`,
                                    }}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Comparison Chart */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">Comparație Venituri între Firme</h3>
                      <ResponsiveContainer width="100%" height={400}>
                        <BarChart
                          data={financialData.companies.map((c) => ({
                            name: c.companyName,
                            venituri: c.totalRevenue,
                            creanțe: c.unpaidAmount,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#f1f5f9',
                            }}
                            formatter={formatRON}
                          />
                          <Bar dataKey="venituri" fill="#10b981" name="Venituri Incasate" />
                          <Bar dataKey="creanțe" fill="#f59e0b" name="Creanțe" />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Invoice Count Comparison */}
                    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
                      <h3 className="text-lg font-bold text-slate-900 mb-6">Facturi - Comparație Firme</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart
                          data={financialData.companies.map((c) => ({
                            name: c.companyName,
                            incasate: c.invoicesPaid,
                            neincasate: c.invoicesUnpaid,
                          }))}
                        >
                          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                          <XAxis dataKey="name" stroke="#64748b" />
                          <YAxis stroke="#64748b" />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: '#1e293b',
                              border: 'none',
                              borderRadius: '8px',
                              color: '#f1f5f9',
                            }}
                          />
                          <Bar dataKey="incasate" fill="#3b82f6" name="Facturi Incasate" />
                          <Bar dataKey="neincasate" fill="#ef4444" name="Facturi Neîncasate" />
                        </BarChart>
                      </ResponsiveContainer>
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
