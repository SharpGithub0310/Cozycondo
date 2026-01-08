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
  BarChart3,
  HelpCircle
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
    <div className="admin-dashboard">
      {/* Page Header */}
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Dashboard</h1>
          <p className="admin-page-subtitle">Welcome back! Here's an overview of your business performance.</p>
        </div>
        <div className="admin-page-actions">
          <Link href="/admin/properties/new" className="admin-btn admin-btn-primary">
            <Building2 className="w-4 h-4" />
            Add Property
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="admin-stats-grid">
        {statsArray.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="admin-stat-card"
            >
              <div className="admin-stat-content">
                <div className="admin-stat-info">
                  <p className="admin-stat-label">{stat.name}</p>
                  <p className="admin-stat-value">
                    {stat.value}
                  </p>
                  <div className="admin-stat-change">
                    <TrendingUp className="w-3 h-3" />
                    <span>+12% from last month</span>
                  </div>
                </div>
                <div className="admin-stat-icon" style={{ background: stat.color }}>
                  <Icon className="w-6 h-6" />
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      {/* Dashboard Grid Layout */}
      <div className="admin-dashboard-grid">
        {/* Quick Actions */}
        <div className="admin-dashboard-main">
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Quick Actions</h2>
              <p className="admin-card-subtitle">Common tasks and shortcuts</p>
            </div>
            <div className="admin-quick-actions">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="admin-quick-action"
                  >
                    <div className="admin-quick-action-icon">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="admin-quick-action-content">
                      <span className="admin-quick-action-title">{action.name}</span>
                      <span className="admin-quick-action-desc">
                        {action.name === 'Add Property' && 'Create new rental listing'}
                        {action.name === 'New Blog Post' && 'Write and publish content'}
                        {action.name === 'Update Settings' && 'Configure site options'}
                        {action.name === 'Admin Console' && 'System management'}
                      </span>
                    </div>
                    <ArrowRight className="w-4 h-4 admin-quick-action-arrow" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Recent Activity</h2>
              <p className="admin-card-subtitle">Latest system events and changes</p>
            </div>
            <div className="admin-activity-list">
              {recentActivities.map((activity, index) => (
                <div key={index} className="admin-activity-item">
                  <div className={`admin-activity-dot ${activity.type === 'system' ? 'admin-activity-dot-blue' : 'admin-activity-dot-green'}`} />
                  <div className="admin-activity-content">
                    <p className="admin-activity-text">{activity.action}</p>
                    <p className="admin-activity-time">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dashboard Sidebar */}
        <div className="admin-dashboard-sidebar">
          {/* External Links */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Quick Links</h2>
              <p className="admin-card-subtitle">External platforms and tools</p>
            </div>
            <div className="admin-external-links">
              <a
                href="https://www.facebook.com/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-external-link"
              >
                <div className="admin-external-icon" style={{ backgroundColor: '#1877F2' }}>
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div className="admin-external-content">
                  <span className="admin-external-title">Facebook</span>
                  <span className="admin-external-desc">Manage social media</span>
                </div>
                <ExternalLink className="w-4 h-4 admin-external-arrow" />
              </a>

              <a
                href="https://airbnb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-external-link"
              >
                <div className="admin-external-icon" style={{ backgroundColor: '#FF5A5F' }}>
                  <Building2 className="w-4 h-4" />
                </div>
                <div className="admin-external-content">
                  <span className="admin-external-title">Airbnb</span>
                  <span className="admin-external-desc">Manage listings</span>
                </div>
                <ExternalLink className="w-4 h-4 admin-external-arrow" />
              </a>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="admin-external-link"
              >
                <div className="admin-external-icon" style={{ backgroundColor: '#3b82f6' }}>
                  <Eye className="w-4 h-4" />
                </div>
                <div className="admin-external-content">
                  <span className="admin-external-title">Live Website</span>
                  <span className="admin-external-desc">View public site</span>
                </div>
                <ExternalLink className="w-4 h-4 admin-external-arrow" />
              </a>
            </div>
          </div>

          {/* Contact Info */}
          <div className="admin-card">
            <div className="admin-card-header">
              <h2 className="admin-card-title">Contact Information</h2>
              <Link href="/admin/settings" className="admin-card-action">
                Edit Settings
                <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <div className="admin-contact-info">
              <div className="admin-contact-item">
                <Phone className="w-4 h-4" />
                <span>+63 977 887 0724</span>
              </div>
              <div className="admin-contact-item">
                <MessageCircle className="w-4 h-4" />
                <span>admin@cozycondo.net</span>
              </div>
            </div>
          </div>

          {/* Help Card */}
          <div className="admin-help-card">
            <div className="admin-help-header">
              <HelpCircle className="w-6 h-6" />
              <h3 className="admin-help-title">Getting Started</h3>
            </div>
            <p className="admin-help-text">
              Welcome to your admin panel! Manage properties, create content, and configure settings.
            </p>
            <ul className="admin-help-list">
              <li>Add property listings with photos</li>
              <li>Create engaging blog content</li>
              <li>Update site settings and contact info</li>
              <li>Monitor visitor analytics</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
