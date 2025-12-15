'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, RefreshCw, Play, AlertTriangle, CheckCircle, Clock, Database, Globe } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Stats {
  localStorage?: {
    totalPosts: number;
    publishedPosts: number;
    postsWithImages: number;
    targetPostFound: boolean;
  };
  supabase?: {
    totalPosts: number;
    targetPostFound: boolean;
    connectionOk: boolean;
  };
  blogPage?: {
    status: number;
    ok: boolean;
    statusText: string;
  };
}

interface LogEntry {
  id: number;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'warning';
  message: string;
  data: string | null;
}

export default function BlogMonitorPage() {
  const router = useRouter();
  const [monitoring, setMonitoring] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [stats, setStats] = useState<Stats>({});
  const [selectedSlug, setSelectedSlug] = useState('dinagyang');

  const addLog = (type: 'info' | 'success' | 'error' | 'warning', message: string, data?: any) => {
    const logEntry = {
      id: Date.now(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      data: data ? JSON.stringify(data, null, 2) : null
    };
    setLogs(prev => [logEntry, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  const runMonitoring = async () => {
    setMonitoring(true);
    setLogs([]);
    addLog('info', 'Starting comprehensive blog monitoring...', { slug: selectedSlug });

    try {
      // Step 1: Check localStorage
      addLog('info', 'Step 1: Checking localStorage...');
      const stored = localStorage.getItem('cozy_condo_blog_posts');
      const localPosts = stored ? JSON.parse(stored) : [];
      const targetPost = localPosts.find((p: any) => p.slug === selectedSlug);

      const localStats = {
        totalPosts: localPosts.length,
        publishedPosts: localPosts.filter((p: any) => p.published).length,
        postsWithImages: localPosts.filter((p: any) => p.featured_image).length,
        targetPostFound: !!targetPost
      };

      setStats(prev => ({ ...prev, localStorage: localStats }));

      if (targetPost) {
        const postSize = JSON.stringify(targetPost).length;
        const imageSize = targetPost.featured_image ? targetPost.featured_image.length : 0;

        addLog('success', `Target post found in localStorage`, {
          id: targetPost.id,
          title: targetPost.title,
          published: targetPost.published,
          postSizeKB: Math.round(postSize / 1024),
          imageSizeKB: Math.round(imageSize / 1024),
          imageType: targetPost.featured_image?.substring(0, 30) || 'None'
        });

        // Test sync capability
        addLog('info', 'Testing sync capability...');
        const canSync = postSize <= 10 * 1024 * 1024 && imageSize <= 5 * 1024 * 1024;
        addLog(canSync ? 'success' : 'warning', `Post ${canSync ? 'can' : 'cannot'} sync`, {
          postSizeOk: postSize <= 10 * 1024 * 1024,
          imageSizeOk: imageSize <= 5 * 1024 * 1024,
          limits: {
            maxPost: '10MB',
            maxImage: '5MB'
          }
        });

        // Step 2: Attempt sync
        if (canSync) {
          addLog('info', 'Step 2: Attempting sync to Supabase...');
          try {
            const syncResponse = await fetch('/api/blog/sync', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ posts: [targetPost] })
            });

            const syncResult = await syncResponse.json();

            if (syncResponse.ok && syncResult.results?.[0]?.success) {
              addLog('success', 'Sync completed successfully', syncResult.results[0]);
            } else {
              addLog('error', 'Sync failed', syncResult.results?.[0] || syncResult);
            }
          } catch (syncError: any) {
            addLog('error', 'Sync request failed', { error: syncError.message });
          }
        }

      } else {
        addLog('error', `Target post '${selectedSlug}' not found in localStorage`);
      }

      // Step 3: Check Supabase
      addLog('info', 'Step 3: Checking Supabase database...');
      try {
        const supabaseResponse = await fetch('/api/blog/debug?slug=' + selectedSlug);
        const supabaseData = await supabaseResponse.json();

        setStats(prev => ({
          ...prev,
          supabase: {
            totalPosts: supabaseData.supabase?.posts?.length || 0,
            targetPostFound: supabaseData.slugCheck?.found || false,
            connectionOk: supabaseData.supabase?.configured || false
          }
        }));

        if (supabaseData.slugCheck?.found) {
          addLog('success', 'Post found in Supabase', supabaseData.slugCheck.data);
        } else {
          addLog('warning', 'Post not found in Supabase', {
            error: supabaseData.slugCheck?.error,
            availableSlugs: supabaseData.supabase?.posts?.map((p: any) => p.slug) || []
          });
        }

      } catch (supabaseError: any) {
        addLog('error', 'Supabase check failed', { error: supabaseError.message });
      }

      // Step 4: Test getBlogPostBySlug function
      addLog('info', 'Step 4: Testing getBlogPostBySlug function...');
      try {
        const { getBlogPostBySlug } = await import('@/utils/blogStorageHybrid');
        const functionResult = await getBlogPostBySlug(selectedSlug);

        if (functionResult) {
          addLog('success', 'getBlogPostBySlug found the post', {
            id: functionResult.id,
            title: functionResult.title,
            published: functionResult.published,
            hasImage: !!functionResult.featured_image
          });
        } else {
          addLog('error', 'getBlogPostBySlug returned null');
        }

      } catch (functionError: any) {
        addLog('error', 'getBlogPostBySlug failed', { error: functionError.message });
      }

      // Step 5: Test blog page access
      addLog('info', 'Step 5: Testing blog page access...');
      try {
        const pageResponse = await fetch(`/blog/${selectedSlug}`);

        setStats(prev => ({
          ...prev,
          blogPage: {
            status: pageResponse.status,
            ok: pageResponse.ok,
            statusText: pageResponse.statusText
          }
        }));

        if (pageResponse.ok) {
          addLog('success', 'Blog page accessible', {
            status: pageResponse.status,
            contentType: pageResponse.headers.get('content-type')
          });
        } else {
          addLog('error', 'Blog page failed', {
            status: pageResponse.status,
            statusText: pageResponse.statusText
          });
        }

      } catch (pageError: any) {
        addLog('error', 'Page access failed', { error: pageError.message });
      }

      // Step 6: Test API routes
      addLog('info', 'Step 6: Testing API routes...');
      try {
        const apiResponse = await fetch(`/api/blog/slug/${selectedSlug}`);

        if (apiResponse.ok) {
          const apiData = await apiResponse.json();
          addLog('success', 'API route works', { id: apiData.id, title: apiData.title });
        } else {
          addLog('warning', 'API route failed', {
            status: apiResponse.status,
            statusText: apiResponse.statusText
          });
        }

      } catch (apiError: any) {
        addLog('error', 'API route test failed', { error: apiError.message });
      }

      addLog('info', 'Monitoring complete!');

    } catch (error: any) {
      addLog('error', 'Monitoring failed', { error: error.message });
    } finally {
      setMonitoring(false);
    }
  };

  const getLogIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error': return <AlertTriangle className="w-4 h-4 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Clock className="w-4 h-4 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.push('/admin/blog')}
            className="text-[#7d6349] hover:text-[#5f4a38] transition-colors mb-2"
          >
            <ArrowLeft className="w-4 h-4 inline mr-2" />
            Back to Blog
          </button>
          <h1 className="font-display text-2xl font-semibold text-[#5f4a38]">
            Blog Monitoring System
          </h1>
          <p className="text-[#7d6349] mt-1">
            Real-time monitoring and debugging for blog access pipeline
          </p>
        </div>
      </div>

      {/* Control Panel */}
      <div className="admin-card">
        <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
          Monitor Controls
        </h2>

        <div className="flex items-center gap-4 mb-4">
          <div>
            <label className="form-label">Target Blog Slug</label>
            <input
              type="text"
              value={selectedSlug}
              onChange={(e) => setSelectedSlug(e.target.value)}
              className="form-input w-48"
              placeholder="Enter blog slug..."
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={runMonitoring}
              disabled={monitoring || !selectedSlug}
              className="btn-primary flex items-center gap-2 disabled:opacity-50"
            >
              {monitoring ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Monitoring...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Start Monitor
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        {Object.keys(stats).length > 0 && (
          <div className="grid grid-cols-3 gap-4 p-4 bg-[#faf3e6] rounded-lg">
            <div className="text-center">
              <Database className="w-6 h-6 mx-auto mb-2 text-[#14b8a6]" />
              <div className="text-sm font-medium text-[#5f4a38]">localStorage</div>
              <div className="text-xs text-[#7d6349]">
                {stats.localStorage?.totalPosts || 0} posts
                {stats.localStorage?.targetPostFound && ' ✓'}
              </div>
            </div>

            <div className="text-center">
              <Database className="w-6 h-6 mx-auto mb-2 text-[#14b8a6]" />
              <div className="text-sm font-medium text-[#5f4a38]">Supabase</div>
              <div className="text-xs text-[#7d6349]">
                {stats.supabase?.totalPosts || 0} posts
                {stats.supabase?.targetPostFound && ' ✓'}
              </div>
            </div>

            <div className="text-center">
              <Globe className="w-6 h-6 mx-auto mb-2 text-[#14b8a6]" />
              <div className="text-sm font-medium text-[#5f4a38]">Blog Page</div>
              <div className="text-xs text-[#7d6349]">
                Status: {stats.blogPage?.status || 'Not tested'}
                {stats.blogPage?.ok && ' ✓'}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Logs */}
      <div className="admin-card">
        <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
          Monitoring Logs
        </h2>

        <div className="space-y-2 max-h-96 overflow-y-auto">
          {logs.length === 0 ? (
            <div className="text-center py-8 text-[#7d6349]">
              No logs yet. Click "Start Monitor" to begin tracking.
            </div>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="border border-[#faf3e6] rounded-lg p-3">
                <div className="flex items-start gap-3">
                  {getLogIcon(log.type)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-[#5f4a38]">
                        {log.message}
                      </span>
                      <span className="text-xs text-[#9a7d5e]">
                        {log.timestamp}
                      </span>
                    </div>
                    {log.data && (
                      <pre className="text-xs text-[#7d6349] mt-2 bg-gray-50 p-2 rounded overflow-x-auto">
                        {log.data}
                      </pre>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}