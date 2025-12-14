'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Building2,
  Calendar,
  FileText,
  Settings,
  LogOut,
  Menu,
  X,
  ChevronRight,
  HardDrive,
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { name: 'Properties', href: '/admin/properties', icon: Building2 },
  { name: 'Calendar', href: '/admin/calendar', icon: Calendar },
  { name: 'Blog', href: '/admin/blog', icon: FileText },
  { name: 'Settings', href: '/admin/settings', icon: Settings },
  { name: 'Storage', href: '/admin/storage', icon: HardDrive },
];

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    // Check for admin session
    const adminSession = localStorage.getItem('cozy_admin_session');
    if (adminSession) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('cozy_admin_session');
    setIsAuthenticated(false);
    router.push('/admin');
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fefdfb] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-[#14b8a6] flex items-center justify-center animate-pulse">
            <span className="text-white font-display text-xl font-bold">CC</span>
          </div>
          <p className="text-[#7d6349]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginForm onLogin={() => setIsAuthenticated(true)} />;
  }

  return (
    <div className="min-h-screen bg-[#fefdfb]">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#5f4a38] transform transition-transform duration-300 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-20 px-6 border-b border-[#7d6349]">
            <Link href="/admin" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
                <span className="text-white font-display font-bold">CC</span>
              </div>
              <div>
                <span className="font-display text-lg font-semibold text-white">Admin</span>
                <span className="block text-xs text-[#d4b896]">Cozy Condo</span>
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-[#d4b896] hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {navigation.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href || 
                (item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-[#14b8a6] text-white'
                      : 'text-[#d4b896] hover:bg-[#7d6349] hover:text-white'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="font-medium">{item.name}</span>
                  {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="p-4 border-t border-[#7d6349]">
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-[#d4b896] hover:bg-[#7d6349] hover:text-white transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Logout</span>
            </button>
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 mt-2 px-4 py-3 rounded-lg text-[#d4b896] hover:bg-[#7d6349] hover:text-white transition-colors text-sm"
            >
              <span>View Website →</span>
            </Link>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:ml-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-[#faf3e6]">
          <div className="flex items-center justify-between h-16 px-4 sm:px-6 lg:px-8">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-[#7d6349] hover:text-[#5f4a38]"
            >
              <Menu className="w-6 h-6" />
            </button>
            <div className="flex items-center gap-4 ml-auto">
              <span className="text-sm text-[#7d6349]">Welcome, Admin</span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

// Login Form Component
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
    <div className="min-h-screen bg-gradient-to-br from-[#fefdfb] via-[#fdf9f3] to-[#f5e6cc] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 mx-auto mb-4 rounded-xl bg-gradient-to-br from-[#14b8a6] to-[#0d9488] flex items-center justify-center">
              <span className="text-white font-display text-2xl font-bold">CC</span>
            </div>
            <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">
              Admin Login
            </h1>
            <p className="text-[#9a7d5e] mt-1">Cozy Condo Management</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="password" className="form-label">
                Password
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Enter admin password"
                required
              />
            </div>

            {error && (
              <div className="p-3 rounded-lg bg-red-50 text-red-600 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-primary py-3 disabled:opacity-50"
            >
              {isLoading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="text-center text-sm text-[#9a7d5e] mt-6">
            <Link href="/" className="text-[#0d9488] hover:underline">
              ← Back to Website
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
