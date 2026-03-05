import { cn } from '@/app/components/ui/utils';

type ComingSoonBadgeProps = {
  className?: string;
};

export function ComingSoonBadge({ className }: ComingSoonBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border border-border bg-muted/50 px-2 py-0.5 text-xs font-medium text-muted-foreground',
        className,
      )}
    >
      Coming soon
    </span>
  );
}
