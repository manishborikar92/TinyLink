# TinyLink - URL Shortener

A modern, production-ready URL shortener built with Next.js 14, TypeScript, and PostgreSQL.

## 🔗 Live Demo

**App:** https://tinylink-live.vercel.app/  
**Health Check:** https://tinylink-live.vercel.app/api/healthz

## ✨ Features

- Create short links with custom or random codes (6-8 alphanumeric characters)
- Track click statistics in real-time
- View detailed analytics per link
- Responsive design for all devices
- Fast redirects with PostgreSQL
- Production-ready error handling
- TypeScript for type safety

## 🛠 Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Language:** TypeScript
- **Database:** PostgreSQL (Neon)
- **Styling:** Tailwind CSS
- **Hosting:** Vercel

## 🚀 Local Setup

### Prerequisites

- Node.js 18+ installed
- PostgreSQL database (Neon recommended)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/manishborikar92/TinyLink.git
cd TinyLink
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your database connection string:
```env
DATABASE_URL=postgresql://user:password@host.neon.tech/database?sslmode=require
NEXT_PUBLIC_BASE_URL=http://localhost:3000
NODE_ENV=development
```

4. Create database schema:

Run this SQL in your PostgreSQL database:
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

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser.

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/links` | Create a new short link |
| GET | `/api/links` | List all links |
| GET | `/api/links/:code` | Get link statistics |
| DELETE | `/api/links/:code` | Delete a link |
| GET | `/:code` | Redirect to original URL |
| GET | `/api/healthz` | Health check endpoint |

### Example API Usage

**Create a link:**
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://example.com","customCode":"example"}'
```

**Get all links:**
```bash
curl http://localhost:3000/api/links
```

**Delete a link:**
```bash
curl -X DELETE http://localhost:3000/api/links/example
```

## 📁 Project Structure

```
TinyLink/
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── links/
│   │   │   │   ├── route.ts          # GET, POST /api/links
│   │   │   │   └── [code]/
│   │   │   │       └── route.ts      # GET, DELETE /api/links/:code
│   │   │   └── healthz/
│   │   │       └── route.ts          # GET /healthz
│   │   ├── code/
│   │   │   └── [code]/
│   │   │       └── page.tsx          # Stats page
│   │   ├── [code]/
│   │   │   └── route.ts              # Redirect handler
│   │   ├── page.tsx                  # Dashboard
│   │   ├── layout.tsx                # Root layout
│   │   └── globals.css               # Global styles
│   ├── components/
│   │   ├── LinkForm.tsx              # Form component
│   │   └── LinksTable.tsx            # Table component
│   └── lib/
│       ├── db.ts                     # Database connection
│       ├── utils.ts                  # Utility functions
│       └── types.ts                  # TypeScript types
├── .env.example                      # Example environment variables
├── .env.local                        # Local environment variables (gitignored)
└── README.md
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com) and sign in
3. Click "New Project" and import your repository
4. Add environment variables:
   - `DATABASE_URL`: Your Neon connection string
   - `NEXT_PUBLIC_BASE_URL`: Will be auto-set by Vercel
5. Click "Deploy"

### Database Setup (Neon)

1. Sign up at [neon.tech](https://neon.tech)
2. Create a new project
3. Run the schema SQL from the setup instructions
4. Copy the connection string to your environment variables

## 🧪 Testing

Test the health check:
```bash
curl http://localhost:3000/api/healthz
```

Test creating a link:
```bash
curl -X POST http://localhost:3000/api/links \
  -H "Content-Type: application/json" \
  -d '{"url":"https://google.com","customCode":"google"}'
```

Test redirect:
```bash
curl -I http://localhost:3000/google
```

## 📝 Environment Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host/db?sslmode=require` |
| `NEXT_PUBLIC_BASE_URL` | Base URL for short links | `https://yourapp.vercel.app` |
| `NODE_ENV` | Environment mode | `development` or `production` |

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🙏 Acknowledgments

Built as part of a coding challenge to demonstrate full-stack development skills with Next.js, TypeScript, and PostgreSQL.
