'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Building2,
  FileText,
  Users,
  TrendingUp,
  ExternalLink,
  MessageCircle,
  Phone,
  Eye,
  ArrowRight,
  Terminal,
  BarChart3
} from 'lucide-react';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import { SimpleAnalytics, type VisitorStats } from '@/lib/analytics';

// Stats interface
interface DashboardStats {
  totalProperties: number;
  blogPosts: number;
  visitorStats: VisitorStats;
}

// Initial stats state
const initialStats: DashboardStats = {
  totalProperties: 0,
  blogPosts: 0,
  visitorStats: { today: 0, thisWeek: 0, thisMonth: 0, total: 0 }
};

// Quick actions
const quickActions = [
  { name: 'Add Property', href: '/admin/properties/new', icon: Building2 },
  { name: 'New Blog Post', href: '/admin/blog/new', icon: FileText },
  { name: 'Update Settings', href: '/admin/settings', icon: Users },
  { name: 'Admin Console', href: '/admin/console', icon: Terminal },
];

// Recent activities (placeholder)
const recentActivities = [
  { action: 'System initialized', time: 'Just now', type: 'system' },
  { action: 'Welcome to Cozy Condo Admin', time: 'Just now', type: 'info' },
];

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>(initialStats);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        setIsLoading(true);

        // Fetch properties count
        const properties = await postMigrationDatabaseService.getProperties();
        const propertiesCount = Object.keys(properties).length;

        // Fetch blog posts count
        let blogCount = 0;
        try {
          const blogResponse = await fetch('/api/blog');
          if (blogResponse.ok) {
            const blogData = await blogResponse.json();
            // The API returns an array directly, not {posts: []}
            blogCount = Array.isArray(blogData) ? blogData.length : 0;
          }
        } catch (blogError) {
          console.warn('Could not fetch blog data:', blogError);
        }


        // Get website visitor statistics
        const visitorStats = SimpleAnalytics.getVisitorStats();

        setStats({
          totalProperties: propertiesCount,
          blogPosts: blogCount,
          visitorStats
        });
      } catch (error) {
        console.error('Error loading dashboard data:', error);
        // Still get visitor stats even if other data fails
        const visitorStats = SimpleAnalytics.getVisitorStats();
        setStats(prev => ({
          ...prev,
          visitorStats
        }));
      } finally {
        setIsLoading(false);
      }
    };

    // Initialize analytics tracking
    SimpleAnalytics.initialize();
    loadDashboardData();
  }, []);

  // Create dynamic stats array
  const statsArray = [
    {
      name: 'Total Properties',
      value: isLoading ? '...' : stats.totalProperties.toString(),
      icon: Building2,
      href: '/admin/properties',
      color: 'bg-[color:var(--color-primary-500)]'
    },
    {
      name: 'Blog Posts',
      value: isLoading ? '...' : stats.blogPosts.toString(),
      icon: FileText,
      href: '/admin/blog',
      color: 'bg-[#1877F2]'
    },
    {
      name: 'Today\'s Visitors',
      value: isLoading ? '...' : stats.visitorStats.today.toString(),
      icon: BarChart3,
      href: '/admin/console',
      color: 'bg-[color:var(--color-warm-600)]'
    },
  ];

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[color:var(--color-warm-900)]">Dashboard</h1>
        <p className="text-[color:var(--color-warm-700)] mt-1">Welcome back! Here&apos;s an overview of your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statsArray.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="admin-card hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[color:var(--color-warm-600)]">{stat.name}</p>
                  <p className="font-display text-3xl font-semibold text-[color:var(--color-warm-900)] mt-1">
                    {stat.value}
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-xl group-hover:scale-110 transition-transform`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Two Column Layout */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Quick Actions */}
        <div className="lg:col-span-2 space-y-6">
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[color:var(--color-warm-900)] mb-4">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[color:var(--color-warm-200)] hover:bg-[color:var(--color-warm-300)] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-[color:var(--color-primary-500)]" />
                    </div>
                    <span className="font-medium text-[color:var(--color-warm-900)] group-hover:text-[color:var(--color-primary-600)] transition-colors">
                      {action.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[color:var(--color-warm-600)] ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* External Links */}
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[color:var(--color-warm-900)] mb-4">
              External Links
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="https://www.facebook.com/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[color:var(--color-warm-200)] hover:border-[color:var(--color-primary-500)]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-medium text-[color:var(--color-warm-900)] block">Facebook</span>
                  <span className="text-xs text-[color:var(--color-warm-600)]">View Page</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[color:var(--color-warm-600)] ml-auto" />
              </a>

              <a
                href="https://airbnb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[color:var(--color-warm-200)] hover:border-[color:var(--color-primary-500)]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FF5A5F] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-medium text-[color:var(--color-warm-900)] block">Airbnb</span>
                  <span className="text-xs text-[color:var(--color-warm-600)]">Manage Listings</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[color:var(--color-warm-600)] ml-auto" />
              </a>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[color:var(--color-warm-200)] hover:border-[color:var(--color-primary-500)]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[color:var(--color-primary-500)] flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-medium text-[color:var(--color-warm-900)] block">Website</span>
                  <span className="text-xs text-[color:var(--color-warm-600)]">View Live</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[color:var(--color-warm-600)] ml-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[color:var(--color-warm-900)] mb-4">
              Contact Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[color:var(--color-primary-500)]" />
                <span className="text-[color:var(--color-warm-700)]">+63 977 887 0724</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-[color:var(--color-primary-500)]" />
                <span className="text-[color:var(--color-warm-700)]">admin@cozycondo.net</span>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 text-[color:var(--color-primary-600)] text-sm font-medium mt-4 hover:underline"
            >
              Edit in Settings
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[color:var(--color-warm-900)] mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    activity.type === 'system' ? 'bg-[color:var(--color-primary-500)]' : 'bg-[color:var(--color-accent-orange)]'
                  }`} />
                  <div>
                    <p className="text-[color:var(--color-warm-900)]">{activity.action}</p>
                    <p className="text-xs text-[color:var(--color-warm-600)]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="admin-card bg-gradient-to-br from-[color:var(--color-primary-500)] to-[color:var(--color-primary-600)] text-white">
            <h2 className="font-display text-lg font-semibold mb-2">
              Need Help?
            </h2>
            <p className="text-sm text-white/80 mb-4">
              This admin panel lets you manage your properties, blog posts, and site settings.
            </p>
            <div className="text-sm">
              <p className="font-medium mb-1">Quick Tips:</p>
              <ul className="text-white/80 space-y-1">
                <li>• Upload high-quality property photos</li>
                <li>• Manage property amenities and photos</li>
                <li>• Update contact info in Settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
