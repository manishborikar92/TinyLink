'use client';

import { useState, useEffect } from 'react';
import Navigation from '@/components/Navigation';
import LinkForm from '@/components/LinkForm';
import LinksTable from '@/components/LinksTable';
import type { Link, CreateLinkResponse } from '@/lib/types';

export default function Dashboard() {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/links');
      
      if (!res.ok) {
        throw new Error('Failed to fetch links');
      }
      
      const data = await res.json();
      setLinks(data.links || []);
    } catch (err) {
      setError('Failed to load links. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleLinkCreated = (newLink: CreateLinkResponse) => {
    // Refresh the list to get the complete link data
    fetchLinks();
  };

  const handleLinkDeleted = (code: string) => {
    setLinks(links.filter(link => link.code !== code));
  };

  return (
    <>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        
        {/* Navigation Bar - Mobile and Desktop  */}
        <Navigation />

        {/* Header */}
        <div className="my-6 sm:my-8">
        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2">
          URL Shortener Dashboard
        </h1>
        <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
          Create short links and track their performance
        </p>
      </div>

      {/* Link Form */}
      <LinkForm onLinkCreated={handleLinkCreated} />

      {/* Error Message */}
      {error && (
        <div className="mt-4 sm:mt-6 p-4 glass-panel rounded-xl border-red-300 dark:border-red-800">
          <p className="text-sm sm:text-base text-red-700 dark:text-red-400">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading ? (
        <div className="mt-6 sm:mt-8 flex flex-col items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" aria-label="Loading"></div>
          <p className="mt-4 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">Loading links...</p>
        </div>
      ) : (
        <LinksTable 
          links={links} 
          onLinkDeleted={handleLinkDeleted}
          onRefresh={fetchLinks}
        />
      )}
      </main>
    </>
  );
}
