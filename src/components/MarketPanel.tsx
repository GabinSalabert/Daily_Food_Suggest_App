import { TrendingDown, TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';
import type { Market, Product } from '../types';
import { useLang } from '../i18n';

interface Props {
  market: Market;
  direction: 'down' | 'up';
  index: number;
}

function ProductRow({ p, i }: { p: Product; i: number }) {
  const isDown = p.variation < 0;
  const varAbs = Math.abs(p.variation);

  return (
    <motion.div
      initial={{ opacity: 0, x: -6 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: i * 0.02, duration: 0.2 }}
      className="flex items-center gap-3 px-4 py-2.5 border-b border-ink-50 last:border-0 hover:bg-ink-50/50 transition-colors"
    >
      <span className="flex-1 text-sm text-ink-800 truncate">{p.name}</span>
      <span className={`flex-shrink-0 text-xs font-medium tabular-nums ${isDown ? 'text-deal-text' : 'text-rise-text'}`}>
        {isDown ? '↓' : '↑'} {varAbs.toFixed(2)} €
      </span>
      <span className="flex-shrink-0 text-sm font-semibold text-ink-900 tabular-nums w-20 text-right">
        {p.price.toFixed(2)} €
        <span className="text-xs font-normal text-ink-400">/{p.unit}</span>
      </span>
    </motion.div>
  );
}

export function MarketPanel({ market, direction, index }: Props) {
  const { t } = useLang();
  const isDown = direction === 'down';

  const products = [...market.products
    .filter(p => isDown ? p.variation < 0 : p.variation > 0)]
    .sort((a, b) => isDown ? a.variation - b.variation : b.variation - a.variation);

  const Icon = isDown ? TrendingDown : TrendingUp;
  const headerBg = isDown ? 'bg-deal-bg/50' : 'bg-rise-bg/50';
  const iconColor = isDown ? 'text-deal-badge' : 'text-rise-badge';
  const countColor = isDown ? 'text-deal-text' : 'text-rise-text';

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.3 }}
      className="card overflow-hidden"
    >
      <div className={`flex items-center gap-3 px-4 py-3 border-b border-ink-100 ${headerBg}`}>
        <span className="text-xl">{market.icon}</span>
        <h2 className="font-semibold text-ink-900 flex-1 truncate whitespace-nowrap">{market.label}</h2>
        <div className={`flex items-center gap-1.5 text-xs font-medium ${countColor}`}>
          <Icon className={`w-3.5 h-3.5 ${iconColor}`} />
          {t.productsCount(products.length)}
        </div>
      </div>

      <div className="max-h-80 overflow-y-auto">
        {products.length === 0 ? (
          <p className="px-4 py-6 text-sm text-ink-400 text-center italic">
            {isDown ? t.noDown : t.noUp}
          </p>
        ) : (
          products.map((p, i) => <ProductRow key={p.name} p={p} i={i} />)
        )}
      </div>
    </motion.div>
  );
}
