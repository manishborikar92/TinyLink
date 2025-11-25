# TinyLink Logo Component

## Design Concept

The TinyLink logo represents the core functionality of URL shortening through a simple, recognizable link icon.

**Design Elements:**
- **Symbol:** Two interlocking chain links (representing URL connections)
- **Style:** Clean, minimal SVG with stroke-based design
- **Color:** Primary Blue (`#2563EB` / Blue-600) with dark mode variant
- **Adaptability:** Theme-aware, changes color based on light/dark mode

---

## Current Implementation

The logo is implemented as a reusable React component with TypeScript.

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

## Usage Examples

### In Navigation

```typescript
import Logo from './Logo';

<a href="/" className="flex items-center gap-3">
  <Logo className="w-8 h-8" color="text-blue-600 dark:text-blue-400" />
  <span className="text-xl font-bold">TinyLink</span>
</a>
```

### Different Sizes

```typescript
{/* Small */}
<Logo className="w-5 h-5" />

{/* Medium (default) */}
<Logo className="w-8 h-8" />

{/* Large */}
<Logo className="w-12 h-12" />

{/* Extra Large */}
<Logo className="w-16 h-16" />
```

### Custom Colors

```typescript
{/* Red accent */}
<Logo color="text-red-600 dark:text-red-400" />

{/* Green accent */}
<Logo color="text-green-600 dark:text-green-400" />

{/* Zinc (neutral) */}
<Logo color="text-zinc-600 dark:text-zinc-400" />
```

---

## Favicon

The app uses a simple favicon located at `src/app/favicon.ico`.

For a custom favicon, you can:

1. **Replace the existing file** at `src/app/favicon.ico`
2. **Use Next.js icon generation** (create `src/app/icon.tsx`)
3. **Add multiple sizes** for different devices

### Programmatic Icon Generation (Optional)

Create `src/app/icon.tsx`:

```typescript
import { ImageResponse } from 'next/og';

export const size = {
  width: 32,
  height: 32,
};

export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          background: '#2563EB',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '20%',
        }}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="3"
        >
          <path d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
        </svg>
      </div>
    ),
    { ...size }
  );
}
```

---

## Accessibility

The logo component includes:
- ✅ `aria-hidden="true"` - Decorative, not read by screen readers
- ✅ Semantic HTML with proper SVG structure
- ✅ Theme-aware colors for visibility
- ✅ Scalable vector format (crisp at any size)

When used in navigation, the parent `<a>` tag provides the accessible label.

---

## Design Rationale

**Why a link icon?**
- Instantly communicates the app's purpose
- Universal symbol for URLs and connections
- Simple, recognizable shape

**Why stroke-based?**
- Lighter visual weight
- Works well at small sizes
- Matches modern UI trends
- Easier to theme/color

**Why theme-aware colors?**
- Maintains visibility in both light and dark modes
- Consistent with glassmorphism design
- Professional appearance