'use client';

import { useState, useEffect } from 'react';
import { Shield, Clock, AlertCircle, CheckCircle, Info, XCircle, RefreshCw, Download, Trash2, BarChart3, Users, Eye } from 'lucide-react';
import Link from 'next/link';
import { SimpleAnalytics, type VisitorStats } from '@/lib/analytics';

export default function AdminConsolePage() {
  const [logs, setLogs] = useState<any[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [visitorStats, setVisitorStats] = useState<VisitorStats>({ today: 0, thisWeek: 0, thisMonth: 0, total: 0 });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Initialize admin logs if not present
      (window as any).adminLogs = (window as any).adminLogs || [];
      setLogs((window as any).adminLogs);

      // Load visitor statistics
      setVisitorStats(SimpleAnalytics.getVisitorStats());
    }
  }, []);

  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      if (typeof window !== 'undefined' && (window as any).adminLogs) {
        setLogs([...(window as any).adminLogs]);
        // Also refresh visitor stats
        setVisitorStats(SimpleAnalytics.getVisitorStats());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const filteredLogs = logs.filter(log => {
    const matchesFilter = filter === 'all' || log.level === filter;
    const matchesSearch = !search ||
      log.message.toLowerCase().includes(search.toLowerCase()) ||
      log.service?.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.data).toLowerCase().includes(search.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'error':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warn':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'info':
        return <Info className="w-4 h-4 text-blue-500" />;
      default:
        return <CheckCircle className="w-4 h-4 text-green-500" />;
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'warn':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
        return 'bg-blue-50 border-blue-200';
      default:
        return 'bg-green-50 border-green-200';
    }
  };

  const clearLogs = () => {
    if (typeof window !== 'undefined') {
      (window as any).adminLogs = [];
      setLogs([]);
    }
  };

  const exportLogs = () => {
    const dataStr = JSON.stringify(logs, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = `admin-logs-${new Date().toISOString()}.json`;

    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const getMetrics = () => {
    const errorCount = logs.filter(log => log.level === 'error').length;
    const warnCount = logs.filter(log => log.level === 'warn').length;
    const avgLoadTime = logs
      .filter(log => log.data?.loadTime)
      .reduce((sum, log, _, arr) => sum + (log.data.loadTime / arr.length), 0);

    return { errorCount, warnCount, avgLoadTime };
  };

  const metrics = getMetrics();

  return (
    <div className="container-responsive py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-[var(--color-warm-900)] mb-2">Admin Console</h1>
          <p className="text-[var(--color-warm-600)]">Real-time logging and performance monitoring</p>
        </div>

        {/* Metrics Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-warm-600)]">Total Logs</span>
              <Info className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--color-warm-900)]">{logs.length}</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-warm-600)]">Errors</span>
              <XCircle className="w-4 h-4 text-red-500" />
            </div>
            <div className="text-2xl font-bold text-red-600">{metrics.errorCount}</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-warm-600)]">Warnings</span>
              <AlertCircle className="w-4 h-4 text-yellow-500" />
            </div>
            <div className="text-2xl font-bold text-yellow-600">{metrics.warnCount}</div>
          </div>

          <div className="card p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-[var(--color-warm-600)]">Avg Load Time</span>
              <Clock className="w-4 h-4 text-green-500" />
            </div>
            <div className="text-2xl font-bold text-[var(--color-warm-900)]">
              {metrics.avgLoadTime.toFixed(0)}ms
            </div>
          </div>
        </div>

        {/* Website Analytics */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-[var(--color-warm-900)] mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-[var(--color-primary-500)]" />
            Website Analytics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-warm-600)]">Today</span>
                <Eye className="w-4 h-4 text-[var(--color-primary-500)]" />
              </div>
              <div className="text-2xl font-bold text-[var(--color-warm-900)]">{visitorStats.today}</div>
              <span className="text-xs text-[var(--color-warm-500)]">Visitors</span>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-warm-600)]">This Week</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--color-warm-900)]">{visitorStats.thisWeek}</div>
              <span className="text-xs text-[var(--color-warm-500)]">Visitors</span>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-warm-600)]">This Month</span>
                <BarChart3 className="w-4 h-4 text-green-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--color-warm-900)]">{visitorStats.thisMonth}</div>
              <span className="text-xs text-[var(--color-warm-500)]">Visitors</span>
            </div>

            <div className="card p-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-[var(--color-warm-600)]">Total</span>
                <Shield className="w-4 h-4 text-purple-500" />
              </div>
              <div className="text-2xl font-bold text-[var(--color-warm-900)]">{visitorStats.total}</div>
              <span className="text-xs text-[var(--color-warm-500)]">All-time visitors</span>
            </div>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-500 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Analytics Info</h4>
                <p className="text-sm text-blue-700 mb-2">
                  Visitor tracking uses browser localStorage and session storage for privacy-friendly analytics.
                </p>
                <ul className="text-xs text-blue-600 space-y-1">
                  <li>• Each unique browser session counts as one visitor per day</li>
                  <li>• Data is stored locally and resets daily</li>
                  <li>• Page views tracked on route changes</li>
                  <li>• Today's count: {SimpleAnalytics.getTodayPageViews()} page views</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="card p-4 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <input
              type="text"
              placeholder="Search logs..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-warm-200)] focus:border-[var(--color-primary-500)] focus:ring-2 focus:ring-[var(--color-primary-100)]"
            />

            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 rounded-lg border border-[var(--color-warm-200)] focus:border-[var(--color-primary-500)]"
            >
              <option value="all">All Levels</option>
              <option value="error">Errors</option>
              <option value="warn">Warnings</option>
              <option value="info">Info</option>
            </select>

            <button
              onClick={() => setAutoRefresh(!autoRefresh)}
              className={`btn ${autoRefresh ? 'btn-primary' : 'btn-secondary'}`}
            >
              <RefreshCw className={`w-4 h-4 ${autoRefresh ? 'animate-spin' : ''}`} />
              <span>{autoRefresh ? 'Auto-refresh On' : 'Auto-refresh Off'}</span>
            </button>

            <button onClick={exportLogs} className="btn btn-secondary">
              <Download className="w-4 h-4" />
              <span>Export</span>
            </button>

            <button onClick={clearLogs} className="btn btn-secondary">
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </button>
          </div>
        </div>

        {/* Logs Display */}
        <div className="space-y-3">
          {filteredLogs.length === 0 ? (
            <div className="card p-8 text-center">
              <Info className="w-12 h-12 mx-auto mb-4 text-[var(--color-warm-400)]" />
              <h3 className="text-lg font-semibold mb-2">No logs to display</h3>
              <p className="text-[var(--color-warm-600)]">
                Logs will appear here as you interact with the application
              </p>
            </div>
          ) : (
            filteredLogs.reverse().map((log, index) => (
              <div key={index} className={`card p-4 border ${getLevelColor(log.level)}`}>
                <div className="flex items-start gap-3">
                  {getLevelIcon(log.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-[var(--color-warm-900)]">
                        {log.service || 'Unknown'}
                      </span>
                      <span className="text-xs text-[var(--color-warm-500)]">
                        {log.environment}
                      </span>
                      <span className="text-xs text-[var(--color-warm-500)]">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-[var(--color-warm-700)] mb-2">{log.message}</p>
                    {log.data && (
                      <details className="mt-2">
                        <summary className="cursor-pointer text-sm text-[var(--color-warm-600)] hover:text-[var(--color-primary-600)]">
                          View details
                        </summary>
                        <pre className="mt-2 p-3 bg-white/50 rounded text-xs overflow-x-auto">
                          {JSON.stringify(log.data, null, 2)}
                        </pre>
                      </details>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Performance Tips */}
        {metrics.avgLoadTime > 2000 && (
          <div className="mt-8 card p-6 bg-yellow-50 border-yellow-200">
            <div className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-1" />
              <div>
                <h3 className="font-semibold text-yellow-900 mb-2">Performance Alert</h3>
                <p className="text-yellow-800 mb-3">
                  Average load time is high ({metrics.avgLoadTime.toFixed(0)}ms). Consider:
                </p>
                <ul className="space-y-1 text-sm text-yellow-700">
                  <li>• Implementing caching strategies</li>
                  <li>• Optimizing database queries</li>
                  <li>• Reducing the number of properties loaded initially</li>
                  <li>• Using pagination for large datasets</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
  );
}