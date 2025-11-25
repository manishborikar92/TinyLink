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
      <div className="flex items-center justify-center py-20">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">Loading link details...</p>
        </div>
      </div>
    );
  }

  if (error || !link) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center glass-panel rounded-2xl p-8 sm:p-12">
          <div className="text-6xl mb-4">🔗</div>
          <h1 className="text-3xl sm:text-4xl font-bold mb-4">Link Not Found</h1>
          <p className="text-zinc-600 dark:text-zinc-400 mb-8 text-sm sm:text-base">
            {error || 'The link you\'re looking for doesn\'t exist or has been deleted.'}
          </p>
          <Link 
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-medium shadow-lg"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const shortUrl = `${process.env.NEXT_PUBLIC_BASE_URL || window.location.origin}/${code}`;

  return (
    <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
      {/* Breadcrumb Navigation */}
      <nav className="mb-6 sm:mb-8" aria-label="Breadcrumb">
        <Link 
          href="/"
          className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-3 py-2 text-sm sm:text-base transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30"
        >
          <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      {/* Page Header */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          Link Statistics
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          View detailed analytics for your shortened link
        </p>
      </div>

      {/* Link Details Card */}
      <div className="glass-panel rounded-2xl p-4 sm:p-6 lg:p-8 mb-6 sm:mb-8">

        <div className="space-y-5 sm:space-y-6">
          {/* Short URL */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Short URL
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <code className="flex-1 px-4 py-3.5 glass-subtle rounded-xl text-blue-600 dark:text-blue-400 text-sm sm:text-base break-all font-medium">
                {shortUrl}
              </code>
              <button
                onClick={handleCopy}
                className="px-6 py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 font-semibold text-sm sm:text-base min-h-[48px] whitespace-nowrap shadow-lg hover:shadow-xl active:scale-95"
                aria-label="Copy short URL to clipboard"
              >
                {copied ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Copied!
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-2">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Copy
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Original URL */}
          <div>
            <label className="block text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-3">
              Original URL
            </label>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
              className="group block px-4 py-3.5 glass-subtle rounded-xl text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 break-all text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30"
            >
              <span className="inline-flex items-start gap-2">
                <svg className="w-5 h-5 flex-shrink-0 mt-0.5 group-hover:translate-x-0.5 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span className="break-all">{link.url}</span>
              </span>
            </a>
          </div>
        </div>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {/* Total Clicks */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
              <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
            </div>
          </div>
          <div className="text-4xl sm:text-5xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {link.clicks.toLocaleString()}
          </div>
          <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">Total Clicks</div>
        </div>

        {/* Created Date */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-xl">
              <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-semibold mb-2">
            {formatDate(link.created_at)}
          </div>
          <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">Created</div>
        </div>

        {/* Last Clicked */}
        <div className="glass-panel rounded-2xl p-6 sm:p-8 sm:col-span-2 lg:col-span-1 hover:scale-105 transition-transform">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
              <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="text-lg sm:text-xl font-semibold mb-2">
            {formatDate(link.last_clicked)}
          </div>
          <div className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-medium">Last Clicked</div>
        </div>
      </div>
    </main>
  );
}
