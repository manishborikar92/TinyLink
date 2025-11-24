# TinyLink Workflow & Implementation Steps

## Phase 1: Setup & Planning (2-3 hours)

### Step 1.1: Environment Setup
```bash
# Choose your stack
# Option A: Next.js
npx create-next-app@latest tinylink --tailwind --app

# Option B: Express
mkdir tinylink && cd tinylink
npm init -y
```

**Checklist:**
- [ ] Project created
- [ ] Git repository initialized
- [ ] `.gitignore` configured
- [ ] Dependencies installed

### Step 1.2: Database Setup
1. **Create Neon Account:**
   - Visit https://neon.tech
   - Sign up (free tier)
   - Create new project "tinylink"
   - Copy connection string

2. **Create Schema:**
   ```sql
   CREATE TABLE links (
     id SERIAL PRIMARY KEY,
     code VARCHAR(8) UNIQUE NOT NULL,
     url TEXT NOT NULL,
     clicks INTEGER DEFAULT 0,
     last_clicked TIMESTAMP,
     created_at TIMESTAMP DEFAULT NOW()
   );
   
   CREATE INDEX idx_code ON links(code);
   ```

3. **Configure Environment:**
   ```bash
   # .env.local or .env
   DATABASE_URL=your_neon_connection_string
   BASE_URL=http://localhost:3000
   ```

**Checklist:**
- [ ] Neon account created
- [ ] Database created
- [ ] Schema applied
- [ ] Connection tested
- [ ] Environment variables set

### Step 1.3: Project Structure
Create folder structure and basic files:

```
tinylink/
├── lib/              # Database & utilities
├── components/       # React components
├── app/             # Next.js pages & API routes
└── public/          # Static assets
```

**Checklist:**
- [ ] Folders created
- [ ] db.js configured
- [ ] utils.js with validation functions
- [ ] Basic layout component

---

## Phase 2: Backend Implementation (4-5 hours)

### Step 2.1: Database Connection
Create `lib/db.js`:
```javascript
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default pool;
```

**Test connection:**
```javascript
// Test in API route or separate script
const result = await pool.query('SELECT NOW()');
console.log(result.rows[0]);
```

**Checklist:**
- [ ] Database connection established
- [ ] Connection tested successfully
- [ ] Error handling added

### Step 2.2: Utility Functions
Create `lib/utils.js`:
```javascript
export function generateRandomCode(length = 6) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let code = '';
  for (let i = 0; i < length; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export function validateCode(code) {
  return /^[A-Za-z0-9]{6,8}$/.test(code);
}

export function validateUrl(url) {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}
```

**Test utilities:**
```javascript
console.log(generateRandomCode()); // e.g., "aB3xY9"
console.log(validateCode("abc123")); // true
console.log(validateUrl("https://example.com")); // true
```

**Checklist:**
- [ ] Code generation function works
- [ ] Validation functions tested
- [ ] Edge cases handled

### Step 2.3: Health Check Endpoint
Create `app/api/healthz/route.js`:
```javascript
import { NextResponse } from 'next/server';
import pool from '@/lib/db';

const startTime = Date.now();

export async function GET() {
  try {
    await pool.query('SELECT 1');
    return NextResponse.json({
      ok: true,
      version: '1.0',
      uptime: Math.floor((Date.now() - startTime) / 1000),
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
```

**Test:**
```bash
curl http://localhost:3000/api/healthz
# Expected: {"ok":true,"version":"1.0",...}
```

**Checklist:**
- [ ] Endpoint returns 200
- [ ] Database connectivity checked
- [ ] Uptime tracked

### Step 2.4: Create Link Endpoint
Create `app/api/links/route.js`:

**Checklist:**
- [ ] POST /api/links implemented
- [ ] URL validation works
- [ ] Custom code validation works
- [ ] Random code generation works
- [ ] Duplicate detection (409) works
- [ ] Returns 201 with correct response
- [ ] GET /api/links lists all links

### Step 2.5: Single Link Endpoint
Create `app/api/links/[code]/route.js`:

**Checklist:**
- [ ] GET /api/links/:code returns link data
- [ ] DELETE /api/links/:code removes link
- [ ] Returns 404 for non-existent codes

### Step 2.6: Redirect Handler
Create `app/[code]/route.js`:

**Checklist:**
- [ ] Redirect (302) works
- [ ] Click count increments
- [ ] Last clicked timestamp updates
- [ ] Returns 404 for missing links
- [ ] Transaction handles race conditions

---

## Phase 3: Frontend Implementation (5-6 hours)

### Step 3.1: Layout Component
Create `app/layout.js`:
```javascript
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <nav className="bg-blue-600 text-white p-4">
          <div className="max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold">TinyLink</h1>
          </div>
        </nav>
        {children}
      </body>
    </html>
  );
}
```

**Checklist:**
- [ ] Header/navigation created
- [ ] Consistent styling applied
- [ ] Responsive layout

### Step 3.2: Link Form Component
Create `components/LinkForm.js`:

**Features:**
- [ ] URL input field
- [ ] Custom code input (optional)
- [ ] Submit button
- [ ] Loading state during submission
- [ ] Success message on creation
- [ ] Error message display
- [ ] Form reset after success
- [ ] Inline validation
- [ ] Disabled state during loading

**States to handle:**
- Idle
- Loading (submitting)
- Success
- Error

### Step 3.3: Links Table Component
Create `components/LinksTable.js`:

**Features:**
- [ ] Display all links in table
- [ ] Show: code, URL, clicks, last clicked, actions
- [ ] Copy button for short URL
- [ ] Delete button with confirmation
- [ ] Sort by columns
- [ ] Filter/search functionality
- [ ] Empty state ("No links yet")
- [ ] Loading state
- [ ] Truncate long URLs
- [ ] Mobile responsive

**Checklist:**
- [ ] Table renders correctly
- [ ] Copy functionality works
- [ ] Delete with confirmation works
- [ ] Sorting implemented
- [ ] Filter/search works
- [ ] Mobile layout stacks properly

### Step 3.4: Dashboard Page
Create `app/page.js`:

**Features:**
- [ ] Renders LinkForm
- [ ] Renders LinksTable
- [ ] Fetches links on mount
- [ ] Handles loading state
- [ ] Handles error state
- [ ] Updates table after create/delete
- [ ] Responsive layout

**Checklist:**
- [ ] Page loads without errors
- [ ] Data fetches correctly
- [ ] Components communicate properly
- [ ] State management works

### Step 3.5: Stats Page
Create `app/code/[code]/page.js`:

**Features:**
- [ ] Display single link details
- [ ] Show full URL
- [ ] Show click statistics
- [ ] Show creation date
- [ ] Show last clicked time
- [ ] Copy short URL button
- [ ] Back to dashboard link
- [ ] Loading state
- [ ] Error state (404)

**Checklist:**
- [ ] Stats page accessible via /code/:code
- [ ] Displays correct information
- [ ] Handles non-existent codes
- [ ] Mobile responsive

---

## Phase 4: Styling & UX Polish (2-3 hours)

### Step 4.1: Tailwind Configuration
Configure `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    './app/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: '#3B82F6',
        secondary: '#10B981',
      },
    },
  },
}
```

### Step 4.2: Component Styling

**Form Styling:**
- [ ] Consistent input styles
- [ ] Clear labels
- [ ] Proper spacing
- [ ] Focus states
- [ ] Error states (red border)
- [ ] Success states (green border)

**Button Styling:**
- [ ] Primary button (blue)
- [ ] Danger button (red)
- [ ] Disabled state (gray)
- [ ] Loading state (spinner)
- [ ] Hover effects

**Table Styling:**
- [ ] Zebra striping
- [ ] Hover row highlight
- [ ] Proper padding
- [ ] Border styling
- [ ] Responsive breakpoints

### Step 4.3: Loading States
Implement spinners/skeletons:
```javascript
function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  );
}
```

**Checklist:**
- [ ] Loading spinner component
- [ ] Table skeleton loader
- [ ] Form loading state
- [ ] Page loading state

### Step 4.4: Empty States
```javascript
function EmptyState() {
  return (
    <div className="text-center py-12">
      <p className="text-gray-500 text-lg">No links created yet</p>
      <p className="text-gray-400 mt-2">Create your first short link above</p>
    </div>
  );
}
```

**Checklist:**
- [ ] Empty table state
- [ ] Empty search results
- [ ] Clear messaging

### Step 4.5: Error States
```javascript
function ErrorMessage({ message }) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-md p-4">
      <p className="text-red-700">{message}</p>
    </div>
  );
}
```

**Checklist:**
- [ ] Form validation errors
- [ ] API error messages
- [ ] Network error handling
- [ ] 404 error page

### Step 4.6: Success States
```javascript
function SuccessMessage({ message }) {
  return (
    <div className="bg-green-50 border border-green-200 rounded-md p-4">
      <p className="text-green-700">✓ {message}</p>
    </div>
  );
}
```

**Checklist:**
- [ ] Link created success
- [ ] Link deleted success
- [ ] Copy to clipboard success

### Step 4.7: Responsive Design
Test breakpoints:
- [ ] Mobile (< 640px)
- [ ] Tablet (640px - 1024px)
- [ ] Desktop (> 1024px)

**Mobile considerations:**
- [ ] Stack form fields vertically
- [ ] Full-width buttons
- [ ] Scrollable table
- [ ] Larger touch targets (44px min)
- [ ] Readable font sizes (16px min)

---

## Phase 5: Testing & Debugging (2-3 hours)

### Step 5.1: Manual Testing

**Create Link Tests:**
- [ ] Create link with custom code
- [ ] Create link without custom code
- [ ] Try duplicate code (should fail with 409)
- [ ] Try invalid URL (should show error)
- [ ] Try invalid code format (should show error)
- [ ] Verify link appears in table

**Redirect Tests:**
- [ ] Visit /{code} and verify redirect
- [ ] Check if clicks increment
- [ ] Verify last_clicked updates
- [ ] Try non-existent code (404)

**Delete Tests:**
- [ ] Delete a link
- [ ] Verify it's removed from table
- [ ] Try visiting deleted code (404)

**Stats Page Tests:**
- [ ] View stats for existing link
- [ ] Try non-existent code (404)
- [ ] Verify all data displays correctly

**UI/UX Tests:**
- [ ] All buttons work
- [ ] Copy buttons work
- [ ] Forms validate properly
- [ ] Loading states show
- [ ] Error messages display
- [ ] Success messages display
- [ ] Mobile layout works
- [ ] Table sorting/filtering works

### Step 5.2: API Testing with curl

Create test script `test-api.sh`:
```bash
#!/bin/bash

echo "Testing Health Check..."
curl http://localhost:3000/api/healthz

echo "\nTesting Create Link..."
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"test123"}'

echo "\nTesting Get All Links..."
curl http://localhost:3000/api/links

echo "\nTesting Get Single Link..."
curl http://localhost:3000/api/links/test123

echo "\nTesting Redirect..."
curl -I http://localhost:3000/test123

echo "\nTesting Delete..."
curl -X DELETE http://localhost:3000/api/links/test123

echo "\nTesting 404..."
curl http://localhost:3000/test123
```

**Checklist:**
- [ ] All API endpoints respond correctly
- [ ] Status codes are correct
- [ ] Response formats match spec
- [ ] Error handling works

### Step 5.3: Browser Testing
Test in multiple browsers:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Mobile Safari
- [ ] Mobile Chrome

### Step 5.4: Edge Cases
- [ ] Very long URLs (> 2000 chars)
- [ ] Special characters in URLs
- [ ] Unicode characters in custom codes
- [ ] Rapid consecutive clicks
- [ ] Network errors
- [ ] Database connection failures

---

## Phase 6: Deployment (2-3 hours)

### Step 6.1: Pre-Deployment Checklist
- [ ] All features working locally
- [ ] Environment variables documented
- [ ] .env.example created
- [ ] Database migrations ready
- [ ] README.md written
- [ ] Git commits clean and meaningful
- [ ] No sensitive data in repo

### Step 6.2: Deploy to Vercel (Next.js)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import GitHub repository
   - Framework: Next.js (auto-detected)

3. **Configure Environment Variables:**
   - Add `DATABASE_URL`
   - Add `BASE_URL` (use Vercel URL)

4. **Deploy:**
   - Click "Deploy"
   - Wait for build to complete
   - Test deployed URL

**Checklist:**
- [ ] Deployment successful
- [ ] Environment variables set
- [ ] Health check works
- [ ] All routes accessible
- [ ] Database connected

### Step 6.3: Deploy to Render (Express)

1. **Push to GitHub**

2. **Create Web Service:**
   - Go to https://render.com
   - New → Web Service
   - Connect repository
   - Name: tinylink
   - Environment: Node
   - Build: `npm install`
   - Start: `node server.js`

3. **Add Environment Variables**

4. **Deploy**

### Step 6.4: Post-Deployment Testing
- [ ] Health check endpoint works
- [ ] Create link works
- [ ] Redirect works
- [ ] Delete works
- [ ] UI loads correctly
- [ ] Database persistence works
- [ ] No console errors
- [ ] Mobile responsive

---

## Phase 7: Documentation & Submission (1-2 hours)

### Step 7.1: README.md
Create comprehensive README:

```markdown
# TinyLink - URL Shortener

## Live Demo
- **App:** https://your-app.vercel.app
- **Health Check:** https://your-app.vercel.app/healthz

## Features
- Create short links with custom codes
- Track click statistics
- Manage all links from dashboard
- View detailed stats per link
- Mobile responsive design

## Tech Stack
- Next.js 14 (App Router)
- PostgreSQL (Neon)
- Tailwind CSS
- Deployed on Vercel

## Local Setup
1. Clone repository
2. Install dependencies: `npm install`
3. Copy `.env.example` to `.env.local`
4. Add your database URL
5. Run: `npm run dev`
6. Visit: http://localhost:3000

## API Endpoints
- `POST /api/links` - Create link
- `GET /api/links` - List all links
- `GET /api/links/:code` - Get link stats
- `DELETE /api/links/:code` - Delete link
- `GET /:code` - Redirect to URL
- `GET /healthz` - Health check

## Environment Variables
See `.env.example` for required variables.
```

**Checklist:**
- [ ] README written
- [ ] Setup instructions clear
- [ ] Live URLs included
- [ ] Features documented
- [ ] Tech stack listed

### Step 7.2: Video Walkthrough
Record 5-10 minute video:

**Structure:**
1. **Introduction (30s)**
   - Your name
   - Project overview

2. **Live Demo (2-3 min)**
   - Show deployed app
   - Create a link
   - Test redirect
   - View stats
   - Delete link
   - Mobile view

3. **Code Walkthrough (3-5 min)**
   - Project structure
   - Database schema
   - API routes
   - Key components
   - Deployment setup

4. **Challenges & Solutions (1-2 min)**
   - What was difficult
   - How you solved it
   - What you learned

**Tools:**
- Loom (https://loom.com)
- OBS Studio
- QuickTime (Mac)
- Zoom recording

**Checklist:**
- [ ] Video recorded
- [ ] Audio clear
- [ ] Screen readable
- [ ] Uploaded to YouTube/Loom
- [ ] Link accessible

### Step 7.3: Final Submission
Create submission document with:

1. **Live URL:**
   - https://your-app.vercel.app

2. **GitHub URL:**
   - https://github.com/yourusername/tinylink

3. **Video URL:**
   - https://loom.com/share/your-video

4. **LLM Transcript URL:**
   - https://chat.openai.com/share/your-chat

**Final Checklist:**
- [ ] All URLs working
- [ ] GitHub repo public
- [ ] README complete
- [ ] Video accessible
- [ ] Code clean and commented
- [ ] No API keys committed
- [ ] .env.example included
- [ ] All features working

---

## Time Estimates Summary

| Phase | Task | Time |
|-------|------|------|
| 1 | Setup & Planning | 2-3h |
| 2 | Backend Implementation | 4-5h |
| 3 | Frontend Implementation | 5-6h |
| 4 | Styling & UX Polish | 2-3h |
| 5 | Testing & Debugging | 2-3h |
| 6 | Deployment | 2-3h |
| 7 | Documentation | 1-2h |
| **Total** | | **18-25h** |

**Tip:** Spread over 2-3 days for best results.

---

## Daily Schedule Suggestion

### Day 1 (8-10 hours)
- Morning: Setup + Database + Backend APIs
- Afternoon: Frontend components + Dashboard
- Evening: Stats page + Basic styling

### Day 2 (6-8 hours)
- Morning: UX polish + Responsive design
- Afternoon: Testing + Bug fixes
- Evening: Deployment

### Day 3 (2-4 hours)
- Morning: Final testing + Documentation
- Afternoon: Video recording + Submission

---

## Troubleshooting Guide

### "Database connection failed"
- Check DATABASE_URL format
- Verify SSL settings
- Test connection with psql
- Check Neon IP allowlist

### "Redirect not working"
- Verify route handler path
- Check database query
- Test with curl
- Check for errors in logs

### "Duplicate key error"
- Check uniqueness constraint
- Verify code validation
- Test collision handling

### "Build fails on Vercel"
- Check all imports
- Verify environment variables
- Review build logs
- Test build locally

### "404 on deployed app"
- Check route definitions
- Verify Next.js App Router structure
- Review deployment logs
- Test locally with `npm run build`