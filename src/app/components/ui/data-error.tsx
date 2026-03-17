import { AlertCircle } from 'lucide-react';
import { Button } from '@/app/components/ui/button';
import { cn } from './utils';

interface DataErrorProps {
  message?: string;
  onRetry?: () => void;
  className?: string;
}

export function DataError({
  message = 'Something went wrong. Please try again.',
  onRetry,
  className,
}: DataErrorProps) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-6 text-center',
        className
      )}
      role="alert"
    >
      <AlertCircle className="size-8 shrink-0 text-destructive/80" aria-hidden />
      <p className="text-sm text-foreground">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try again
        </Button>
      )}
    </div>
  );
}
