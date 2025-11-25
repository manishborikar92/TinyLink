# Glassmorphism Design System Guide

## Overview

TinyLink features a **Premium Frosted Glass** aesthetic inspired by macOS and iOS design language. This guide explains the glassmorphism implementation, theme system, and how to use the design components.

---

## Design Philosophy

### Visual Characteristics
- **Frosted glass panels** with backdrop blur effects
- **Neutral Zinc palette** for premium, professional look
- **Animated gradient blobs** in the background for depth
- **Smooth transitions** between light and dark themes
- **High contrast text** for readability through glass

### Color Palette

**Light Mode:**
- Background: `#f4f4f5` (Zinc-100)
- Foreground: `#18181b` (Zinc-900)
- Glass Surface: `rgba(255, 255, 255, 0.7)` - White with 70% opacity
- Glass Border: `rgba(255, 255, 255, 0.5)` - White with 50% opacity

**Dark Mode:**
- Background: `#09090b` (Zinc-950)
- Foreground: `#f4f4f5` (Zinc-100)
- Glass Surface: `rgba(24, 24, 27, 0.6)` - Zinc-900 with 60% opacity
- Glass Border: `rgba(255, 255, 255, 0.1)` - White with 10% opacity

**Accent Colors:**
- Primary Blue: `#2563EB` (Blue-600)
- Used sparingly for CTAs and interactive elements

---

## Core Components

### 1. AmbientBackground

Creates animated gradient blobs that float behind glass panels.

**File:** `src/components/AmbientBackground.tsx`

```typescript
export default function AmbientBackground() {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Soft Blue Blob */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob dark:bg-blue-600/20 dark:mix-blend-normal"></div>
      
      {/* Soft Purple/Indigo Blob */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-indigo-400/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-2000 dark:bg-indigo-600/20 dark:mix-blend-normal"></div>
      
      {/* Soft Pink Blob */}
      <div className="absolute -bottom-32 left-1/3 w-96 h-96 bg-pink-300/30 rounded-full mix-blend-multiply filter blur-3xl opacity-70 animate-blob animation-delay-4000 dark:bg-pink-600/10 dark:mix-blend-normal"></div>
    </div>
  );
}
```

**Features:**
- Three animated gradient blobs
- Different animation delays for organic movement
- Adapts colors for dark mode
- Fixed positioning, doesn't interfere with content

### 2. ThemeProvider

Manages theme state and persistence.

**File:** `src/components/ThemeProvider.tsx`

```typescript
'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark' | 'system';

interface ThemeProviderProps {
  children: React.ReactNode;
  attribute?: string;
  defaultTheme?: Theme;
  enableSystem?: boolean;
}

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({
  children,
  attribute = 'class',
  defaultTheme = 'system',
  enableSystem = true,
}: ThemeProviderProps) {
  const [theme, setTheme] = useState<Theme>(defaultTheme);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const stored = localStorage.getItem('theme') as Theme;
    if (stored) {
      setTheme(stored);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const root = document.documentElement;
    root.classList.remove('light', 'dark');

    if (theme === 'system' && enableSystem) {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    localStorage.setItem('theme', theme);
  }, [theme, mounted, enableSystem]);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
```

**Features:**
- Three theme modes: Light, Dark, System
- Persists theme choice to localStorage
- Respects system preferences
- Prevents hydration mismatch with mounted state

### 3. ThemeToggle

Button to cycle through theme modes.

**File:** `src/components/ThemeToggle.tsx`

```typescript
'use client';

import { useTheme } from './ThemeProvider';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
      aria-label="Toggle theme"
      title={`Current theme: ${theme}`}
    >
      {/* Sun icon for light mode */}
      {/* Moon icon for dark mode */}
      {/* Monitor icon for system mode */}
    </button>
  );
}
```

**Cycle Order:**
1. Light → Dark
2. Dark → System
3. System → Light

### 4. Navigation

Glass navigation bar with logo and theme toggle.

**File:** `src/components/Navigation.tsx`

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

### 5. Logo

SVG link icon component.

**File:** `src/components/Logo.tsx`

```typescript
interface LogoProps {
  className?: string;
  color?: string;
}

export default function Logo({ 
  className = "w-8 h-8", 
  color = "text-blue-600 dark:text-blue-400" 
}: LogoProps) {
  return (
    <svg 
      className={className} 
      viewBox="0 0 24 24" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path 
        d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        className={color}
      />
    </svg>
  );
}
```

---

## Glass Utilities

### CSS Classes

**File:** `src/app/globals.css`

#### `.glass-panel`
Heavy blur for primary containers.

```css
.glass-panel {
  backdrop-filter: blur(24px);
  -webkit-backdrop-filter: blur(24px);
  background: var(--glass-surface);
  border: 1px solid var(--glass-border);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
}
```

**Usage:**
```tsx
<div className="glass-panel rounded-2xl p-6">
  {/* Content */}
</div>
```

#### `.glass-subtle`
Light blur for secondary elements.

```css
.glass-subtle {
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  background: color-mix(in srgb, var(--glass-surface) 50%, transparent);
  border: 1px solid color-mix(in srgb, var(--glass-border) 50%, transparent);
}
```

**Usage:**
```tsx
<input className="glass-subtle rounded-xl px-4 py-3" />
```

### Animation Classes

#### `.animate-blob`
Slow, organic movement for background elements.

```css
.animate-blob {
  animation: blob 10s infinite;
}

@keyframes blob {
  0% { transform: translate(0px, 0px) scale(1); }
  33% { transform: translate(30px, -50px) scale(1.1); }
  66% { transform: translate(-20px, 20px) scale(0.9); }
  100% { transform: translate(0px, 0px) scale(1); }
}
```

**Delay Utilities:**
- `.animation-delay-2000` - 2 second delay
- `.animation-delay-4000` - 4 second delay

---

## Usage Examples

### Creating a Glass Card

```tsx
<div className="glass-panel rounded-2xl p-6">
  <h2 className="text-xl font-bold mb-4">Card Title</h2>
  <p className="text-zinc-600 dark:text-zinc-400">
    Card content with proper contrast
  </p>
</div>
```

### Glass Form Input

```tsx
<input
  type="text"
  className="w-full px-4 py-3 glass-subtle rounded-xl 
             focus:ring-2 focus:ring-blue-500 
             focus:border-transparent
             placeholder:text-zinc-400 dark:placeholder:text-zinc-600"
  placeholder="Enter text..."
/>
```

### Glass Button

```tsx
<button className="px-6 py-3 glass-panel rounded-xl 
                   hover:bg-zinc-100/50 dark:hover:bg-zinc-800/50
                   transition-all">
  Click Me
</button>
```

### Themed Text Colors

```tsx
{/* Primary text */}
<h1 className="text-zinc-900 dark:text-zinc-100">Heading</h1>

{/* Secondary text */}
<p className="text-zinc-600 dark:text-zinc-400">Description</p>

{/* Muted text */}
<span className="text-zinc-500 dark:text-zinc-500">Label</span>
```

---

## Best Practices

### 1. Contrast and Readability
- Always use high-contrast text colors (Zinc-900/Zinc-100)
- Test readability in both light and dark modes
- Avoid placing light text on light glass or dark text on dark glass

### 2. Glass Hierarchy
- Use `.glass-panel` for primary containers (cards, modals, navigation)
- Use `.glass-subtle` for secondary elements (inputs, secondary buttons)
- Don't nest glass panels more than 2 levels deep

### 3. Background Requirements
- Glass effects require something behind them to blur
- Always include `<AmbientBackground />` in your layout
- Ensure background has sufficient visual interest

### 4. Performance
- Backdrop blur can be expensive on low-end devices
- Use `-webkit-backdrop-filter` for Safari support
- Consider reducing blur intensity on mobile

### 5. Accessibility
- Maintain WCAG AA contrast ratios (4.5:1 for text)
- Ensure focus states are visible through glass
- Test with screen readers
- Provide theme toggle for user preference

---

## Customization

### Adjusting Blur Intensity

Edit `globals.css`:

```css
.glass-panel {
  backdrop-filter: blur(32px); /* Increase for heavier blur */
}

.glass-subtle {
  backdrop-filter: blur(8px); /* Decrease for lighter blur */
}
```

### Changing Glass Opacity

Edit CSS variables in `globals.css`:

```css
:root {
  --glass-surface: rgba(255, 255, 255, 0.8); /* More opaque */
}

.dark {
  --glass-surface: rgba(24, 24, 27, 0.7); /* More opaque */
}
```

### Modifying Blob Colors

Edit `AmbientBackground.tsx`:

```tsx
{/* Change from blue to green */}
<div className="... bg-green-400/30 ... dark:bg-green-600/20"></div>
```

### Adding More Blobs

```tsx
<div className="absolute bottom-0 right-0 w-96 h-96 
                bg-purple-400/30 rounded-full 
                mix-blend-multiply filter blur-3xl 
                opacity-70 animate-blob animation-delay-6000 
                dark:bg-purple-600/20 dark:mix-blend-normal">
</div>
```

---

## Browser Support

### Backdrop Filter Support
- ✅ Chrome 76+
- ✅ Safari 9+ (with `-webkit-` prefix)
- ✅ Firefox 103+
- ✅ Edge 79+

### Fallback for Unsupported Browsers

```css
@supports not (backdrop-filter: blur(24px)) {
  .glass-panel {
    background: rgba(255, 255, 255, 0.95); /* More opaque fallback */
  }
  
  .dark .glass-panel {
    background: rgba(24, 24, 27, 0.95);
  }
}
```

---

## Troubleshooting

### Glass Effect Not Visible
- Ensure `<AmbientBackground />` is included in layout
- Check that parent elements don't have `overflow: hidden`
- Verify backdrop-filter is supported in your browser

### Theme Not Persisting
- Check localStorage is enabled
- Verify `suppressHydrationWarning` is on `<html>` tag
- Ensure ThemeProvider wraps entire app

### Performance Issues
- Reduce blur intensity on mobile
- Limit number of glass panels on screen
- Use `will-change: backdrop-filter` sparingly

### Dark Mode Not Working
- Verify `darkMode: 'class'` in Tailwind config (v4 uses inline theme)
- Check ThemeProvider is applying class to `<html>`
- Ensure dark: variants are used correctly

---

## Migration from Solid Design

If migrating from a solid background design:

1. **Add ThemeProvider** to layout
2. **Add AmbientBackground** component
3. **Replace solid backgrounds** with glass utilities:
   - `bg-white` → `glass-panel`
   - `bg-gray-100` → `glass-subtle`
4. **Update text colors** to Zinc palette:
   - `text-gray-900` → `text-zinc-900 dark:text-zinc-100`
   - `text-gray-600` → `text-zinc-600 dark:text-zinc-400`
5. **Add dark mode variants** to all components
6. **Test contrast** in both themes

---

## Resources

- [Glassmorphism.com](https://glassmorphism.com/) - Glass effect generator
- [Tailwind CSS Dark Mode](https://tailwindcss.com/docs/dark-mode)
- [MDN: backdrop-filter](https://developer.mozilla.org/en-US/docs/Web/CSS/backdrop-filter)
- [WCAG Contrast Guidelines](https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html)
