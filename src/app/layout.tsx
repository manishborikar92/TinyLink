'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import AmbientBackground from '@/components/AmbientBackground';
import Navigation from '@/components/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TinyLink - URL Shortener</title>
        <meta name="description" content="Shorten URLs and track click statistics" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AmbientBackground />
          <div className="relative min-h-screen flex flex-col">
            {/* Global Navigation */}
            <header className="sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Navigation />
              </div>
            </header>
            
            {/* Page Content */}
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
