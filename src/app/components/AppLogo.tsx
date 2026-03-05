interface AppLogoProps {
  className?: string;
}

export function AppLogo({ className }: AppLogoProps) {
  return (
    <img
      src="/logo.png"
      alt="Nervum"
      className={className ?? 'h-8 w-auto'}
    />
  );
}
