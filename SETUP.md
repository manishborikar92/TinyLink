# TinyLink Setup Guide

Complete step-by-step guide to set up and run TinyLink locally and deploy to production.

## Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- A Neon PostgreSQL account (free tier available)

## Local Development Setup

### Step 1: Clone and Install

```bash
# Clone the repository
git clone https://github.com/manishborikar92/tinylink.git
cd tinylink

# Install dependencies
npm install
```

### Step 2: Database Setup (Neon)

1. **Create Neon Account:**
   - Visit https://neon.tech
   - Sign up with GitHub (free tier)
   - Create a new project named "tinylink"
   - Select the region closest to you

2. **Create Database Schema:**
   - In the Neon dashboard, go to SQL Editor
   - Copy and paste the contents of `database/schema.sql`
   - Click "Run" to execute the SQL

3. **Get Connection String:**
   - In Neon dashboard, go to "Connection Details"
   - Copy the connection string (it should look like):
     ```
     postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
     ```

### Step 3: Environment Variables

1. **Create `.env.local` file:**
```bash
cp .env.example .env.local
```

2. **Edit `.env.local` with your values:**
```env
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.region.aws.neon.tech/neondb?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### Step 4: Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 5: Test the Application

1. **Health Check:**
   - Visit: http://localhost:3000/api/healthz
   - Should return: `{"ok":true,"version":"1.0",...}`

2. **Create a Link:**
   - Use the form on the homepage
   - Enter a URL: `https://google.com`
   - Enter custom code: `google` (or leave empty for random)
   - Click "Create Short Link"

3. **Test Redirect:**
   - Visit: http://localhost:3000/google
   - Should redirect to Google

4. **View Stats:**
   - Click on the code in the table
   - Should show click statistics

## Production Deployment (Vercel)

### Step 1: Prepare for Deployment

1. **Ensure all changes are committed:**
```bash
git add .
git commit -m "Initial TinyLink setup"
```

2. **Push to GitHub:**
```bash
git branch -M main
git remote add origin https://github.com/manishborikar92/tinylink.git
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Sign Up/Login:**
   - Go to https://vercel.com
   - Sign up with GitHub

2. **Import Project:**
   - Click "New Project"
   - Select your `tinylink` repository
   - Framework will auto-detect as Next.js

3. **Configure Environment Variables:**
   - Click "Environment Variables"
   - Add the following:
     - `DATABASE_URL`: Your Neon connection string
     - `NEXT_PUBLIC_BASE_URL`: Leave empty (Vercel will auto-set)
     - `NODE_ENV`: `production`

4. **Deploy:**
   - Click "Deploy"
   - Wait 2-3 minutes for deployment to complete

### Step 3: Post-Deployment

1. **Update Base URL (if needed):**
   - Go to Vercel dashboard → Settings → Environment Variables
   - Update `NEXT_PUBLIC_BASE_URL` to your Vercel URL
   - Redeploy if necessary

2. **Test Production:**
   - Visit your Vercel URL
   - Test health check: `https://your-app.vercel.app/api/healthz`
   - Create a test link
   - Test redirect functionality

## Testing

### Manual Testing Checklist

- [ ] Health check returns 200
- [ ] Create link with custom code
- [ ] Create link without custom code (random)
- [ ] Duplicate code returns 409 error
- [ ] Invalid URL shows validation error
- [ ] Redirect works and increments clicks
- [ ] Stats page shows correct data
- [ ] Delete link works
- [ ] Deleted link returns 404
- [ ] Mobile responsive design works

### API Testing with curl

```bash
# Health check
curl http://localhost:3000/api/healthz

# Create link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customCode":"test123"}'

# Get all links
curl http://localhost:3000/api/links

# Get single link
curl http://localhost:3000/api/links/test123

# Test redirect
curl -I http://localhost:3000/test123

# Delete link
curl -X DELETE http://localhost:3000/api/links/test123
```

## Troubleshooting

### Database Connection Issues

**Problem:** "Database connection error"

**Solutions:**
- Verify `DATABASE_URL` is correct in `.env.local`
- Ensure `?sslmode=require` is at the end of the connection string
- Check Neon dashboard for database status
- Test connection with: `psql $DATABASE_URL`

### Build Errors

**Problem:** Build fails on Vercel

**Solutions:**
- Run `npm run build` locally to test
- Check all imports are correct
- Verify all environment variables are set in Vercel
- Review build logs in Vercel dashboard

### Redirect Not Working

**Problem:** 404 when visiting short link

**Solutions:**
- Verify the code exists in database
- Check `src/app/[code]/route.ts` file exists
- Test API endpoint first: `/api/links/{code}`
- Check browser network tab for errors

### Environment Variables Not Working

**Problem:** Variables undefined in code

**Solutions:**
- Client-side variables must start with `NEXT_PUBLIC_`
- Restart dev server after changing `.env.local`
- Redeploy on Vercel after updating env vars
- Check Vercel dashboard for correct variable names

## Project Structure

```
tinylink/
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── api/               # API routes
│   │   │   ├── links/         # Links CRUD operations
│   │   │   └── healthz/       # Health check
│   │   ├── code/[code]/       # Stats page
│   │   ├── [code]/            # Redirect handler
│   │   ├── page.tsx           # Dashboard
│   │   ├── layout.tsx         # Root layout
│   │   └── globals.css        # Global styles
│   ├── components/            # React components
│   │   ├── LinkForm.tsx       # Create link form
│   │   └── LinksTable.tsx     # Links table
│   └── lib/                   # Utilities
│       ├── db.ts              # Database connection
│       ├── utils.ts           # Helper functions
│       └── types.ts           # TypeScript types
├── database/
│   └── schema.sql             # Database schema
├── public/                    # Static assets
├── .env.example               # Example env vars
├── .env.local                 # Local env vars (gitignored)
├── README.md                  # Project documentation
└── SETUP.md                   # This file
```

## Development Tips

1. **Hot Reload:** Changes to files automatically reload the browser
2. **Type Safety:** TypeScript will catch errors before runtime
3. **Database Queries:** Check console for SQL query logs
4. **API Testing:** Use browser DevTools Network tab
5. **Styling:** Tailwind classes are applied at build time

## Next Steps

After successful setup:

1. Customize the UI/styling to match your brand
2. Add additional features (analytics, QR codes, etc.)
3. Implement rate limiting for API endpoints
4. Set up monitoring and error tracking

## Support

For issues or questions:
- Check the troubleshooting section above
- Review the documentation in README.md
- Check Next.js documentation: https://nextjs.org/docs
- Check Neon documentation: https://neon.tech/docs

## License

MIT License - See LICENSE file for details
