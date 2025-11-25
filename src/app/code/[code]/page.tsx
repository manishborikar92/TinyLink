'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';
import type { Link as LinkType } from '@/lib/types';

export default function StatsPage() {
  const params = useParams();
  const code = params.code as string;
  
  const [link, setLink] = useState<LinkType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    const fetchLink = async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/links/${code}`);
        
        if (!res.ok) {
          throw new Error('Link not found');
        }
        
        const data = await res.json();
        setLink(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchLink();
  }, [code]);

  const handleCopy = () => {
    const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">{error || 'Link not found'}</p>
          <Link 
            href="/"
            className="text-blue-600 hover:text-blue-700 font-medium"
          >
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Back Link */}
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded px-2 py-1 text-sm sm:text-base"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>

        {/* Link Details Card */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 lg:p-8 mb-6">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
            Link Statistics
          </h1>

          <div className="space-y-4 sm:space-y-5">
            {/* Short URL */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Short URL
              </label>
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                <code className="flex-1 px-3 py-3 bg-gray-50 rounded-lg border text-blue-600 text-sm sm:text-base break-all">
                  {shortUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium text-sm sm:text-base min-h-[48px] whitespace-nowrap"
                  aria-label="Copy short URL to clipboard"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            {/* Original URL */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-500 mb-2">
                Original URL
              </label>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-3 bg-gray-50 rounded-lg border text-blue-600 hover:text-blue-700 break-all text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
              >
                {link.url}
              </a>
            </div>
          </div>
        </div>

        {/* Statistics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {/* Total Clicks */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center sm:text-left">
            <div className="text-4xl sm:text-5xl font-bold text-blue-600 mb-2">
              {link.clicks}
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-medium">Total Clicks</div>
          </div>

          {/* Created Date */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center sm:text-left">
            <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {formatDate(link.created_at)}
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-medium">Created</div>
          </div>

          {/* Last Clicked */}
          <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 text-center sm:text-left sm:col-span-2 lg:col-span-1">
            <div className="text-base sm:text-lg font-semibold text-gray-900 mb-2">
              {formatDate(link.last_clicked)}
            </div>
            <div className="text-sm sm:text-base text-gray-600 font-medium">Last Clicked</div>
          </div>
        </div>
      </main>
    </div>
  );
}
