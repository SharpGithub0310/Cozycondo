'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { postMigrationDatabaseService } from '@/lib/post-migration-database-service';
import {
  LayoutDashboard,
  Building2,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  Globe,
  Bell,
  User,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [logoUrl, setLogoUrl] = useState('');
  const [settings, setSettings] = useState<any>(null);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    const initializeAdmin = async () => {
      try {
        // Check for admin session
        const adminSession = localStorage.getItem('cozy_admin_session');
        if (adminSession) {
          setIsAuthenticated(true);

          // Load website settings including logo
          try {
            const websiteSettings = await postMigrationDatabaseService.getWebsiteSettings();
            setSettings(websiteSettings);
            if (websiteSettings.logo) {
              setLogoUrl(websiteSettings.logo);
            }
          } catch (settingsError) {
            console.warn('Failed to load admin settings:', settingsError);
          }
        }
      } catch (error) {
        console.error('Failed to initialize admin:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAdmin();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cozy_admin_session');
    setIsAuthenticated(false);
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center animate-pulse shadow-lg">
            <span className="text-white font-display text-2xl font-bold">CC</span>
          </div>
          <p className="text-slate-600 font-medium">Loading admin panel...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="admin-layout">
      {/* Mobile sidebar overlay */}
      <div
        className={`admin-overlay ${sidebarOpen ? 'admin-overlay-open' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar - Now properly positioned */}
      <aside className={`admin-sidebar ${sidebarOpen ? 'admin-sidebar-open' : ''}`}>
        <div className="admin-sidebar-content">
          {/* Logo Section */}
          <div className="admin-sidebar-header">
            <Link href="/admin" className="admin-logo">
              <div className="admin-logo-icon">
                {logoUrl ? (
                  <img
                    src={logoUrl}
                    alt="Logo"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.currentTarget;
                      target.style.display = 'none';
                      const parent = target.parentElement;
                      if (parent) {
                        parent.innerHTML = '<span class="text-white font-display font-bold text-lg">CC</span>';
                      }
                    }}
                  />
                ) : (
                  <span className="text-white font-display font-bold text-lg">CC</span>
                )}
              </div>
              <div className="admin-logo-text">
                <span className="admin-logo-title">Admin Panel</span>
                <span className="admin-logo-subtitle">{settings?.companyName || 'Cozy Condo'}</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="admin-sidebar-close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="admin-nav">
            <div className="admin-nav-section">
              <span className="admin-nav-title">Main</span>
              <div className="admin-nav-items">
                {navigation.map((item) => {
                  const Icon = item.icon;
                  const isActive = pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href));
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`admin-nav-item ${isActive ? 'admin-nav-item-active' : ''}`}
                    >
                      <Icon className="w-5 h-5" />
                      <span>{item.name}</span>
                      {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                    </Link>
                  );
                })}
              </div>
            </div>
          </nav>

          {/* Sidebar Footer */}
          <div className="admin-sidebar-footer">
            <Link
              href="/"
              target="_blank"
              className="admin-sidebar-action"
            >
              <Globe className="w-5 h-5" />
              <span>View Website</span>
            </Link>
            <button
              onClick={handleLogout}
              className="admin-sidebar-action admin-sidebar-action-danger"
            >
              <LogOut className="w-5 h-5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content area - Fixed positioning */}
      <div className="admin-main">
        {/* Top bar */}
        <header className="admin-header">
          <div className="admin-header-content">
            <div className="admin-header-left">
              <button
                onClick={() => setSidebarOpen(true)}
                className="admin-menu-toggle"
              >
                <Menu className="w-6 h-6" />
              </button>
              <div className="admin-breadcrumb">
                <span className="admin-breadcrumb-item">
                  {navigation.find(item =>
                    pathname === item.href ||
                    (item.href !== '/admin' && pathname.startsWith(item.href))
                  )?.name || 'Dashboard'}
                </span>
              </div>
            </div>
            <div className="admin-header-right">
              <button className="admin-header-action">
                <Bell className="w-5 h-5" />
                <span className="admin-notification-badge">2</span>
              </button>
              <div className="admin-user-menu">
                <div className="admin-user-avatar">
                  <User className="w-4 h-4" />
                </div>
                <span className="admin-user-name">Admin</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="admin-content">
          {children}
        </main>
      </div>
    </div>
  );
}

// Login Form Component - Modernized Design
function LoginForm({ onLogin }: { onLogin: () => void }) {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simple password check (in production, use proper authentication)
    // Default password is "cozy2024" - change in production!
    const validPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'cozy2024';

    if (password === validPassword) {
      localStorage.setItem('cozy_admin_session', 'authenticated');
      onLogin();
    } else {
      setError('Invalid password');
    }
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/60 p-8 backdrop-blur-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center shadow-lg">
              <span className="text-white font-display text-3xl font-bold">CC</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-slate-800 mb-2">
              Admin Panel
            </h1>
            <p className="text-slate-600">Cozy Condo Management System</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-slate-700 mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl bg-slate-50 text-slate-800 placeholder-slate-400 focus:border-blue-500 focus:bg-white focus:outline-none transition-all duration-200"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Logging in...
                </div>
              ) : (
                'Access Admin Panel'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-200">
            <Link
              href="/"
              className="flex items-center justify-center gap-2 text-slate-600 hover:text-blue-600 transition-colors font-medium"
            >
              <Globe className="w-4 h-4" />
              Back to Website
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
