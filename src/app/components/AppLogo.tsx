import { cn } from '@/app/components/ui/utils';

interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Nervum"
      width={875}
      height={247}
      className={cn('block min-w-0 object-contain object-left', className ?? 'h-10 w-auto')}
    />
  );
}
