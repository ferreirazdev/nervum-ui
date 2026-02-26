import { Search, Command } from 'lucide-react';
import { useState } from 'react';

export function CommandBar() {
  const [isFocused, setIsFocused] = useState(false);

  return (
    <div className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-full max-w-2xl px-4">
      <div
        className={`
          relative rounded-xl border backdrop-blur-md transition-all duration-200
          bg-card border-border
          ${isFocused ? 'border-primary/50 shadow-lg shadow-primary/20' : ''}
        `}
      >
        <div className="flex items-center gap-3 px-4 py-3">
          <Search className="text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search services, teams, or infrastructure..."
            className="bg-transparent text-foreground placeholder:text-muted-foreground flex-1 text-sm outline-none"
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
          />
          <div className="flex items-center gap-1 rounded-md border border-border bg-muted px-2 py-1">
            <Command className="text-muted-foreground h-3 w-3" />
            <span className="text-muted-foreground text-xs">K</span>
          </div>
        </div>
      </div>
    </div>
  );
}