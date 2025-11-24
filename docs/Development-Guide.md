# TinyLink Development Guide

## Project Setup

### Create Next.js Project

```bash
# Create Next.js project with TypeScript and Tailwind CSS
npx create-next-app@latest tinylink

# When prompted, select:
# ✓ TypeScript? → Yes (recommended) or No
# ✓ ESLint? → Yes
# ✓ Tailwind CSS? → Yes
# ✓ src/ directory? → No
# ✓ App Router? → Yes
# ✓ Customize default import alias? → No

cd tinylink

# Install PostgreSQL client
npm install pg
```

---

## Database Setup (Neon PostgreSQL)

### 1. Create Neon Account
1. Go to https://neon.tech
2. Sign up with GitHub (free tier)
3. Create new project: "tinylink"
4. Select region closest to you
5. Copy connection string from dashboard

### 2. Database Schema

Run this SQL in Neon's SQL Editor:

```sql
-- Create links table
CREATE TABLE links (
  id SERIAL PRIMARY KEY,
  code VARCHAR(8) UNIQUE NOT NULL,
  url TEXT NOT NULL,
  clicks INTEGER DEFAULT 0,
  last_clicked TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for faster lookups
CREATE INDEX idx_code ON links(code);
CREATE INDEX idx_created_at ON links(created_at DESC);
```

### 3. Environment Variables

Create `.env.local`:
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env.example`:
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database
NEXT_PUBLIC_BASE_URL=https://yourapp.vercel.app
NODE_ENV=production
```

**Important:** Add `.env.local` to `.gitignore` (should be there by default)

---

## Project Structure

```
tinylink/
├── app/
│   ├── api/
│   │   ├── links/
│   │   │   ├── route.js          # GET, POST /api/links
│   │   │   └── [code]/
│   │   │       └── route.js      # GET, DELETE /api/links/:code
│   │   └── healthz/
│   │       └── route.js          # GET /healthz
│   ├── code/
│   │   └── [code]/
│   │       └── page.js           # Stats page for /:code
│   ├── [code]/
│   │   └── route.js              # Redirect handler GET /:code
│   ├── page.js                   # Dashboard (homepage)
│   ├── layout.js                 # Root layout
│   └── globals.css               # Global styles with Tailwind
├── components/
│   ├── LinkForm.js               # Form to create links
│   ├── LinksTable.js             # Table to display all links
│   └── Header.js                 # Navigation header
├── lib/
│   ├── db.js                     # Database connection pool
│   └── utils.js                  # Helper functions
├── .env.local                    # Local environment variables
├── .env.example                  # Example environment variables
├── .gitignore
├── next.config.js
├── package.json
├── README.md
└── tailwind.config.js
```

---

## Database Connection

### lib/db.js

```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  },
  // Connection pool settings
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

// Test connection on startup
pool.on('connect', () => {
  console.log('✓ Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database connection error:', err);
  process.exit(-1);
});

export default pool;
```

---

## Utility Functions

### lib/utils.js

```javascript
/**
 * Generate a random alphanumeric code
 * @param {number} length - Length of code (default: 6)
 * @returns {string} Random code
 */
export function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

/**
 * Validate custom code format
 * @param {string} code - Code to validate
 * @returns {boolean} True if valid
 */
export function validateCode(code) {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

/**
 * Validate URL format
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid HTTP/HTTPS URL
 */
export function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Truncate long URLs for display
 * @param {string} url - URL to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated URL
 */
export function truncateUrl(url, maxLength = 50) {
  return url.length > maxLength ? url.substring(0, maxLength) + '...' : url;
}

/**
 * Format date for display
 * @param {string} dateString - ISO date string
 * @returns {string} Formatted date
 */
export function formatDate(dateString) {
  if (!dateString) return 'Never';
  return new Date(dateString).toLocaleString();
}
```

---

## API Routes

### 1. Health Check Endpoint

`app/api/healthz/route.js`

```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const startTime = Date.now();

export async function GET() {
  try {
    // Test database connection
    await pool.query('SELECT 1');

    return NextResponse.json({
      ok: true,
      version: '1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString(),
      database: 'connected'
    });
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        ok: false,
        version: '1.0',
        uptime: Math.floor((Date.now() - startTime) / 1000),
        timestamp: new Date().toISOString(),
        database: 'disconnected',
        error: error.message
      },
      { status: 500 }
    );
  }
}
```

### 2. Links API - GET & POST

`app/api/links/route.js`

```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateRandomCode, validateCode, validateUrl } from '@/lib/utils';

export async function POST(request) {
  try {
    const body = await request.json();
    const { url, customCode } = body;

    // Validate URL
    if (!url || !validateUrl(url)) {
      return NextResponse.json(
        { error: 'Please enter a valid URL' },
        { status: 400 }
      );
    }

    // Generate or validate code
    let code = customCode;
    
    if (code) {
      // Validate custom code
      if (!validateCode(code)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }
    } else {
      // Generate random code
      code = generateRandomCode(6);
      
      // Check for collision (unlikely but possible)
      let attempts = 0;
      while (attempts < 5) {
        const existing = await pool.query(
          'SELECT code FROM links WHERE code = $1',
          [code]
        );
        if (existing.rows.length === 0) break;
        code = generateRandomCode(6);
        attempts++;
      }
    }

    // Insert into database
    const result = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [code, url]
    );

    const link = result.rows[0];
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

    return NextResponse.json(
      {
        code: link.code,
        url: link.url,
        shortUrl: `${baseUrl}/${link.code}`,
        clicks: link.clicks,
        createdAt: link.created_at
      },
      { status: 201 }
    );
  } catch (error) {
    // Handle duplicate key constraint violation
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Code already exists' },
        { status: 409 }
      );
    }
    
    console.error('Error creating link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const result = await pool.query(
      'SELECT * FROM links ORDER BY created_at DESC'
    );

    return NextResponse.json({ 
      links: result.rows 
    });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 3. Single Link API - GET & DELETE

`app/api/links/[code]/route.js`

```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    
    const result = await pool.query(
      'SELECT * FROM links WHERE code = $1',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(result.rows[0]);
  } catch (error) {
    console.error('Error fetching link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { code } = params;
    
    const result = await pool.query(
      'DELETE FROM links WHERE code = $1 RETURNING *',
      [code]
    );

    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Link not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ 
      message: 'Link deleted successfully' 
    });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### 4. Redirect Handler

`app/[code]/route.js`

```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = params;

    // Use transaction to ensure atomicity
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Get the link
      const result = await client.query(
        'SELECT * FROM links WHERE code = $1',
        [code]
      );

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json(
          { error: 'Not found' },
          { status: 404 }
        );
      }

      const link = result.rows[0];

      // Update click count and last_clicked timestamp
      await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
        [code]
      );

      await client.query('COMMIT');

      // Perform 302 redirect
      return NextResponse.redirect(link.url, { status: 302 });
      
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Frontend Components

### 1. Root Layout

`app/layout.js`

```javascript
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'TinyLink - URL Shortener',
  description: 'Shorten URLs and track click statistics',
};

export default function RootLayout({ children }) {
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
```

### 2. Dashboard Page

`app/page.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import LinkForm from '@/components/LinkForm';
import LinksTable from '@/components/LinksTable';

export default function Dashboard() {
  const [links, setLinks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleLinkCreated = (newLink) => {
    setLinks([newLink, ...links]);
  };

  const handleLinkDeleted = (code) => {
    setLinks(links.filter(link => link.code !== code));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            URL Shortener Dashboard
          </h1>
          <p className="text-gray-600">
            Create short links and track their performance
          </p>
        </div>

        <LinkForm onLinkCreated={handleLinkCreated} />

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {loading ? (
          <div className="mt-8 flex flex-col items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="mt-4 text-gray-600">Loading links...</p>
          </div>
        ) : (
          <LinksTable 
            links={links} 
            onLinkDeleted={handleLinkDeleted}
            onRefresh={fetchLinks}
          />
        )}
      </main>
    </div>
  );
}
```

### 3. Stats Page

`app/code/[code]/page.js`

```javascript
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { formatDate } from '@/lib/utils';

export default function StatsPage() {
  const params = useParams();
  const code = params.code;
  
  const [link, setLink] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
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
        setError(err.message);
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
          <p className="text-gray-600 mb-6">{error}</p>
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
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Link 
          href="/"
          className="text-blue-600 hover:text-blue-700 font-medium mb-6 inline-block"
        >
          ← Back to Dashboard
        </Link>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Link Statistics
          </h1>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-500">Short URL</label>
              <div className="flex items-center gap-2 mt-1">
                <code className="flex-1 px-3 py-2 bg-gray-50 rounded border text-blue-600">
                  {shortUrl}
                </code>
                <button
                  onClick={handleCopy}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  {copied ? '✓ Copied' : 'Copy'}
                </button>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-gray-500">Original URL</label>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-1 px-3 py-2 bg-gray-50 rounded border text-blue-600 hover:text-blue-700 break-all"
              >
                {link.url}
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {link.clicks}
            </div>
            <div className="text-sm text-gray-600">Total Clicks</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {formatDate(link.created_at)}
            </div>
            <div className="text-sm text-gray-600">Created</div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="text-lg font-semibold text-gray-900 mb-2">
              {formatDate(link.last_clicked)}
            </div>
            <div className="text-sm text-gray-600">Last Clicked</div>
          </div>
        </div>
      </main>
    </div>
  );
}
```

---

## Testing

### Manual Testing with curl

```bash
# 1. Health check
curl http://localhost:3000/api/healthz

# 2. Create link with custom code
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"google"}'

# 3. Create link without custom code
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# 4. Get all links
curl http://localhost:3000/api/links

# 5. Get specific link
curl http://localhost:3000/api/links/google

# 6. Test redirect
curl -I http://localhost:3000/google

# 7. Delete link
curl -X DELETE http://localhost:3000/api/links/google

# 8. Verify 404 after deletion
curl http://localhost:3000/google
```

---

## Deployment to Vercel

### 1. Push to GitHub

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/manishborikar92/tinylink.git
git push -u origin main
```

### 2. Deploy on Vercel

1. Go to https://vercel.com
2. Sign up with GitHub
3. Click "New Project"
4. Import your repository
5. Framework will auto-detect as Next.js
6. Add environment variables:
   - `DATABASE_URL` = Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL` = Will be auto-set by Vercel
7. Click "Deploy"

### 3. Post-Deployment

1. Wait for deployment to complete
2. Test health check: `https://your-app.vercel.app/api/healthz`
3. Test creating links
4. Update `NEXT_PUBLIC_BASE_URL` if needed

---

## Common Issues & Solutions

### Database Connection Fails
- Verify `DATABASE_URL` in `.env.local`
- Check SSL mode: `?sslmode=require`
- Test with: `psql $DATABASE_URL`

### Redirects Not Working
- Check route file location: `app/[code]/route.js`
- Verify database query returns data
- Check for errors in browser console

### Environment Variables Not Working
- Prefix client-side vars with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`
- Redeploy on Vercel after updating env vars

### Duplicate Code Errors
- Check unique constraint in database
- Verify error handling for code 23505
- Test collision retry logic