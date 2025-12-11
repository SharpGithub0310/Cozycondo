'use client';

import Link from 'next/link';
import { 
  Building2, 
  Calendar, 
  FileText, 
  Users, 
  TrendingUp, 
  ExternalLink,
  MessageCircle,
  Phone,
  Eye,
  ArrowRight
} from 'lucide-react';

// Quick stats data
const stats = [
  { name: 'Total Properties', value: '9', icon: Building2, href: '/admin/properties', color: 'bg-[#14b8a6]' },
  { name: 'Active Bookings', value: '—', icon: Calendar, href: '/admin/calendar', color: 'bg-[#fb923c]' },
  { name: 'Blog Posts', value: '5', icon: FileText, href: '/admin/blog', color: 'bg-[#1877F2]' },
  { name: 'This Month Views', value: '—', icon: Eye, href: '#', color: 'bg-[#9a7d5e]' },
];

// Quick actions
const quickActions = [
  { name: 'Add Property', href: '/admin/properties/new', icon: Building2 },
  { name: 'Block Dates', href: '/admin/calendar', icon: Calendar },
  { name: 'New Blog Post', href: '/admin/blog/new', icon: FileText },
  { name: 'Update Settings', href: '/admin/settings', icon: Users },
];

// Recent activities (placeholder)
const recentActivities = [
  { action: 'System initialized', time: 'Just now', type: 'system' },
  { action: 'Welcome to Cozy Condo Admin', time: 'Just now', type: 'info' },
];

export default function AdminDashboard() {
  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">Dashboard</h1>
        <p className="text-[#7d6349] mt-1">Welcome back! Here&apos;s an overview of your business.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Link
              key={stat.name}
              href={stat.href}
              className="admin-card hover:shadow-lg transition-shadow group"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-sm text-[#9a7d5e]">{stat.name}</p>
                  <p className="font-display text-3xl font-semibold text-[#5f4a38] mt-1">
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
            <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Quick Actions
            </h2>
            <div className="grid sm:grid-cols-2 gap-4">
              {quickActions.map((action) => {
                const Icon = action.icon;
                return (
                  <Link
                    key={action.name}
                    href={action.href}
                    className="flex items-center gap-3 p-4 rounded-xl bg-[#faf3e6] hover:bg-[#f5e6cc] transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-white flex items-center justify-center shadow-sm">
                      <Icon className="w-5 h-5 text-[#14b8a6]" />
                    </div>
                    <span className="font-medium text-[#5f4a38] group-hover:text-[#0d9488] transition-colors">
                      {action.name}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#9a7d5e] ml-auto group-hover:translate-x-1 transition-transform" />
                  </Link>
                );
              })}
            </div>
          </div>

          {/* External Links */}
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              External Links
            </h2>
            <div className="grid sm:grid-cols-3 gap-4">
              <a
                href="https://www.facebook.com/cozycondoiloilocity"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#1877F2] flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-medium text-[#5f4a38] block">Facebook</span>
                  <span className="text-xs text-[#9a7d5e]">View Page</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9a7d5e] ml-auto" />
              </a>

              <a
                href="https://airbnb.com"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#FF5A5F] flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-medium text-[#5f4a38] block">Airbnb</span>
                  <span className="text-xs text-[#9a7d5e]">Manage Listings</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9a7d5e] ml-auto" />
              </a>

              <a
                href="/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-4 rounded-xl border border-[#faf3e6] hover:border-[#14b8a6]/30 hover:shadow-md transition-all"
              >
                <div className="w-10 h-10 rounded-lg bg-[#14b8a6] flex items-center justify-center">
                  <Eye className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-medium text-[#5f4a38] block">Website</span>
                  <span className="text-xs text-[#9a7d5e]">View Live</span>
                </div>
                <ExternalLink className="w-4 h-4 text-[#9a7d5e] ml-auto" />
              </a>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Contact Info Card */}
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Contact Info
            </h2>
            <div className="space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Phone className="w-4 h-4 text-[#14b8a6]" />
                <span className="text-[#7d6349]">+63 977 887 0724</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <MessageCircle className="w-4 h-4 text-[#14b8a6]" />
                <span className="text-[#7d6349]">admin@cozycondo.net</span>
              </div>
            </div>
            <Link
              href="/admin/settings"
              className="inline-flex items-center gap-1 text-[#0d9488] text-sm font-medium mt-4 hover:underline"
            >
              Edit in Settings
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>

          {/* Recent Activity */}
          <div className="admin-card">
            <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
              Recent Activity
            </h2>
            <div className="space-y-3">
              {recentActivities.map((activity, index) => (
                <div
                  key={index}
                  className="flex items-start gap-3 text-sm"
                >
                  <div className={`w-2 h-2 rounded-full mt-1.5 ${
                    activity.type === 'system' ? 'bg-[#14b8a6]' : 'bg-[#fb923c]'
                  }`} />
                  <div>
                    <p className="text-[#5f4a38]">{activity.action}</p>
                    <p className="text-xs text-[#9a7d5e]">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Help Card */}
          <div className="admin-card bg-gradient-to-br from-[#14b8a6] to-[#0d9488] text-white">
            <h2 className="font-display text-lg font-semibold mb-2">
              Need Help?
            </h2>
            <p className="text-sm text-white/80 mb-4">
              This admin panel lets you manage your properties, calendar, blog posts, and site settings.
            </p>
            <div className="text-sm">
              <p className="font-medium mb-1">Quick Tips:</p>
              <ul className="text-white/80 space-y-1">
                <li>• Add iCal URLs to sync Airbnb bookings</li>
                <li>• Block dates manually in Calendar</li>
                <li>• Update contact info in Settings</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
