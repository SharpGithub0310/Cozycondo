'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Calendar,
  TrendingUp,
  Home,
  Users,
  Moon,
  RefreshCw,
  ChevronDown,
  Building2
} from 'lucide-react';

// =============================================
// TypeScript Interfaces
// =============================================

interface RevenueStats {
  totalRevenue: number;
  bookingCount: number;
  totalNights: number;
  avgNightlyRate: number;
  occupancyRate: number;
}

interface MonthlyRevenue {
  monthNumber: number;
  monthName: string;
  revenue: number;
  bookingCount: number;
}

interface PropertyRevenue {
  propertyId: string;
  propertyName: string;
  revenue: number;
  bookingCount: number;
  totalNights: number;
  occupancyRate: number;
}

interface RevenueData {
  period: {
    startDate: string;
    endDate: string;
    label: string;
  };
  stats: RevenueStats;
  monthlyTrend: MonthlyRevenue[];
  propertyBreakdown: PropertyRevenue[];
}

interface Property {
  id: string;
  name: string;
}

// =============================================
// Period Options
// =============================================

const periodOptions = [
  { value: 'month', label: 'This Month' },
  { value: 'last_month', label: 'Last Month' },
  { value: 'quarter', label: 'This Quarter' },
  { value: 'year', label: 'This Year' },
  { value: 'custom', label: 'Custom Range' },
];

// =============================================
// Format Helpers
// =============================================

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-PH', {
    style: 'currency',
    currency: 'PHP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatPercent(value: number): string {
  return `${Math.round(value * 10) / 10}%`;
}

// =============================================
// Bar Chart Component (CSS-based)
// =============================================

interface BarChartProps {
  data: MonthlyRevenue[];
  maxValue?: number;
}

function BarChart({ data, maxValue }: BarChartProps) {
  const max = maxValue || Math.max(...data.map(d => d.revenue), 1);

  return (
    <div className="flex items-end justify-between gap-2 h-48 px-2">
      {data.map((item) => {
        const height = max > 0 ? (item.revenue / max) * 100 : 0;
        const hasData = item.revenue > 0;

        return (
          <div
            key={item.monthNumber}
            className="flex flex-col items-center flex-1 min-w-0"
          >
            {/* Bar */}
            <div className="relative w-full flex justify-center mb-2" style={{ height: '160px' }}>
              <div
                className={`w-full max-w-[40px] rounded-t-lg transition-all duration-500 ${
                  hasData
                    ? 'bg-gradient-to-t from-[#0d9488] to-[#14b8a6]'
                    : 'bg-[#e2e8f0]'
                }`}
                style={{
                  height: `${Math.max(height, 4)}%`,
                  alignSelf: 'flex-end',
                }}
                title={`${item.monthName}: ${formatCurrency(item.revenue)}`}
              />
            </div>
            {/* Label */}
            <span className="text-xs text-[#64748b] font-medium truncate w-full text-center">
              {item.monthName}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// =============================================
// Stats Card Component
// =============================================

interface StatsCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  iconColor: string;
  subtitle?: string;
}

function StatsCard({ title, value, icon: Icon, iconColor, subtitle }: StatsCardProps) {
  return (
    <div className="admin-card">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-[#64748b] font-medium mb-1">{title}</p>
          <p className="font-display text-2xl font-bold text-[#1e293b]">{value}</p>
          {subtitle && (
            <p className="text-xs text-[#94a3b8] mt-1">{subtitle}</p>
          )}
        </div>
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: iconColor + '15' }}
        >
          <Icon className="w-6 h-6" style={{ color: iconColor }} />
        </div>
      </div>
    </div>
  );
}

// =============================================
// Main Revenue Dashboard Component
// =============================================

export default function RevenueDashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null);

  // Filter state
  const [period, setPeriod] = useState('month');
  const [propertyId, setPropertyId] = useState<string>('');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [properties, setProperties] = useState<Property[]>([]);

  // Load properties for filter dropdown
  useEffect(() => {
    const loadProperties = async () => {
      try {
        const response = await fetch('/api/properties', {
          headers: {
            'x-admin-session': 'authenticated',
          }
        });
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data) {
            const propertyList = Object.values(result.data).map((p: any) => ({
              id: p.id,
              name: p.name || p.title
            }));
            setProperties(propertyList);
          }
        }
      } catch (err) {
        console.warn('Failed to load properties for filter:', err);
      }
    };
    loadProperties();
  }, []);

  // Load revenue data
  const loadRevenueData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      params.set('period', period);

      if (propertyId) {
        params.set('propertyId', propertyId);
      }

      if (period === 'custom' && customStartDate && customEndDate) {
        params.set('startDate', customStartDate);
        params.set('endDate', customEndDate);
      }

      const response = await fetch(`/api/revenue?${params.toString()}`, {
        headers: {
          'x-admin-session': 'authenticated',
        }
      });

      if (!response.ok) {
        throw new Error('Failed to load revenue data');
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to load revenue data');
      }

      setRevenueData(result.data);
    } catch (err: any) {
      console.error('Error loading revenue data:', err);
      setError(err.message || 'Failed to load revenue data');
    } finally {
      setLoading(false);
    }
  }, [period, propertyId, customStartDate, customEndDate]);

  useEffect(() => {
    // Only load if we have valid custom dates or not in custom mode
    if (period !== 'custom' || (customStartDate && customEndDate)) {
      loadRevenueData();
    }
  }, [loadRevenueData, period, customStartDate, customEndDate]);

  // Handle period change
  const handlePeriodChange = (newPeriod: string) => {
    setPeriod(newPeriod);
    if (newPeriod !== 'custom') {
      setCustomStartDate('');
      setCustomEndDate('');
    }
  };

  // Get the last 12 months for chart display
  const chartData = revenueData?.monthlyTrend || [];
  const currentMonth = new Date().getMonth();
  const displayChartData = chartData.length > 0
    ? chartData.slice(Math.max(0, currentMonth - 5), currentMonth + 1).concat(
        chartData.slice(0, Math.max(0, 6 - (currentMonth + 1)))
      ).slice(0, 6)
    : [];

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl font-semibold text-[#1e293b]">Revenue Dashboard</h1>
          <p className="text-[#64748b] mt-1">Track your booking revenue and performance</p>
        </div>
        <button
          onClick={loadRevenueData}
          disabled={loading}
          className="admin-btn admin-btn-primary"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="admin-card">
        <div className="flex flex-wrap gap-4">
          {/* Period Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="form-label">Period</label>
            <div className="relative">
              <select
                value={period}
                onChange={(e) => handlePeriodChange(e.target.value)}
                className="form-input pr-10"
              >
                {periodOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
            </div>
          </div>

          {/* Property Filter */}
          <div className="flex-1 min-w-[200px]">
            <label className="form-label">Property</label>
            <div className="relative">
              <select
                value={propertyId}
                onChange={(e) => setPropertyId(e.target.value)}
                className="form-input pr-10"
              >
                <option value="">All Properties</option>
                {properties.map((prop) => (
                  <option key={prop.id} value={prop.id}>
                    {prop.name}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748b] pointer-events-none" />
            </div>
          </div>

          {/* Custom Date Range */}
          {period === 'custom' && (
            <>
              <div className="flex-1 min-w-[150px]">
                <label className="form-label">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="form-input"
                />
              </div>
              <div className="flex-1 min-w-[150px]">
                <label className="form-label">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="form-input"
                />
              </div>
            </>
          )}
        </div>

        {/* Period Display */}
        {revenueData && (
          <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
            <p className="text-sm text-[#64748b]">
              <Calendar className="w-4 h-4 inline-block mr-2" />
              Showing data for: <span className="font-medium text-[#1e293b]">{revenueData.period.label}</span>
              {' '}({revenueData.period.startDate} to {revenueData.period.endDate})
            </p>
          </div>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="admin-card bg-red-50 border-red-200">
          <div className="flex items-center justify-between">
            <p className="text-red-600">{error}</p>
            <button onClick={loadRevenueData} className="admin-btn admin-btn-primary text-sm">
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Revenue"
          value={loading ? '...' : formatCurrency(revenueData?.stats.totalRevenue || 0)}
          icon={DollarSign}
          iconColor="#0d9488"
          subtitle={revenueData?.period.label}
        />
        <StatsCard
          title="Occupancy Rate"
          value={loading ? '...' : formatPercent(revenueData?.stats.occupancyRate || 0)}
          icon={Home}
          iconColor="#3b82f6"
          subtitle="Booked nights / Available"
        />
        <StatsCard
          title="Avg Nightly Rate"
          value={loading ? '...' : formatCurrency(revenueData?.stats.avgNightlyRate || 0)}
          icon={Moon}
          iconColor="#8b5cf6"
          subtitle="Per night average"
        />
        <StatsCard
          title="Total Bookings"
          value={loading ? '...' : (revenueData?.stats.bookingCount || 0).toString()}
          icon={Users}
          iconColor="#f59e0b"
          subtitle={`${revenueData?.stats.totalNights || 0} nights total`}
        />
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend Chart */}
        <div className="lg:col-span-2 admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Monthly Revenue Trend</h2>
              <p className="admin-card-subtitle">Revenue by month for {new Date().getFullYear()}</p>
            </div>
            <TrendingUp className="w-5 h-5 text-[#0d9488]" />
          </div>

          {loading ? (
            <div className="h-48 flex items-center justify-center">
              <div className="w-8 h-8 border-2 border-[#0d9488] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : displayChartData.length > 0 ? (
            <BarChart data={chartData} />
          ) : (
            <div className="h-48 flex items-center justify-center text-[#64748b]">
              No revenue data available for this period
            </div>
          )}

          {/* Chart Legend */}
          {!loading && displayChartData.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#e2e8f0]">
              <div className="flex flex-wrap gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gradient-to-t from-[#0d9488] to-[#14b8a6]" />
                  <span className="text-[#64748b]">Monthly Revenue</span>
                </div>
                <div className="text-[#64748b]">
                  Total: <span className="font-semibold text-[#1e293b]">
                    {formatCurrency(chartData.reduce((sum, m) => sum + m.revenue, 0))}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Quick Stats Sidebar */}
        <div className="admin-card">
          <div className="admin-card-header">
            <h2 className="admin-card-title">Performance Summary</h2>
          </div>

          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-[#f1f5f9] rounded animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-[#f0fdfb] rounded-xl border border-[#14b8a6]/20">
                <p className="text-sm text-[#0f766e] font-medium">Revenue</p>
                <p className="font-display text-xl font-bold text-[#0d9488]">
                  {formatCurrency(revenueData?.stats.totalRevenue || 0)}
                </p>
              </div>

              <div className="p-4 bg-[#eff6ff] rounded-xl border border-[#3b82f6]/20">
                <p className="text-sm text-[#1d4ed8] font-medium">Total Nights Booked</p>
                <p className="font-display text-xl font-bold text-[#3b82f6]">
                  {revenueData?.stats.totalNights || 0}
                </p>
              </div>

              <div className="p-4 bg-[#fef3c7] rounded-xl border border-[#f59e0b]/20">
                <p className="text-sm text-[#b45309] font-medium">Active Bookings</p>
                <p className="font-display text-xl font-bold text-[#f59e0b]">
                  {revenueData?.stats.bookingCount || 0}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Top Properties Table */}
      {!propertyId && (
        <div className="admin-card">
          <div className="admin-card-header">
            <div>
              <h2 className="admin-card-title">Property Performance</h2>
              <p className="admin-card-subtitle">Revenue breakdown by property</p>
            </div>
            <Building2 className="w-5 h-5 text-[#64748b]" />
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-16 bg-[#f1f5f9] rounded animate-pulse" />
              ))}
            </div>
          ) : revenueData?.propertyBreakdown && revenueData.propertyBreakdown.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#e2e8f0]">
                    <th className="px-4 py-3 text-left text-sm font-medium text-[#64748b]">Property</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#64748b]">Revenue</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#64748b]">Bookings</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#64748b]">Nights</th>
                    <th className="px-4 py-3 text-right text-sm font-medium text-[#64748b]">Occupancy</th>
                  </tr>
                </thead>
                <tbody>
                  {revenueData.propertyBreakdown.map((prop, index) => (
                    <tr
                      key={prop.propertyId}
                      className={`border-b border-[#f1f5f9] hover:bg-[#fafafa] ${
                        index === 0 ? 'bg-[#f0fdfb]' : ''
                      }`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#d4b896] to-[#b89b7a] flex items-center justify-center">
                            <span className="text-white font-bold text-xs">
                              {index + 1}
                            </span>
                          </div>
                          <span className="font-medium text-[#1e293b] truncate max-w-[200px]">
                            {prop.propertyName}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-[#0d9488]">
                        {formatCurrency(prop.revenue)}
                      </td>
                      <td className="px-4 py-3 text-right text-[#64748b]">
                        {prop.bookingCount}
                      </td>
                      <td className="px-4 py-3 text-right text-[#64748b]">
                        {prop.totalNights}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
                          prop.occupancyRate >= 70
                            ? 'bg-[#dcfce7] text-[#15803d]'
                            : prop.occupancyRate >= 40
                            ? 'bg-[#fef9c3] text-[#a16207]'
                            : 'bg-[#fee2e2] text-[#b91c1c]'
                        }`}>
                          {formatPercent(prop.occupancyRate)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8 text-[#64748b]">
              <Building2 className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No property revenue data available for this period</p>
            </div>
          )}
        </div>
      )}

      {/* Tips */}
      <div className="admin-card bg-[#f0fdfb] border-[#14b8a6]/20">
        <h3 className="font-medium text-[#0f766e] mb-2">Tips</h3>
        <ul className="text-sm text-[#115e59] space-y-1">
          <li>Revenue includes only paid and confirmed bookings</li>
          <li>Occupancy rate is calculated based on total available nights across all active properties</li>
          <li>Use the property filter to see individual property performance</li>
          <li>Custom date range allows you to analyze specific periods</li>
        </ul>
      </div>
    </div>
  );
}
