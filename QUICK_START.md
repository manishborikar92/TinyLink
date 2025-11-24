# TinyLink - Quick Start Guide

Get TinyLink running in 5 minutes!

## Prerequisites

- Node.js 18+ installed
- A Neon account (free at https://neon.tech)

## Setup Steps

### 1. Install Dependencies (30 seconds)

```bash
npm install
```

### 2. Set Up Database (2 minutes)

1. Go to https://neon.tech and sign up
2. Create a new project called "tinylink"
3. In SQL Editor, paste and run this:

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
CREATE INDEX idx_created_at ON links(created_at DESC);
```

4. Copy your connection string from the dashboard

### 3. Configure Environment (1 minute)

Create `.env.local` file:

```env
DATABASE_URL=your_neon_connection_string_here
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

### 4. Run the App (10 seconds)

```bash
npm run dev
```

Open http://localhost:3000 🎉

## Test It Out

1. **Create a link:**
   - Enter URL: `https://google.com`
   - Custom code: `google`
   - Click "Create Short Link"

2. **Test redirect:**
   - Visit: http://localhost:3000/google
   - Should redirect to Google

3. **View stats:**
   - Click on "google" in the table
   - See click statistics

## Deploy to Production

### Option 1: Vercel (Recommended - 5 minutes)

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project" → Import your repo
4. Add environment variable: `DATABASE_URL`
5. Click "Deploy"

Done! Your app is live.

### Option 2: Other Platforms

TinyLink works on any platform that supports Next.js:
- Netlify
- Railway
- Render
- AWS Amplify
- DigitalOcean App Platform

## Common Commands

```bash
# Development
npm run dev          # Start dev server

# Production
npm run build        # Build for production
npm start            # Start production server

# Code Quality
npm run lint         # Run ESLint
```

## API Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/links` | POST | Create link |
| `/api/links` | GET | List all links |
| `/api/links/:code` | GET | Get link stats |
| `/api/links/:code` | DELETE | Delete link |
| `/:code` | GET | Redirect to URL |
| `/api/healthz` | GET | Health check |

## Quick API Test

```bash
# Create a link
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customCode":"test"}'

# Get all links
curl http://localhost:3000/api/links

# Test redirect
curl -I http://localhost:3000/test
```

## Troubleshooting

### "Database connection error"
- Check your `DATABASE_URL` in `.env.local`
- Ensure it ends with `?sslmode=require`
- Verify database is running in Neon dashboard

### "Module not found"
```bash
rm -rf node_modules package-lock.json
npm install
```

### "Port 3000 already in use"
```bash
# Kill the process using port 3000
# Windows:
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux:
lsof -ti:3000 | xargs kill -9
```

### Build fails
```bash
npm run build
# Check the error message and fix any TypeScript errors
```

## Project Structure

```
src/
├── app/
│   ├── api/              # API routes
│   ├── [code]/           # Redirect handler
│   ├── code/[code]/      # Stats page
│   ├── page.tsx          # Dashboard
│   └── layout.tsx        # Layout
├── components/           # React components
└── lib/                  # Utilities
    ├── db.ts            # Database
    ├── utils.ts         # Helpers
    └── types.ts         # Types
```

## Next Steps

1. ✅ Read [README.md](README.md) for full documentation
2. ✅ Check [SETUP.md](SETUP.md) for detailed setup
3. ✅ Review [PROJECT_SUMMARY.md](PROJECT_SUMMARY.md) for architecture
4. ✅ Customize the UI to match your brand
5. ✅ Add additional features as needed

## Support

- 📖 Documentation: See README.md
- 🐛 Issues: Check troubleshooting section
- 💬 Questions: Review docs/ folder

## License

MIT - Free to use for any purpose

---

**Ready to go?** Run `npm run dev` and start shortening URLs! 🚀
