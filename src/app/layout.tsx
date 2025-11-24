import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'TinyLink - URL Shortener',
  description: 'Shorten URLs and track click statistics',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <nav className="bg-blue-600 text-white shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <a href="/" className="text-2xl font-bold hover:text-blue-100 transition">
                🔗 TinyLink
              </a>
              <a 
                href="/api/healthz" 
                target="_blank"
                className="text-sm hover:text-blue-100 transition"
              >
                Status
              </a>
            </div>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
