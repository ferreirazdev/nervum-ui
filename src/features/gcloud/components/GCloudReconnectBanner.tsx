import { Link } from 'react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/app/components/ui/button';
import { cn } from '@/app/components/ui/utils';

type Props = {
  className?: string;
};

export function GCloudReconnectBanner({ className }: Props) {
  const { t } = useTranslation('dashboard');
  return (
    <div
      className={cn(
        'flex flex-wrap items-center justify-between gap-3 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3',
        className
      )}
    >
      <p className="text-sm text-destructive dark:text-red-300">{t('gcloudReconnect.message')}</p>
      <Button asChild size="sm" variant="secondary">
        <Link to="/integrations">{t('gcloudReconnect.cta')}</Link>
      </Button>
    </div>
  );
}
