import Logo from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navigation() {
  return (
    <nav className="glass-panel rounded-2xl shadow-lg backdrop-blur-xl">
      <div className="px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <a 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg px-2 py-1 -ml-2 transition-all hover:bg-blue-50 dark:hover:bg-blue-950/30 group"
          >
            <Logo className="w-8 h-8 sm:w-9 sm:h-9 flex-shrink-0 group-hover:scale-110 transition-transform" color="text-blue-600 dark:text-blue-400" />
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold tracking-tight leading-none">TinyLink</span>
              <span className="text-[10px] sm:text-xs text-zinc-500 dark:text-zinc-400 font-medium">URL Shortener</span>
            </div>
          </a>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Status Badge */}
            <a 
              href="/api/healthz" 
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50 transition-all focus:outline-none focus:ring-2 focus:ring-green-500 shadow-sm hover:shadow"
              aria-label="Check API status"
            >
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              <span className="hidden sm:inline">Status</span>
            </a>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}