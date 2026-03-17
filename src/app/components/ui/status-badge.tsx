const statusStyles: Record<string, string> = {
  healthy:
    'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
  warning:
    'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
  critical:
    'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
  open: 'bg-primary/10 border-primary/30 text-primary',
  merged:
    'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
  closed: 'bg-muted border-border text-muted-foreground',
  success:
    'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
  failure:
    'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
  failed:
    'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
  working:
    'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
  deploying:
    'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
  active:
    'bg-emerald-100 border-emerald-200 text-emerald-800 dark:bg-emerald-500/20 dark:border-emerald-500/30 dark:text-emerald-400',
  info: 'bg-primary/10 border-primary/30 text-primary',
  error:
    'bg-rose-100 border-rose-200 text-rose-800 dark:bg-rose-500/20 dark:border-rose-500/30 dark:text-rose-400',
  degraded:
    'bg-amber-100 border-amber-200 text-amber-800 dark:bg-amber-500/20 dark:border-amber-500/30 dark:text-amber-400',
  unknown: 'bg-muted border-border text-muted-foreground',
};

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles.healthy;
  return (
    <span className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${style}`}>
      {status}
    </span>
  );
}
