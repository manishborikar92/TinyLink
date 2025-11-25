'use client';

import { useState, useMemo } from 'react';
import { truncateUrl, formatDate } from '@/lib/utils';
import type { Link } from '@/lib/types';

interface LinksTableProps {
  links: Link[];
  onLinkDeleted: (code: string) => void;
  onRefresh: () => void;
}

type SortField = 'code' | 'clicks' | 'created_at';
type SortDirection = 'asc' | 'desc';

export default function LinksTable({ links, onLinkDeleted, onRefresh }: LinksTableProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null);
  const [deletingCode, setDeletingCode] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleCopy = (code: string) => {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || window.location.origin;
    const shortUrl = `${baseUrl}/${code}`;
    navigator.clipboard.writeText(shortUrl);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(null), 2000);
  };

  const handleDelete = async (code: string) => {
    if (!confirm(`Are you sure you want to delete the link "${code}"?`)) {
      return;
    }

    setDeletingCode(code);
    try {
      const res = await fetch(`/api/links/${code}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error('Failed to delete link');
      }

      onLinkDeleted(code);
    } catch (error) {
      alert('Failed to delete link. Please try again.');
    } finally {
      setDeletingCode(null);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle direction if clicking same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Default to descending for new field
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Filter and sort links
  const filteredAndSortedLinks = useMemo(() => {
    // Filter by search query
    let filtered = links.filter(link => {
      const query = searchQuery.toLowerCase();
      return (
        link.code.toLowerCase().includes(query) ||
        link.url.toLowerCase().includes(query)
      );
    });

    // Sort by selected field
    filtered.sort((a, b) => {
      let aValue: string | number;
      let bValue: string | number;

      if (sortField === 'code') {
        aValue = a.code.toLowerCase();
        bValue = b.code.toLowerCase();
      } else if (sortField === 'clicks') {
        aValue = a.clicks;
        bValue = b.clicks;
      } else {
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
      }

      if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return filtered;
  }, [links, searchQuery, sortField, sortDirection]);

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) {
      return (
        <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
        </svg>
      );
    }
    return sortDirection === 'asc' ? (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
      </svg>
    ) : (
      <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    );
  };

  if (links.length === 0) {
    return (
      <div className="mt-6 sm:mt-8 glass-panel rounded-2xl p-8 sm:p-12 text-center">
        <div className="text-zinc-400 dark:text-zinc-600 mb-4">
          <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
          </svg>
        </div>
        <h3 className="text-base sm:text-lg font-medium mb-2">No links yet</h3>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">Create your first short link to get started!</p>
      </div>
    );
  }

  return (
    <div className="mt-6 sm:mt-8 glass-panel rounded-2xl overflow-hidden">
      {/* Header with Search and Refresh */}
      <div className="px-4 sm:px-6 py-4 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4">
          <h2 className="text-base sm:text-lg font-semibold">Your Links</h2>
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="relative flex-1 sm:flex-initial">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full sm:w-64 px-4 py-2 pl-10 text-sm sm:text-base glass-subtle rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
                aria-label="Search by code or URL"
              />
              <svg
                className="absolute left-3 top-2.5 h-5 w-5 text-zinc-400 dark:text-zinc-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                aria-hidden="true"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <button
              onClick={onRefresh}
              className="text-sm sm:text-base text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium whitespace-nowrap px-2 py-2 min-h-[44px] focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
              aria-label="Refresh links"
            >
              Refresh
            </button>
          </div>
        </div>
        {searchQuery && (
          <div className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
            Found {filteredAndSortedLinks.length} of {links.length} links
          </div>
        )}
      </div>
      
      {/* No Results State */}
      {filteredAndSortedLinks.length === 0 ? (
        <div className="p-8 sm:p-12 text-center">
          <div className="text-zinc-400 dark:text-zinc-600 mb-4">
            <svg className="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <h3 className="text-base sm:text-lg font-medium mb-2">No results found</h3>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">Try adjusting your search query</p>
          <button
            onClick={() => setSearchQuery('')}
            className="mt-4 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium text-sm sm:text-base min-h-[44px] px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            Clear search
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View (hidden on mobile) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="min-w-full divide-y divide-zinc-200/50 dark:divide-zinc-700">
              <thead className="backdrop-blur-sm">
                <tr>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 select-none transition-colors"
                    onClick={() => handleSort('code')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSort('code')}
                  >
                    <div className="flex items-center gap-2">
                      Code
                      <SortIcon field="code" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Original URL
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 select-none transition-colors"
                    onClick={() => handleSort('clicks')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSort('clicks')}
                  >
                    <div className="flex items-center gap-2">
                      Clicks
                      <SortIcon field="clicks" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider cursor-pointer hover:bg-zinc-100/30 dark:hover:bg-zinc-800/30 select-none transition-colors"
                    onClick={() => handleSort('created_at')}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => e.key === 'Enter' && handleSort('created_at')}
                  >
                    <div className="flex items-center gap-2">
                      Created
                      <SortIcon field="created_at" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-zinc-600 dark:text-zinc-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200/50 dark:divide-zinc-700">
                {filteredAndSortedLinks.map((link) => (
                  <tr key={link.code} className="hover:bg-zinc-50/30 dark:hover:bg-zinc-800/30 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <a
                        href={`/code/${link.code}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                      >
                        {link.code}
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <a
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="hover:text-blue-600 dark:hover:text-blue-400 break-all focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                        title={link.url}
                      >
                        {truncateUrl(link.url, 60)}
                      </a>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {link.clicks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-500">
                      {formatDate(link.created_at)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleCopy(link.code)}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-900 dark:hover:text-blue-300 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 transition-colors"
                        aria-label={`Copy short link for ${link.code}`}
                      >
                        {copiedCode === link.code ? '✓ Copied' : 'Copy'}
                      </button>
                      <button
                        onClick={() => handleDelete(link.code)}
                        disabled={deletingCode === link.code}
                        className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 disabled:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg px-2 py-1 transition-colors"
                        aria-label={`Delete link ${link.code}`}
                      >
                        {deletingCode === link.code ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View (visible only on mobile) */}
          <div className="md:hidden divide-y divide-zinc-200 dark:divide-zinc-700">
            {filteredAndSortedLinks.map((link) => (
              <div key={link.code} className="p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30 transition-colors">
                {/* Code and Clicks Row */}
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <a
                      href={`/code/${link.code}`}
                      className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-mono font-semibold text-base focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                    >
                      {link.code}
                    </a>
                    <div className="text-xs text-zinc-500 mt-1">
                      {formatDate(link.created_at)}
                    </div>
                  </div>
                  <div className="text-right ml-4">
                    <div className="text-lg font-semibold">{link.clicks}</div>
                    <div className="text-xs text-zinc-500">clicks</div>
                  </div>
                </div>

                {/* URL */}
                <div className="mb-3">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm hover:text-blue-600 dark:hover:text-blue-400 break-all line-clamp-2 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded transition-colors"
                    title={link.url}
                  >
                    {truncateUrl(link.url, 80)}
                  </a>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <button
                    onClick={() => handleCopy(link.code)}
                    className="flex-1 px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 glass-subtle hover:bg-blue-100/50 dark:hover:bg-blue-900/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[44px] transition-all"
                    aria-label={`Copy short link for ${link.code}`}
                  >
                    {copiedCode === link.code ? '✓ Copied' : 'Copy Link'}
                  </button>
                  <button
                    onClick={() => handleDelete(link.code)}
                    disabled={deletingCode === link.code}
                    className="flex-1 px-4 py-2 text-sm font-medium text-red-600 dark:text-red-400 glass-subtle hover:bg-red-100/50 dark:hover:bg-red-900/30 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 disabled:text-zinc-400 min-h-[44px] transition-all"
                    aria-label={`Delete link ${link.code}`}
                  >
                    {deletingCode === link.code ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
