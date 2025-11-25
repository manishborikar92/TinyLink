# TinyLink Theme System

TinyLink features a **"Premium Frosted Glass"** aesthetic inspired by macOS and iOS design language.

This style relies on **neutral tones (Zinc)**, **soft ambient gradients**, and **heavy blurs**. It feels clean, professional, and tangible.

## Current Implementation

The theme system is fully implemented with:
- ✅ Light, Dark, and System theme modes
- ✅ Glassmorphism design with backdrop blur
- ✅ Animated gradient background blobs
- ✅ Theme persistence via localStorage
- ✅ Smooth transitions between themes

For complete documentation, see `docs/Glassmorphism-Guide.md`.

## Quick Reference

### Tailwind Configuration

TinyLink uses **Tailwind CSS v4** with inline theme configuration in `globals.css`.

The configuration includes:
- Zinc color palette for premium neutral tones
- CSS variables for glass effects
- Blob animation keyframes
- Dark mode support via class strategy

### Global Styles (`src/app/globals.css`)

The glassmorphism system is defined in `globals.css`:

**CSS Variables:**
```css
:root {
  /* Light Mode */
  --background: #f4f4f5; /* Zinc-100 */
  --foreground: #18181b; /* Zinc-900 */
  --glass-border: rgba(255, 255, 255, 0.5);
  --glass-surface: rgba(255, 255, 255, 0.7);
}

.dark {
  /* Dark Mode */
  --background: #09090b; /* Zinc-950 */
  --foreground: #f4f4f5; /* Zinc-100 */
  --glass-border: rgba(255, 255, 255, 0.1);
  --glass-surface: rgba(24, 24, 27, 0.6);
}
```

**Glass Utilities:**
```css
.glass-panel {
  backdrop-filter: blur(24px);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
}

.glass-subtle {
  backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--glass-surface) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 50%, transparent);
}
```

### Ambient Background Component

**File:** `src/components/AmbientBackground.tsx`

Creates animated gradient blobs that provide depth for the glass effect:

```typescript
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Three animated gradient blobs with different colors and delays */}
      <div className="absolute top-0 left-1/4 w-96 h-96 
                      bg-blue-400/30 dark:bg-blue-600/20 
                      rounded-full mix-blend-multiply dark:mix-blend-normal
                      filter blur-3xl opacity-70 animate-blob">
      </div>
      
      <div className="absolute top-0 right-1/4 w-96 h-96 
                      bg-indigo-400/30 dark:bg-indigo-600/20 
                      rounded-full mix-blend-multiply dark:mix-blend-normal
                      filter blur-3xl opacity-70 animate-blob animation-delay-2000">
      </div>
      
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 
                      bg-pink-300/30 dark:bg-pink-600/10 
                      rounded-full mix-blend-multiply dark:mix-blend-normal
                      filter blur-3xl opacity-70 animate-blob animation-delay-4000">
      </div>
    </div>
  );
}
```

### Layout Integration

**File:** `src/app/layout.tsx`

The root layout integrates all theme components:

```typescript
'use client';

import { Inter } from 'next/font/google';
import { ThemeProvider } from '@/components/ThemeProvider';
import AmbientBackground from '@/components/AmbientBackground';
import Navigation from '@/components/Navigation';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <title>TinyLink - URL Shortener</title>
        <meta name="description" content="Shorten URLs and track click statistics" />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <AmbientBackground />
          <div className="relative min-h-screen flex flex-col">
            <header className="sticky top-0 z-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Navigation />
              </div>
            </header>
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
```

### Component Examples

**Navigation Component** (`src/components/Navigation.tsx`):

```typescript
import Logo from './Logo';
import { ThemeToggle } from './ThemeToggle';

export default function Navigation() {
  return (
    <nav className="glass-panel rounded-2xl px-6 py-3">
      <div className="flex items-center justify-between">
        <a href="/" className="flex items-center gap-3">
          <Logo className="w-8 h-8" color="text-blue-600 dark:text-blue-400" />
          <span className="text-xl font-bold tracking-tight">TinyLink</span>
        </a>
        <ThemeToggle />
      </div>
    </nav>
  );
}
```

**Glass Form** (`src/components/LinkForm.tsx`):

```typescript
<div className="glass-panel rounded-2xl p-6">
  <h2 className="text-xl font-bold mb-6">Create Short Link</h2>
  <form className="space-y-5">
    <input
      type="url"
      className="w-full px-4 py-3 glass-subtle rounded-xl 
                 focus:ring-2 focus:ring-blue-500"
      placeholder="https://example.com"
    />
    <button className="w-full px-6 py-4 bg-blue-600 text-white 
                       rounded-xl hover:bg-blue-700 transition-all">
      Create Short Link
    </button>
  </form>
</div>
```

**Glass Table** (`src/components/LinksTable.tsx`):

```typescript
<div className="glass-panel rounded-2xl overflow-hidden">
  <table className="min-w-full divide-y divide-zinc-200 dark:divide-zinc-700">
    <thead className="backdrop-blur-sm">
      <tr>
        <th className="px-6 py-3 text-left text-xs font-medium 
                       text-zinc-600 dark:text-zinc-400 uppercase">
          Code
        </th>
        {/* ... */}
      </tr>
    </thead>
    <tbody className="divide-y divide-zinc-200 dark:divide-zinc-700">
      {/* ... */}
    </tbody>
  </table>
</div>
```

## Visual Result

**Light Mode:**
- Frosted glass panels floating over soft gradient background
- White glass with 70% opacity
- Subtle blue, indigo, and pink blobs
- High contrast text (Zinc-900) for readability

**Dark Mode:**
- Smoked glass panels with darker transparency
- Zinc-900 glass with 60% opacity
- Dimmer, glowing background blobs
- High contrast text (Zinc-100) for readability

**System Mode:**
- Automatically matches user's OS preference
- Seamless switching between light and dark
- Persists user's choice to localStorage

## Key Features

✅ **Three Theme Modes:** Light, Dark, System  
✅ **Glassmorphism Design:** Backdrop blur with frosted glass effect  
✅ **Animated Background:** Organic blob movement  
✅ **Theme Persistence:** Saves preference to localStorage  
✅ **Smooth Transitions:** 300ms color transitions  
✅ **Accessibility:** High contrast, keyboard navigation, ARIA labels  
✅ **Mobile Responsive:** Touch-friendly, adapts to all screen sizes  

## Further Reading

For complete implementation details, customization options, and troubleshooting:
- See `docs/Glassmorphism-Guide.md`
- Check component files in `src/components/`
- Review `src/app/globals.css` for utilities