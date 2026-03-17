import { Loader2 } from 'lucide-react';
import { cn } from './utils';

interface DataLoadingProps {
  className?: string;
  message?: string;
}

export function DataLoading({ className, message = 'Loading…' }: DataLoadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-2 py-8 text-muted-foreground',
        className
      )}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-6 animate-spin shrink-0" aria-hidden />
      <p className="text-sm">{message}</p>
    </div>
  );
}
