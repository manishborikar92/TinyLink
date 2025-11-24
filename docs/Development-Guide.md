# TinyLink Development Guide

## Project Setup

### Option 1: Next.js (Recommended)

```bash
# Create Next.js project
npx create-next-app@latest tinylink
# Choose: TypeScript (optional), Tailwind CSS, App Router

cd tinylink
npm install pg dotenv
```

### Option 2: Express

```bash
mkdir tinylink && cd tinylink
npm init -y
npm install express pg dotenv cors
npm install -D nodemon
```

---

## Database Setup (Neon PostgreSQL)

### 1. Create Neon Account
1. Go to https://neon.tech
2. Sign up (free tier)
3. Create new project
4. Copy connection string

### 2. Database Schema

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

-- Create index for faster lookups
CREATE INDEX idx_code ON links(code);
CREATE INDEX idx_created_at ON links(created_at DESC);
```

### 3. Environment Variables

Create `.env.local` (Next.js) or `.env` (Express):
```
DATABASE_URL=postgresql://user:password@host.neon.tech/neondb?sslmode=require
BASE_URL=http://localhost:3000
NODE_ENV=development
```

Create `.env.example`:
```
DATABASE_URL=postgresql://user:password@host:5432/database
BASE_URL=https://yourapp.com
NODE_ENV=production
```

---

## Database Connection

### db.js (Shared for Express or Next.js API routes)

```javascript
const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test connection
pool.on('connect', () => {
  console.log('Connected to database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

module.exports = pool;
```

---

## Code Generation Utility

### utils/codeGenerator.js

```javascript
function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

function validateCode(code) {
  const regex = /^[A-Za-z0-9]{6,8}$/;
  return regex.test(code);
}

function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

module.exports = { generateRandomCode, validateCode, validateUrl };
```

---

## Next.js Implementation

### Project Structure
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
│   │       └── page.js           # Stats page
│   ├── [code]/
│   │   └── route.js              # Redirect handler
│   ├── page.js                   # Dashboard
│   └── layout.js
├── components/
│   ├── LinkForm.js
│   ├── LinksTable.js
│   └── Header.js
├── lib/
│   ├── db.js
│   └── utils.js
└── .env.local
```

### API Route: POST /api/links

`app/api/links/route.js`
```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { generateRandomCode, validateCode, validateUrl } from '@/lib/utils';

export async function POST(request) {
  try {
    const { url, customCode } = await request.json();

    // Validate URL
    if (!validateUrl(url)) {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Generate or validate code
    let code = customCode;
    if (code) {
      if (!validateCode(code)) {
        return NextResponse.json(
          { error: 'Code must be 6-8 alphanumeric characters' },
          { status: 400 }
        );
      }
    } else {
      code = generateRandomCode();
      // Check for collision (unlikely)
      let attempts = 0;
      while (attempts < 5) {
        const existing = await pool.query('SELECT code FROM links WHERE code = $1', [code]);
        if (existing.rows.length === 0) break;
        code = generateRandomCode();
        attempts++;
      }
    }

    // Insert into database
    const result = await pool.query(
      'INSERT INTO links (code, url) VALUES ($1, $2) RETURNING *',
      [code, url]
    );

    const link = result.rows[0];
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';

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
    // Handle duplicate key error
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

    return NextResponse.json({ links: result.rows });
  } catch (error) {
    console.error('Error fetching links:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### API Route: GET/DELETE /api/links/:code

`app/api/links/[code]/route.js`
```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = params;
    const result = await pool.query('SELECT * FROM links WHERE code = $1', [code]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
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
    const result = await pool.query('DELETE FROM links WHERE code = $1 RETURNING *', [code]);

    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Link not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Link deleted successfully' });
  } catch (error) {
    console.error('Error deleting link:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

### Redirect Handler

`app/[code]/route.js`
```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET(request, { params }) {
  try {
    const { code } = params;

    // Get link and update stats in one transaction
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query('SELECT * FROM links WHERE code = $1', [code]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return NextResponse.json({ error: 'Not found' }, { status: 404 });
      }

      const link = result.rows[0];

      // Update click count and last_clicked
      await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
        [code]
      );

      await client.query('COMMIT');

      // Perform redirect
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

### Health Check

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
    return NextResponse.json(
      {
        ok: false,
        version: '1.0',
        error: 'Database connection failed'
      },
      { status: 500 }
    );
  }
}
```

### Dashboard Component

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
      const res = await fetch('/api/links');
      const data = await res.json();
      setLinks(data.links || []);
      setError(null);
    } catch (err) {
      setError('Failed to load links');
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
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">TinyLink Dashboard</h1>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-8">
        <LinkForm onLinkCreated={handleLinkCreated} />

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="mt-8 text-center">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="mt-2 text-gray-600">Loading links...</p>
          </div>
        ) : (
          <LinksTable links={links} onLinkDeleted={handleLinkDeleted} />
        )}
      </main>
    </div>
  );
}
```

---

## Express.js Implementation

### Project Structure
```
tinylink/
├── routes/
│   ├── links.js
│   └── health.js
├── utils/
│   ├── db.js
│   └── codeGenerator.js
├── public/
│   ├── index.html
│   ├── stats.html
│   └── css/
├── server.js
└── .env
```

### server.js

```javascript
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const linksRouter = require('./routes/links');
const healthRouter = require('./routes/health');
const pool = require('./utils/db');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/api/links', linksRouter);
app.use('/healthz', healthRouter);

// Redirect handler
app.get('/:code', async (req, res) => {
  try {
    const { code } = req.params;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const result = await client.query('SELECT * FROM links WHERE code = $1', [code]);

      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({ error: 'Not found' });
      }

      const link = result.rows[0];

      await client.query(
        'UPDATE links SET clicks = clicks + 1, last_clicked = NOW() WHERE code = $1',
        [code]
      );

      await client.query('COMMIT');

      res.redirect(302, link.url);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error redirecting:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
```

---

## Testing

### Manual Testing Checklist

```bash
# Health check
curl http://localhost:3000/healthz

# Create link with custom code
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"google"}'

# Create link without custom code
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com"}'

# Get all links
curl http://localhost:3000/api/links

# Get specific link
curl http://localhost:3000/api/links/google

# Test redirect (browser or curl)
curl -L http://localhost:3000/google

# Delete link
curl -X DELETE http://localhost:3000/api/links/google

# Verify 404 after deletion
curl http://localhost:3000/google
```

---

## Deployment

### Vercel (Next.js)

1. Push code to GitHub
2. Go to https://vercel.com
3. Import repository
4. Add environment variables:
   - `DATABASE_URL`
   - `BASE_URL`
5. Deploy

### Render (Express)

1. Push code to GitHub
2. Go to https://render.com
3. Create new Web Service
4. Connect repository
5. Set build command: `npm install`
6. Set start command: `node server.js`
7. Add environment variables
8. Deploy

### Railway

1. Push code to GitHub
2. Go to https://railway.app
3. Create new project from repo
4. Add Postgres plugin
5. Configure environment variables
6. Deploy

---

## Common Issues & Solutions

### Issue: Database connection fails
**Solution:** Check SSL settings, verify connection string, ensure IP allowlist

### Issue: Redirects not working
**Solution:** Verify route order, check code format, test database query

### Issue: CORS errors
**Solution:** Add CORS middleware, configure allowed origins

### Issue: Code collisions
**Solution:** Implement retry logic, use longer codes, check uniqueness

### Issue: Slow queries
**Solution:** Add database indexes, use connection pooling

---

## Performance Optimization

- Add database indexes on frequently queried columns
- Implement connection pooling
- Cache frequently accessed links (Redis)
- Use prepared statements
- Optimize database queries
- Implement rate limiting
- Use CDN for static assets