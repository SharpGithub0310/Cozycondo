'use client';

import { useState } from 'react';
import { syncLocalStorageToSupabase } from '@/utils/syncLocalStorageToSupabase';
import { ArrowLeft, RefreshCw, Upload, CheckCircle, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function BlogSyncPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [syncResult, setSyncResult] = useState<any>(null);
  const [localPosts, setLocalPosts] = useState<any[]>([]);

  // Load localStorage posts on mount
  useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cozy_condo_blog_posts');
      if (stored) {
        try {
          const posts = JSON.parse(stored);
          setLocalPosts(posts);
        } catch (error) {
          console.error('Error parsing localStorage posts:', error);
        }
      }
    }
  });

  const handleSync = async () => {
    setIsLoading(true);
    setSyncResult(null);

    try {
      const result = await syncLocalStorageToSupabase();
      setSyncResult(result);
    } catch (error) {
      setSyncResult({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const checkLocalStorage = () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('cozy_condo_blog_posts');
      if (stored) {
        try {
          const posts = JSON.parse(stored);
          setLocalPosts(posts);
        } catch (error) {
          console.error('Error parsing localStorage posts:', error);
        }
      }
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
            Blog Sync Tool
          </h1>
          <p className="text-[#7d6349] mt-1">
            Manually sync localStorage blog posts to Supabase
          </p>
        </div>
      </div>

      {/* Local Storage Posts */}
      <div className="admin-card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-lg font-semibold text-[#5f4a38]">
            Local Storage Posts
          </h2>
          <button
            onClick={checkLocalStorage}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        {localPosts.length === 0 ? (
          <p className="text-[#7d6349]">No posts found in localStorage</p>
        ) : (
          <div className="space-y-3">
            {localPosts.map((post) => (
              <div
                key={post.id}
                className="flex items-center justify-between p-4 border border-[#faf3e6] rounded-lg"
              >
                <div className="flex-1">
                  <h3 className="font-medium text-[#5f4a38]">{post.title}</h3>
                  <div className="flex items-center gap-4 text-sm text-[#7d6349] mt-1">
                    <span>Slug: {post.slug}</span>
                    <span>Published: {post.published ? 'Yes' : 'No'}</span>
                    {post.featured_image && (
                      <span>
                        Image: {post.featured_image.startsWith('data:')
                          ? `Base64 (${Math.round(post.featured_image.length / 1024)}KB)`
                          : 'URL'
                        }
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Sync Action */}
      <div className="admin-card">
        <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
          Sync to Supabase
        </h2>

        <div className="space-y-4">
          <p className="text-[#7d6349]">
            This will sync all localStorage posts to Supabase. Large images will be
            automatically stripped to prevent server errors.
          </p>

          <button
            onClick={handleSync}
            disabled={isLoading || localPosts.length === 0}
            className="btn-primary flex items-center gap-2 disabled:opacity-50"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4" />
                Sync to Supabase
              </>
            )}
          </button>
        </div>

        {/* Sync Result */}
        {syncResult && (
          <div className="mt-6 p-4 border border-[#faf3e6] rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              {syncResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <XCircle className="w-5 h-5 text-red-500" />
              )}
              <h3 className="font-medium text-[#5f4a38]">Sync Result</h3>
            </div>

            <p className="text-[#7d6349] mb-3">{syncResult.message}</p>

            {syncResult.results && (
              <div className="space-y-2">
                {syncResult.results.results.map((result: any, index: number) => (
                  <div
                    key={index}
                    className={`flex items-center gap-2 text-sm ${
                      result.success ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    {result.success ? (
                      <CheckCircle className="w-4 h-4" />
                    ) : (
                      <XCircle className="w-4 h-4" />
                    )}
                    <span>
                      {result.slug}: {result.success ? 'Synced successfully' : result.error}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Debug Info */}
      <div className="admin-card">
        <h2 className="font-display text-lg font-semibold text-[#5f4a38] mb-4">
          Debug Information
        </h2>

        <div className="space-y-3 text-sm">
          <div>
            <span className="font-medium text-[#5f4a38]">Total Local Posts:</span>
            <span className="text-[#7d6349] ml-2">{localPosts.length}</span>
          </div>

          <div>
            <span className="font-medium text-[#5f4a38]">Published Posts:</span>
            <span className="text-[#7d6349] ml-2">
              {localPosts.filter(p => p.published).length}
            </span>
          </div>

          <div>
            <span className="font-medium text-[#5f4a38]">Posts with Images:</span>
            <span className="text-[#7d6349] ml-2">
              {localPosts.filter(p => p.featured_image).length}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}