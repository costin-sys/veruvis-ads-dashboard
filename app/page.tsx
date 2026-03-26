'use client';

import { useEffect, useState } from 'react';
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
  Legend,
  ResponsiveContainer,
} from 'recharts';

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

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

export default function Home() {
  const [data, setData] = useState<GA4Data | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/ga4')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json.data);
        } else {
          setError(json.error || 'Failed to load GA4 data');
        }
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-2">
            GA4 Analytics Dashboard
          </h1>
          <p className="text-slate-600 dark:text-slate-400">
            Last 30 days performance metrics
          </p>
        </div>

        {loading && (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-slate-600 dark:text-slate-400">
              Loading analytics data...
            </p>
          </div>
        )}

        {error && (
          <div className="rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 p-4 text-red-800 dark:text-red-200">
            <p className="font-semibold">Error loading GA4 data</p>
            <p className="text-sm mt-1">{error}</p>
          </div>
        )}

        {data && (
          <>
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
              <MetricCard
                label="Sessions"
                value={data.sessions}
                color="border-blue-500"
              />
              <MetricCard
                label="Users"
                value={data.users}
                color="border-green-500"
              />
              <MetricCard
                label="Pageviews"
                value={data.pageviews}
                color="border-purple-500"
              />
              <MetricCard
                label="Bounce Rate"
                value={`${data.bounceRate}%`}
                color="border-orange-500"
              />
              <MetricCard
                label="Avg Session"
                value={`${data.avgSessionDuration}s`}
                color="border-red-500"
              />
            </div>

            {/* Daily Sessions Chart */}
            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Daily Sessions (Last 30 Days)
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data.dailyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
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

            {/* Traffic Sources and Devices */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Traffic Sources */}
              <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Traffic Sources
                </h2>
                <ResponsiveContainer width="100%" height={250}>
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
                <div className="mt-4 space-y-2">
                  {data.trafficData.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              COLORS[idx % COLORS.length],
                          }}
                        ></span>
                        {item.source}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.sessions}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Device Category */}
              <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Device Breakdown
                </h2>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={data.deviceData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                    >
                      {data.deviceData.map((_, index) => (
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
                <div className="mt-4 space-y-2">
                  {data.deviceData.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm">
                      <span className="text-slate-600 dark:text-slate-400">
                        <span
                          className="inline-block w-3 h-3 rounded-full mr-2"
                          style={{
                            backgroundColor:
                              COLORS[idx % COLORS.length],
                          }}
                        ></span>
                        {item.name}
                      </span>
                      <span className="font-semibold text-slate-900 dark:text-white">
                        {item.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top Countries */}
            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Top 5 Countries
              </h2>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={data.countriesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                  <XAxis dataKey="country" stroke="#64748b" />
                  <YAxis stroke="#64748b" />
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

            {/* Landing and Exit Pages */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {/* Landing Pages */}
              <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Top 5 Landing Pages
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Page
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Sessions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.landingPages.map((page, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-900 dark:text-slate-100 truncate text-xs">
                            {page.page}
                          </td>
                          <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                            {parseInt(page.sessions).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Exit Pages */}
              <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                  Top 5 Exit Pages
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 dark:border-slate-700">
                        <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Page
                        </th>
                        <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                          Sessions
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.exitPages.map((page, idx) => (
                        <tr
                          key={idx}
                          className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        >
                          <td className="py-3 px-4 text-slate-900 dark:text-slate-100 truncate text-xs">
                            {page.page}
                          </td>
                          <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                            {parseInt(page.sessions).toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Top Events */}
            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 mb-8">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Top 10 Events
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Event
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Triggers
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.events.map((event, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 truncate">
                          {event.event}
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          {event.count.toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Top Pages */}
            <div className="rounded-lg bg-white dark:bg-slate-800 shadow-md p-6">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Top Pages
              </h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-700">
                      <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Page
                      </th>
                      <th className="text-right py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">
                        Views
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topPages.map((page, idx) => (
                      <tr
                        key={idx}
                        className="border-b border-slate-100 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                      >
                        <td className="py-3 px-4 text-slate-900 dark:text-slate-100 truncate">
                          {page.page}
                        </td>
                        <td className="text-right py-3 px-4 font-medium text-slate-900 dark:text-slate-100">
                          {parseInt(page.views).toLocaleString()}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string | number;
  color: string;
}) {
  return (
    <div
      className={`rounded-lg bg-white dark:bg-slate-800 shadow-md p-6 border-l-4 ${color}`}
    >
      <p className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">
        {label}
      </p>
      <p className="text-2xl font-bold text-slate-900 dark:text-white">
        {typeof value === 'number' ? value.toLocaleString() : value}
      </p>
    </div>
  );
}
