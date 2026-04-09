import { useTranslation } from 'react-i18next';

const LANGUAGES = [
  { code: 'en', label: 'EN' },
  { code: 'pt-BR', label: 'PT' },
] as const;

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const current = i18n.language?.startsWith('pt') ? 'pt-BR' : 'en';

  return (
    <div className="flex items-center border border-border rounded overflow-hidden text-xs font-mono uppercase tracking-widest">
      {LANGUAGES.map(({ code, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => i18n.changeLanguage(code)}
          className={
            current === code
              ? 'px-2 py-1 bg-primary text-primary-foreground font-bold'
              : 'px-2 py-1 text-muted-foreground hover:text-foreground transition-colors'
          }
        >
          {label}
        </button>
      ))}
    </div>
  );
}
