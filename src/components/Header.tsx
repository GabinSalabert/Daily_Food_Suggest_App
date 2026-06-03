import { ChefHat, RefreshCw, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { useLang, formatAge } from '../i18n';

interface HeaderProps {
  ageMinutes: number | null;
  hasCache: boolean;
  loading: boolean;
  marketDate?: string;
  onRefresh: () => void;
  onClearCache: () => void;
}

export function Header({ ageMinutes, hasCache, loading, marketDate, onRefresh, onClearCache }: HeaderProps) {
  const { t, lang, toggle } = useLang();
  const today = format(new Date(), t.dateFormat, { locale: t.dateLocale });
  const ageStr = ageMinutes !== null ? t.loadedAt(formatAge(ageMinutes, t)) : null;

  return (
    <header className="bg-white border-b border-ink-100 sticky top-0 z-30">
      <div className="w-full px-4 sm:px-8 xl:px-16 h-14 flex items-center gap-4">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-gold-600 rounded-xl flex items-center justify-center">
            <ChefHat className="w-4 h-4 text-white" />
          </div>
          <span className="hidden sm:block font-display font-semibold text-ink-900">{t.appName}</span>
        </div>

        <div className="hidden md:flex flex-col">
          <span className="text-sm text-ink-400 capitalize">{today}</span>
          {marketDate && (
            <span className="text-xs text-ink-300">
              {lang === 'fr' ? `Marché du ${marketDate}` : `Market: ${marketDate}`}
            </span>
          )}
        </div>

        <div className="ml-auto flex items-center gap-2">
          {ageStr && (
            <span className="hidden sm:block text-xs text-ink-400">{ageStr}</span>
          )}
          {hasCache && (
            <button onClick={onClearCache} className="btn-light text-xs" title={t.clearCache}>
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
          <button onClick={onRefresh} disabled={loading} className="btn-dark text-xs">
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? '…' : t.refresh}
          </button>

          {/* Language toggle */}
          <button
            onClick={toggle}
            className="btn-light text-base px-2 py-1"
            title={lang === 'en' ? 'Passer en français' : 'Switch to English'}
          >
            {lang === 'en' ? '🇫🇷' : '🇬🇧'}
          </button>
        </div>
      </div>
    </header>
  );
}
