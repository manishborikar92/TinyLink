# TinyLink - Complete Video Recording Script

**Duration:** 10-12 minutes  
**Format:** Screen recording with voiceover  
**Audience:** Technical reviewers, potential employers

---

## 🎬 PART 1: INTRODUCTION (1 minute)

### [Screen: Show deployed app homepage]

**Script:**

"Hi, I'm [Your Name], and today I'm going to walk you through TinyLink - a production-ready URL shortener application I built from scratch.

TinyLink is a full-stack web application that allows users to create short, memorable links with custom codes, track click statistics in real-time, and manage their links through a modern, responsive interface.

The tech stack includes Next.js 16 with the App Router, TypeScript for type safety, PostgreSQL hosted on Neon for the database, and Tailwind CSS 4 for styling. The entire application is deployed on Vercel.

Let me start by showing you how it works, and then we'll dive deep into the code to see exactly how I built each feature."

---

## 🎯 PART 2: LIVE DEMO (2-3 minutes)

### Demo 1: Creating a Link with Custom Code (30 seconds)

**[Screen: Navigate to homepage, focus on the form]**

**Script:**

"First, let's create a short link. I'll paste in a long URL here - let's use a GitHub repository URL.

[Paste URL: https://github.com/manishborikar92/TinyLink]

Now I can either provide a custom code - I'll type 'github' here - or leave it empty to generate a random 6-character code automatically.

[Type 'github' in custom code field]

[Click 'Create Short Link']

And there we go! The link is created instantly. Notice the success message shows the full short URL that I can share."

### Demo 2: Creating a Random Link (20 seconds)

**[Screen: Still on homepage]**

**Script:**

"Let me create another one without a custom code to show the random generation.

[Paste URL: https://www.example.com/another/very/long/url/path]

[Leave custom code empty]

[Click 'Create Short Link']

Perfect! It generated a random 6-character alphanumeric code automatically."

### Demo 3: Viewing the Links Table (30 seconds)

**[Screen: Scroll down to the links table]**

**Script:**

"Below the form, we have a table showing all our links. You can see the short code, the original URL truncated for readability, the click count, and when each link was created.

The table is fully sortable - I can click on any column header to sort by that field. Let me sort by clicks.

[Click on 'Clicks' column header]

And it's fully searchable too.

[Type 'github' in search box]

The table is also responsive - on mobile devices, it switches to a card layout that's touch-friendly."

### Demo 4: Testing the Redirect (30 seconds)

**[Screen: Copy short link, open in new tab]**

**Script:**

"Now let's test the redirect functionality. I'll copy this short link...

[Click 'Copy' button]

...and open it in a new tab.

[Open new tab, paste URL in address bar, press Enter]

And it redirects instantly to the original URL. Behind the scenes, this also incremented the click counter and updated the last clicked timestamp in the database."

### Demo 5: Stats Page (30 seconds)

**[Screen: Go back, click on a code to view stats]**

**Script:**

"Clicking on any code takes us to a detailed statistics page. Here we can see the total number of clicks, when the link was created, and when it was last clicked.

There's also a convenient copy button for quickly sharing the short link, and a link back to the dashboard."

### Demo 6: Delete Link (20 seconds)

**[Screen: Go back to dashboard, delete a link]**

**Script:**

"And of course, we can delete links we no longer need. When I click delete...

[Click 'Delete' button]

...it asks for confirmation to prevent accidental deletions...

[Click 'OK' in confirmation dialog]

...and removes it from the database immediately."

---

## 💻 PART 3: CODE WALKTHROUGH (5-7 minutes)

### Section 1: Project Structure (30 seconds)

**[Screen: Show VS Code with project structure in sidebar]**

**Script:**

"Now let's dive into the code. The project follows Next.js 14's App Router structure with a clear separation of concerns.

In the src folder, we have the app directory for pages and API routes, components for reusable UI elements, and lib for utilities and database configuration.

The database folder contains our SQL schema, and the docs folder has all the project documentation.

Let me walk you through the key files, starting with the database."

### Section 2: Database Schema (45 seconds)

**[Screen: Open database/schema.sql]**

**Script:**

"Here's our database schema. It's a single table called 'links' with six columns:

- An auto-incrementing ID as the primary key
- The code, which is a unique 6-8 character string
- The original URL as text
- A clicks counter that defaults to zero
- A last_clicked timestamp that updates on each redirect
- And created_at for when the link was created

I've added two indexes - one on the code column for fast lookups during redirects, and one on created_at for efficiently sorting links by date.

This simple schema is all we need for a fully functional URL shortener."

### Section 3: Database Connection (1 minute)

**[Screen: Open src/lib/db.ts]**

**Script:**

"Next, let's look at the database connection. I'm using the pg library with a connection pool for efficient database access.

The pool is configured with SSL for secure connections to Neon, and I'm using a singleton pattern to prevent multiple pool instances in development mode. This is important because Next.js hot reloading can create multiple connections otherwise.

I've set up event listeners for connection success and errors, which helps with debugging during development.

The connection string comes from environment variables, which keeps credentials secure."

### Section 4: Utility Functions (1 minute)

**[Screen: Open src/lib/utils.ts]**

**Script:**

"The utils file contains five helper functions that are used throughout the application.

generateRandomCode creates a random 6-character alphanumeric string by randomly selecting from uppercase, lowercase, and numbers.

validateCode uses a regex pattern to ensure custom codes are 6-8 alphanumeric characters only.

validateUrl checks that URLs are valid HTTP or HTTPS URLs using JavaScript's URL constructor.

truncateUrl shortens long URLs for display in the table.

And formatDate converts timestamps to a readable format.

These pure functions make the code more maintainable and testable."

### Section 5: TypeScript Types (30 seconds)

**[Screen: Open src/lib/types.ts]**

**Script:**

"I've defined TypeScript interfaces for all the data structures in the application.

The Link interface matches our database schema.

CreateLinkRequest and CreateLinkResponse define the API contract for creating links.

And ErrorResponse provides a consistent error format.

Using TypeScript throughout the project catches bugs at compile time and provides excellent autocomplete in the editor."

### Section 6: API Routes - Create and List Links (1.5 minutes)

**[Screen: Open src/app/api/links/route.ts]**

**Script:**

"Now let's look at the API routes. This file handles two endpoints: POST to create links and GET to list all links.

In the POST handler, I first validate the URL format. If a custom code is provided, I validate it against the regex pattern. If not, I generate a random code.

There's collision detection here - if the random code already exists, I retry up to 5 times with a new code. This is unlikely but important for reliability.

Then I insert the link into the database using a parameterized query to prevent SQL injection.

If there's a duplicate code constraint violation - error code 23505 - I return a 409 Conflict status with a user-friendly message.

The GET handler is simpler - it just queries all links ordered by creation date and returns them as JSON.

Both handlers have proper error handling and return appropriate HTTP status codes."

### Section 7: API Routes - Single Link Operations (1 minute)

**[Screen: Open src/app/api/links/[code]/route.ts]**

**Script:**

"This file handles operations on individual links using dynamic routing.

The GET handler fetches a single link by its code and returns 404 if not found.

The DELETE handler removes a link from the database and also returns 404 if the link doesn't exist.

Both use parameterized queries for security and return consistent JSON responses."

### Section 8: Redirect Handler (1 minute)

**[Screen: Open src/app/[code]/route.ts]**

**Script:**

"This is one of the most important files - the redirect handler. When someone visits a short link, this code runs.

I'm using a database transaction here to ensure atomicity. First, I query for the link by its code. If it doesn't exist, I return a 404.

If the link exists, I update the clicks counter and last_clicked timestamp in a single atomic operation. This prevents race conditions if multiple people click the link simultaneously.

Finally, I perform a 302 redirect to the original URL. The 302 status code tells browsers this is a temporary redirect, which is correct for URL shorteners.

If anything goes wrong, the transaction rolls back automatically."

### Section 9: Frontend - Link Form Component (1 minute)

**[Screen: Open src/components/LinkForm.tsx]**

**Script:**

"Moving to the frontend, here's the LinkForm component. It's a controlled form with React state for the URL, custom code, loading state, and error/success messages.

The handleSubmit function makes a POST request to our API, handles the response, and updates the UI accordingly.

I've added proper form validation with HTML5 attributes like 'required' and 'pattern', plus client-side validation feedback.

The component shows loading states during submission, displays error messages in red, and success messages in green.

After successful creation, the form resets and notifies the parent component to refresh the links list."

### Section 10: Frontend - Links Table Component (1 minute)

**[Screen: Open src/components/LinksTable.tsx]**

**Script:**

"The LinksTable component displays all links with sorting, searching, and actions.

It uses React's useMemo hook to efficiently filter and sort links based on the search query and selected sort field.

The table has two views - a traditional table for desktop and a card layout for mobile, using Tailwind's responsive classes.

Each link has a copy button that uses the Clipboard API, and a delete button with confirmation.

The component handles loading and empty states gracefully, and all interactive elements have proper accessibility attributes."

### Section 11: Theme System (45 seconds)

**[Screen: Open src/components/ThemeProvider.tsx]**

**Script:**

"I implemented a custom theme system with light, dark, and system preference modes.

The ThemeProvider uses React Context to make the theme available throughout the app. It persists the user's choice in localStorage and automatically applies the theme by adding CSS classes to the document root.

The system theme option detects the user's OS preference using the prefers-color-scheme media query.

This provides a seamless experience across different lighting conditions."

### Section 12: Layout and Styling (45 seconds)

**[Screen: Open src/app/layout.tsx]**

**Script:**

"The root layout wraps the entire application with the ThemeProvider and includes global navigation.

I'm using the Inter font from Google Fonts for a clean, modern look.

The layout includes an ambient background component with animated gradient blobs, and a sticky navigation header that stays visible while scrolling.

All the glassmorphism effects are defined in the global CSS using Tailwind's custom utilities."

---

## 🔧 PART 4: DEVELOPMENT PROCESS (1.5 minutes)

**[Screen: Show docs/Development-Guide.md or README.md]**

**Script:**

"Let me briefly walk you through how I developed this project.

I started by setting up a Next.js project with TypeScript and Tailwind CSS. Then I created a PostgreSQL database on Neon and designed the schema.

Next, I built the backend API routes, starting with the health check endpoint, then the CRUD operations for links, and finally the redirect handler.

For the frontend, I created reusable components following React best practices - the form, table, and theme system.

I tested everything manually using curl commands and the browser, fixing bugs as I found them.

Finally, I deployed to Vercel, which was straightforward thanks to Next.js's built-in Vercel integration.

The entire development process took about 18-20 hours spread over two days, including documentation."

---

## 🎓 PART 5: CHALLENGES & LEARNINGS (1 minute)

**[Screen: Can show code or stay on README]**

**Script:**

"I encountered a few interesting challenges during development.

First, handling database connection pooling in Next.js development mode was tricky because of hot reloading. I solved this with the singleton pattern you saw earlier.

Second, implementing atomic click tracking required using database transactions to prevent race conditions. This ensures accurate statistics even under high traffic.

Third, making the UI fully responsive while maintaining the glassmorphism aesthetic required careful CSS work with Tailwind's responsive utilities.

I also learned a lot about Next.js 14's App Router, particularly how server and client components interact, and how to structure API routes for optimal performance.

Overall, this project reinforced the importance of proper error handling, type safety with TypeScript, and writing clean, maintainable code."

---

## 🚀 PART 6: FUTURE ENHANCEMENTS (30 seconds)

**[Screen: Show Context.md or stay on current screen]**

**Script:**

"There are several features I'd like to add in the future:

User authentication so people can manage their own links privately, link expiration dates for temporary URLs, QR code generation for easy mobile sharing, and an analytics dashboard with charts showing click trends over time.

I'd also add rate limiting to prevent abuse, and comprehensive testing with Jest and Playwright.

These enhancements would make TinyLink production-ready for real-world use at scale."

---

## 🎬 PART 7: CLOSING (30 seconds)

**[Screen: Show deployed app or GitHub repo]**

**Script:**

"To summarize, TinyLink is a full-stack URL shortener built with modern web technologies. It demonstrates my ability to design database schemas, build RESTful APIs, create responsive user interfaces, and deploy production-ready applications.

The code is clean, well-documented, and follows best practices throughout. You can find the complete source code on GitHub, and the live demo is deployed on Vercel.

Thank you for watching! If you have any questions about the implementation or want to discuss any part of the code, feel free to reach out."

**[Screen: Show final slide with links]**

- **Live Demo:** https://tinylink-live.vercel.app
- **GitHub:** https://github.com/manishborikar92/TinyLink
- **Email:** manishborikar92@gmail.com

---

## 📋 PRE-RECORDING CHECKLIST

### Environment Setup
- [ ] Close unnecessary applications and browser tabs
- [ ] Clear browser history/cache
- [ ] Set browser zoom to 100%
- [ ] Disable browser extensions that might interfere
- [ ] Set screen resolution to 1920x1080 (or 1280x720)
- [ ] Test microphone audio levels
- [ ] Close notification centers (Windows notifications, Slack, etc.)
- [ ] Disable desktop notifications

### Application Setup
- [ ] Deploy latest version to Vercel
- [ ] Test all features work on deployed version
- [ ] Clear database of test data (or prepare clean test data)
- [ ] Prepare example URLs to shorten:
  - https://github.com/yourusername/some-very-long-repository-name
  - https://www.example.com/another/very/long/url/path
  - https://docs.example.com/documentation/getting-started
- [ ] Have custom codes ready: "github", "demo", "test"
- [ ] Open VS Code with project
- [ ] Organize VS Code tabs in this order (open them now):

### Code Files to Open (in order)
1. `database/schema.sql`
2. `src/lib/db.ts`
3. `src/lib/utils.ts`
4. `src/lib/types.ts`
5. `src/app/api/links/route.ts`
6. `src/app/api/links/[code]/route.ts`
7. `src/app/[code]/route.ts`
8. `src/components/LinkForm.tsx`
9. `src/components/LinksTable.tsx`
10. `src/components/ThemeProvider.tsx`
11. `src/app/layout.tsx`
12. `README.md`
13. `docs/Development-Guide.md`

### Recording Setup
- [ ] Choose recording tool: Loom, OBS, or Zoom
- [ ] Set recording area (full screen or window)
- [ ] Enable microphone
- [ ] Disable webcam (unless required)
- [ ] Test recording 30 seconds to check:
  - Audio quality
  - Screen clarity
  - No background noise
- [ ] Have water nearby
- [ ] Have this script open on second monitor or printed

---

## 🎤 RECORDING TIPS

### Voice & Delivery
- **Speak clearly and at a moderate pace** - Aim for 140-160 words per minute
- **Use enthusiasm** - Show you're excited about what you built
- **Pause between sections** - Makes editing easier and gives viewers time to process
- **Avoid filler words** - "Um", "uh", "like", "you know", "basically"
- **Smile while talking** - It comes through in your voice
- **Vary your tone** - Don't speak in monotone
- **Emphasize key points** - Slightly louder or slower for important concepts

### Screen Recording
- **Move mouse slowly** - Fast movements are hard to follow
- **Highlight important code** - Use cursor to point at specific lines
- **Zoom in if needed** - Make sure text is readable (Ctrl/Cmd + Plus)
- **Don't scroll too fast** - Give viewers time to read
- **Use keyboard shortcuts** - Looks professional (Ctrl+P for file search)
- **Pause on important screens** - Let viewers absorb information
- **Keep cursor visible** - Don't hide it off-screen

### Pacing
- **Introduction:** Energetic, welcoming (faster pace)
- **Demo:** Smooth, confident (moderate pace)
- **Code:** Slower, explanatory (give time to read)
- **Challenges:** Reflective, honest (moderate pace)
- **Closing:** Upbeat, professional (moderate pace)

### Common Mistakes to Avoid
- ❌ Apologizing for code ("This isn't perfect but...")
- ❌ Going too deep into implementation details
- ❌ Forgetting to show the actual working app
- ❌ Speaking in monotone
- ❌ Not testing features before recording
- ❌ Having typos or errors in code
- ❌ Forgetting to mention key technologies
- ❌ Rushing through important sections
- ❌ Not explaining WHY you made certain decisions

### If You Make a Mistake
- **Small mistake (stumbled word):** Keep going, don't acknowledge it
- **Medium mistake (wrong info):** Pause, say "Let me correct that", and redo
- **Big mistake (wrong screen):** Pause, say "Let me show you that again", and redo the section
- **Technical issue:** Pause recording, fix it, resume from last good point

---

## 📝 ALTERNATIVE SCRIPT VARIATIONS

### For a Shorter Video (5-6 minutes)
Skip or shorten:
- Detailed code walkthrough (just show 2-3 key files)
- Development process section
- Future enhancements section

Focus on:
- Live demo (2 minutes)
- High-level architecture (2 minutes)
- Key technical decisions (1 minute)

### For a Technical Interview
Emphasize:
- Problem-solving approach
- Why you chose specific technologies
- Trade-offs and alternatives considered
- How you handled challenges
- Testing and error handling strategies

### For a Portfolio Showcase
Lead with:
- Visual design and UX
- Mobile responsiveness
- Unique features (glassmorphism, theme system)
- User-facing functionality

---

## 🎬 POST-RECORDING

### Editing Checklist
- [ ] Trim dead air at beginning/end
- [ ] Remove long pauses or mistakes
- [ ] Add title card with project name (first 3 seconds)
- [ ] Add end card with links (last 5 seconds)
- [ ] Check audio levels are consistent throughout
- [ ] Add subtle background music (optional, keep it quiet)
- [ ] Export in 1080p MP4 format

### Publishing Checklist
- [ ] Upload to YouTube or Loom
- [ ] Set appropriate title: "TinyLink - Full Stack URL Shortener (Next.js, TypeScript, PostgreSQL)"
- [ ] Write description with links (see template below)
- [ ] Add timestamps in description
- [ ] Set thumbnail (screenshot of app homepage)
- [ ] Set visibility to Public or Unlisted
- [ ] Share link in your submission

### YouTube Description Template
```
TinyLink - A modern URL shortener built with Next.js 16, TypeScript, and PostgreSQL

🔗 Live Demo: https://your-app.vercel.app
💻 GitHub: https://github.com/manishborikar92/tinylink
📧 Contact: your.email@example.com

⏱️ Timestamps:
0:00 - Introduction
1:00 - Live Demo
4:00 - Code Walkthrough: Database & Backend
7:00 - Code Walkthrough: Frontend
9:00 - Development Process & Challenges
10:30 - Future Enhancements
11:00 - Closing

🛠️ Tech Stack:
- Next.js 16 (App Router)
- TypeScript
- React 19
- Tailwind CSS 4
- PostgreSQL (Neon)
- Vercel

✨ Features:
- Custom & random short codes
- Real-time click tracking
- Responsive design
- Dark mode support
- RESTful API
- Full TypeScript
- Production-ready error handling

📚 What I Learned:
- Next.js 14 App Router architecture
- PostgreSQL connection pooling
- Atomic database transactions
- TypeScript best practices
- Responsive UI design
- Deployment on Vercel

#NextJS #TypeScript #PostgreSQL #WebDevelopment #FullStack #URLShortener
```

---

## 💡 FINAL TIPS

1. **Practice first** - Do a dry run without recording to get comfortable
2. **Stay hydrated** - Have water nearby, take sips between sections
3. **Take breaks** - If recording in sections, take 5-minute breaks
4. **Be yourself** - Don't try to sound overly formal or robotic
5. **Show passion** - Let your enthusiasm for the project come through
6. **Time yourself** - Aim for 10-12 minutes total
7. **Review before publishing** - Watch the full video once before uploading

---

**Good luck with your recording! You've built something impressive - now show it off with confidence! 🚀**
