import Link from 'next/link';
import { Home, Search, ArrowLeft } from 'lucide-react';

export default function PropertyNotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-red-100 rounded-full mb-4">
            <Search className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Property Not Found
          </h1>
          <p className="text-gray-600">
            Sorry, we couldn't find the property you're looking for.
            It may have been removed or the link might be incorrect.
          </p>
        </div>

        <div className="space-y-4">
          <Link
            href="/properties"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-[#0d9488] text-white rounded-lg hover:bg-[#0a7e74] transition-colors gap-2"
          >
            <Search className="w-5 h-5" />
            Browse All Properties
          </Link>

          <Link
            href="/"
            className="inline-flex items-center justify-center w-full px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors gap-2"
          >
            <Home className="w-5 h-5" />
            Go to Homepage
          </Link>

          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center justify-center w-full px-6 py-3 text-gray-600 hover:text-gray-900 transition-colors gap-2"
          >
            <ArrowLeft className="w-5 h-5" />
            Go Back
          </button>
        </div>

        <div className="mt-8 pt-8 border-t border-gray-200">
          <p className="text-sm text-gray-500">
            Need help? <Link href="/contact" className="text-[#0d9488] hover:underline">Contact us</Link>
          </p>
        </div>
      </div>
    </div>
  );
}