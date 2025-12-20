import AdminSettingsDebug from '@/debug/admin-settings-debug';

export default function DebugSettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <AdminSettingsDebug />
      </div>
    </div>
  );
}