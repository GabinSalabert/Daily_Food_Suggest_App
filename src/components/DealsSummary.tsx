import { TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import type { MarketData } from '../types';
import { useLang } from '../i18n';

interface Props { data: MarketData }

export function DealsSummary({ data }: Props) {
  const { t } = useLang();

  const allDeals = data.markets
    .flatMap(m => m.products.filter(p => p.variation < 0).map(p => ({ ...p, marketLabel: m.label, icon: m.icon })))
    .sort((a, b) => a.variation - b.variation)
    .slice(0, 8);

  if (allDeals.length === 0) return null;

  return (
    <div className="card p-5 mb-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-7 h-7 bg-deal-bg rounded-xl flex items-center justify-center">
          <TrendingDown className="w-4 h-4 text-deal-badge" />
        </div>
        <h2 className="font-display font-semibold text-ink-900">{t.dealsSectionTitle}</h2>
        <span className="ml-auto text-xs text-ink-400">{t.productsCount(allDeals.length)}</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {allDeals.map((deal, i) => (
          <motion.div
            key={deal.name}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
            className="bg-deal-bg border border-deal-border rounded-xl p-3 flex flex-col gap-1"
          >
            <div className="flex items-center gap-1.5">
              <span className="text-lg">{deal.icon}</span>
              <span className="text-xs text-ink-500">{deal.marketLabel}</span>
            </div>
            <p className="text-xs font-semibold text-ink-800 leading-tight line-clamp-2">{deal.name}</p>
            <div className="flex items-baseline gap-1.5 mt-auto">
              <span className="text-sm font-bold text-ink-900">{deal.price.toFixed(2)} €</span>
              <span className="text-xs text-deal-text font-medium">↓ {Math.abs(deal.variation).toFixed(2)}</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
