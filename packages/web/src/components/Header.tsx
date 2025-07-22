import { Sparkles } from 'lucide-react';

export function Header() {
  return (
    <header className="border-b bg-white/50 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-6 h-6 text-brand-600" />
            <span className="text-xl font-semibold text-slate-900">Motif</span>
            <span className="text-sm text-slate-500">v0.1.0</span>
          </div>
          
          <nav className="flex items-center space-x-6">
            <a
              href="https://github.com/yourusername/motif"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              GitHub
            </a>
            <a
              href="/docs"
              className="text-sm text-slate-600 hover:text-slate-900 transition-colors"
            >
              Docs
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
} 