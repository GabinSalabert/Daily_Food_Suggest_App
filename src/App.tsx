import { useEffect, useState, useCallback } from 'react';
import { AlertTriangle, TrendingDown, TrendingUp } from 'lucide-react';
import { Header } from './components/Header';
import { DealsSummary } from './components/DealsSummary';
import { MarketPanel } from './components/MarketPanel';
import { fetchAllMarkets } from './scraper';
import { loadCache, saveCache, clearCache, cacheAgeMinutes } from './cache';
import { LangProvider, useLang, formatAge } from './i18n';
import { buildDailyMenu } from './menuBuilder';
import { MenuSuggestions } from './components/MenuSuggestions';
import type { MarketData } from './types';

function AppInner() {
  const { t } = useLang();
  const [data, setData] = useState<MarketData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ageMinutes, setAgeMinutes] = useState<number | null>(null);

  const load = useCallback(async (force = false) => {
    if (!force) {
      const cached = loadCache();
      if (cached) { setData(cached); setAgeMinutes(cacheAgeMinutes()); return; }
    }
    setLoading(true);
    setError(null);
    try {
      const fresh = await fetchAllMarkets();
      saveCache(fresh);
      setData(fresh);
      setAgeMinutes(0);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Tick age counter every minute
  useEffect(() => {
    const id = setInterval(() => setAgeMinutes(cacheAgeMinutes()), 60_000);
    return () => clearInterval(id);
  }, []);

  const handleClear = () => {
    clearCache();
    setData(null);
    setAgeMinutes(null);
    load(true);
  };

  // Apply translated market labels from t.markets
  const translatedData: MarketData | null = data
    ? {
        ...data,
        markets: data.markets.map(m => ({
          ...m,
          label: t.markets[m.id as keyof typeof t.markets] ?? m.label,
        })),
      }
    : null;

  return (
    <div className="min-h-screen flex flex-col">
      <Header
        ageMinutes={ageMinutes}
        hasCache={data !== null}
        loading={loading}
        marketDate={data?.marketDate}
        onRefresh={() => load(true)}
        onClearCache={handleClear}
      />

      <main className="flex-1 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6">

        {loading && !data && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-ink-400">
            <div className="w-8 h-8 border-2 border-ink-200 border-t-gold-600 rounded-full animate-spin" />
            <p className="text-sm">{t.loading}</p>
          </div>
        )}

        {error && (
          <div className="flex items-start gap-3 p-4 bg-rise-bg border border-rise-border rounded-xl text-sm text-rise-text mb-6">
            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-medium">{t.errorTitle}</p>
              <p className="text-xs mt-1 opacity-80">{error}</p>
            </div>
          </div>
        )}

        {translatedData && (
          <div className="animate-fade-in space-y-10">
            <DealsSummary data={translatedData} />

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingDown className="w-4 h-4 text-deal-badge" />
                <h2 className="font-display font-semibold text-ink-900">{t.pricesDown}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {translatedData.markets.map((market, i) => (
                  <MarketPanel key={market.id + '-down'} market={market} direction="down" index={i} />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2 mb-3">
                <TrendingUp className="w-4 h-4 text-rise-badge" />
                <h2 className="font-display font-semibold text-ink-900">{t.pricesUp}</h2>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                {translatedData.markets.map((market, i) => (
                  <MarketPanel key={market.id + '-up'} market={market} direction="up" index={i} />
                ))}
              </div>
            </div>

            {/* Daily menu suggestions */}
            <MenuSuggestions menu={buildDailyMenu(translatedData.markets.flatMap(m => m.products))} />
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-ink-300 py-3 border-t border-ink-100">
        {t.footer}
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <LangProvider>
      <AppInner />
    </LangProvider>
  );
}
