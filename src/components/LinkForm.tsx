'use client';

import { useState } from 'react';
import type { CreateLinkResponse } from '@/lib/types';

interface LinkFormProps {
  onLinkCreated: (link: CreateLinkResponse) => void;
}

export default function LinkForm({ onLinkCreated }: LinkFormProps) {
  const [url, setUrl] = useState('');
  const [customCode, setCustomCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await fetch('/api/links', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, customCode: customCode || undefined }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Failed to create link');
        return;
      }

      setSuccess(`Link created! ${data.shortUrl}`);
      setUrl('');
      setCustomCode('');
      onLinkCreated(data);

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 lg:p-8">
      <h2 className="text-lg sm:text-xl font-bold mb-4 sm:mb-6">
        Create Short Link
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
        {/* URL Input */}
        <div>
          <label 
            htmlFor="url" 
            className="block text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Original URL *
          </label>
          <input
            type="url"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com/very/long/url"
            required
            disabled={loading}
            className="w-full px-4 py-3 text-base glass-subtle rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            aria-required="true"
            aria-invalid={error ? 'true' : 'false'}
          />
        </div>

        {/* Custom Code Input */}
        <div>
          <label 
            htmlFor="customCode" 
            className="block text-sm sm:text-base font-medium text-zinc-700 dark:text-zinc-300 mb-2"
          >
            Custom Code (optional)
          </label>
          <input
            type="text"
            id="customCode"
            value={customCode}
            onChange={(e) => setCustomCode(e.target.value)}
            placeholder="mycode (6-8 alphanumeric)"
            pattern="[A-Za-z0-9]{6,8}"
            disabled={loading}
            className="w-full px-4 py-3 text-base glass-subtle rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
            aria-describedby="customCode-help"
          />
          <p id="customCode-help" className="mt-2 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Leave empty to generate a random code
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div 
            className="p-3 sm:p-4 glass-panel rounded-xl border-red-300 dark:border-red-800"
            role="alert"
            aria-live="polite"
          >
            <p className="text-sm sm:text-base text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div 
            className="p-3 sm:p-4 glass-panel rounded-xl border-green-300 dark:border-green-800"
            role="status"
            aria-live="polite"
          >
            <p className="text-sm sm:text-base text-green-700 dark:text-green-400">✓ {success}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full px-6 py-3 sm:py-4 text-base sm:text-lg bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all min-h-[48px] shadow-lg"
          aria-busy={loading}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span 
                className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"
                aria-hidden="true"
              ></span>
              Creating...
            </span>
          ) : (
            'Create Short Link'
          )}
        </button>
      </form>
    </div>
  );
}
