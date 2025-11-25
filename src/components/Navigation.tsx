import Logo from '@/components/Logo';
import { ThemeToggle } from '@/components/ThemeToggle';

export default function Navigation() {
  return (
    <nav className="glass-panel rounded-2xl px-4 sm:px-6 lg:px-8">
      <div className="px-4 sm:px-6 py-3">
        <div className="flex items-center justify-between">
          {/* Logo and Brand */}
          <a 
            href="/" 
            className="flex items-center gap-2 sm:gap-3 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg transition-colors"
          >
            <Logo className="w-7 h-7 sm:w-8 sm:h-8 flex-shrink-0" color="text-blue-600 dark:text-blue-400" />
            <span className="text-lg sm:text-xl font-bold tracking-tight">TinyLink</span>
          </a>
          
          {/* Right Side Actions */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Status Link */}
            <a 
              href="/api/healthz" 
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Status
            </a>
            
            {/* Theme Toggle */}
            <ThemeToggle />
          </div>
        </div>
      </div>
    </nav>
  );
}