We will pivot away aesthetic to a **"Premium Frosted Glass"** aesthetic (similar to macOS or iOS).

This style relies on **neutral tones (Zinc)**, **soft ambient gradients**, and **heavy blurs**. It feels clean, professional, and tangible.

Here is **Clean Glassmorphism** theme setup.

### Step 1: Update `tailwind.config.js`

We are switching the palette to **Zinc** (a premium, neutral gray) and adding an animation for "floating" background blobs, which are essential to make the glass effect visible.

```javascript
/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,jsx}',
    './components/**/*.{js,jsx}',
    './app/**/*.{js,jsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Using standard Tailwind Zinc palette for that premium "tech" feel
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "#2563EB", // The Blue-600 you had, but used sparingly
          foreground: "#FFFFFF",
        },
        glass: {
          border: "var(--glass-border)",
          surface: "var(--glass-surface)",
        }
      },
      animation: {
        'blob': 'blob 10s infinite', // Slow movement for background orbs
      },
      keyframes: {
        blob: {
          '0%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
          '100%': { transform: 'translate(0px, 0px) scale(1)' },
        },
      },
    },
  },
  plugins: [],
}
```

### Step 2: Update `app/globals.css`

This is where the magic happens. We define variables for "Glass" surfaces that change opacity based on the theme.

  * **Light Mode:** White glass with high transparency (like a window).
  * **Dark Mode:** Black/Zinc glass with lower transparency (like smoked glass).

<!-- end list -->

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* Light Mode */
    --background: #f4f4f5; /* Zinc-100 */
    --foreground: #18181b; /* Zinc-900 */
    
    /* Glass Variables */
    --glass-border: rgba(255, 255, 255, 0.5);
    --glass-surface: rgba(255, 255, 255, 0.7);
  }

  .dark {
    /* Dark Mode */
    --background: #09090b; /* Zinc-950 */
    --foreground: #f4f4f5; /* Zinc-100 */
    
    /* Glass Variables */
    --glass-border: rgba(255, 255, 255, 0.1);
    --glass-surface: rgba(24, 24, 27, 0.6); /* Zinc-900 with opacity */
  }
}

@layer utilities {
  /* The Main Glass Utility */
  .glass-panel {
    @apply backdrop-blur-xl bg-[var(--glass-surface)] border border-[var(--glass-border)] shadow-lg;
  }
  
  /* A subtler glass for secondary items */
  .glass-subtle {
    @apply backdrop-blur-md bg-[var(--glass-surface)]/50 border border-[var(--glass-border)]/50;
  }
}

body {
  @apply bg-background text-foreground transition-colors duration-300 antialiased;
}
```

### Step 3: Create the "Ambient Background"

Glassmorphism looks flat if there is nothing behind it to blur. We will create a background component with soft, moving color blobs.

Create `components/AmbientBackground.js`:

```javascript
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft Blue Blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-blue-600/20 dark:mix-blend-normal"></div>
      
      {/* Soft Purple/Indigo Blob */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-600/20 dark:mix-blend-normal"></div>
      
      {/* Soft Pink Blob (lower) */}
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600/10 dark:mix-blend-normal"></div>
    </div>
  );
}
```

### Step 4: Apply to Layout

Update `app/layout.js` to include the `ThemeProvider` (from the previous step) and our new `AmbientBackground`.

```javascript
import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider'; // From previous step
import AmbientBackground from '@/components/AmbientBackground';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AmbientBackground />
          <div className="relative min-h-screen flex flex-col">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Step 5: Update Components to use `.glass-panel`

Here is how **Header** and **Link Table** should look now.

**Updated `components/Header.js`:**

```javascript
import { ThemeToggle } from './ThemeToggle';
import Logo from './Logo';

export default function Header() {
  return (
    // "glass-panel" applies the blur, border, and background color automatically
    <nav className="sticky top-4 mx-4 md:mx-auto max-w-7xl z-50 glass-panel rounded-2xl mt-4">
      <div className="px-6 py-3">
        <div className="flex items-center justify-between">
          <a href="/" className="flex items-center gap-3">
            <Logo className="w-8 h-8" color="text-blue-600 dark:text-blue-400" />
            <span className="text-xl font-bold tracking-tight">TinyLink</span>
          </a>
          
          <div className="flex items-center gap-4">
            <span className="hidden sm:block text-xs font-medium px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
              v1.0
            </span>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}
```

**Updated `components/LinksTable.js` container:**

```javascript
// Wrap table in this div
<div className="glass-panel rounded-xl overflow-hidden mt-8">
  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
    <thead className="bg-zinc-50/50 dark:bg-zinc-900/50">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase tracking-wider">Short Code</th>
        {/* ... other headers ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
      {/* ... table rows ... */}
    </tbody>
  </table>
</div>
```

### The Result

  * **Light Mode:** Feels like frosted glass floating over a white surface with very subtle blue/purple soft shadows in the background.
  * **Dark Mode:** Feels like smoked glass (dark grey transparency) with glowing dim lights behind it.
  * **No Neon:** No harsh lines or bright green/pink gradients.
  * **Legible:** High contrast text (Zinc-900/Zinc-50) ensures readability through the blur.