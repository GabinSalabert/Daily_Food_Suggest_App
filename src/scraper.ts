import type { Market, MarketData, Product } from './types';

const MARKETS = [
  { id: 'M0162', label: 'Viandes',          icon: '🥩' },
  { id: 'M0123', label: 'Fruits & Légumes', icon: '🥦' },
  { id: 'M0155', label: 'Primeurs',          icon: '🍎' },
];

// Format a Date as DDMMYY — the date format franceagrimer expects in the URL
function toRnmDate(date: Date): string {
  const d = String(date.getDate()).padStart(2, '0');
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const y = String(date.getFullYear()).slice(-2);
  return `${d}${m}${y}`;
}

function parsePrice(raw: string): number | null {
  const n = parseFloat(raw.trim().replace(',', '.').replace(/[^\d.-]/g, ''));
  return isNaN(n) || n <= 0 ? null : n;
}

function parseVariation(raw: string): number {
  const s = raw.trim().replace(',', '.');
  if (!s || s === '=' || s === 'nc' || s === '-') return 0;
  const n = parseFloat(s);
  return isNaN(n) ? 0 : n;
}

// Parse the "marché du DD-MM-YYYY" line from the page to know the actual market date shown
function parseMarketDate(doc: Document): string | null {
  const text = doc.body?.innerText ?? doc.body?.textContent ?? '';
  const match = text.match(/march[eé]\s+du\s+(\d{2}[-/]\d{2}[-/]\d{4}|\d{2}[-/]\d{2}[-/]\d{2})/i)
             ?? text.match(/cours\s+du\s+(\d{2}[/-]\d{2}[/-]\d{2,4})/i);
  return match ? match[1] : null;
}

async function fetchAndParse(url: string): Promise<{ products: Product[]; marketDate: string | null }> {
  const res = await fetch(url, {
    headers: { Accept: 'text/html', 'Accept-Language': 'fr-FR,fr;q=0.9' },
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const marketDate = parseMarketDate(doc);
  const products: Product[] = [];

  doc.querySelectorAll('table tr').forEach(row => {
    const cells = row.querySelectorAll('td');
    if (cells.length < 3) return;
    const name = cells[0]?.textContent?.trim() ?? '';
    if (!name || name.length < 3) return;
    const price = parsePrice(cells[1]?.textContent ?? '');
    if (!price) return;
    const variation = parseVariation(cells[2]?.textContent ?? '');
    products.push({ name, price, variation, unit: 'kg', isLowPrice: variation < 0 });
  });

  return { products, marketDate };
}

// Try today, then walk backwards until we find a day with actual market data (max 7 days)
async function fetchMarket(id: string, label: string, icon: string): Promise<Market & { marketDate: string | null }> {
  let lastError = '';

  for (let daysBack = 0; daysBack <= 7; daysBack++) {
    const date = new Date();
    date.setDate(date.getDate() - daysBack);
    const rnmDate = toRnmDate(date);
    const url = `/rnm/prix?${id}:MARCHE:${rnmDate}`;

    try {
      const { products, marketDate } = await fetchAndParse(url);
      if (products.length > 0) {
        return { id, label, icon, products, marketDate };
      }
      // Page loaded but no data → market closed that day, try previous day
    } catch (e) {
      lastError = (e as Error).message;
    }
  }

  throw new Error(`No market data found for ${id} in the last 7 days. ${lastError}`);
}

export async function fetchAllMarkets(): Promise<MarketData> {
  const results = await Promise.allSettled(
    MARKETS.map(m => fetchMarket(m.id, m.label, m.icon))
  );

  const markets: Market[] = [];
  const errors: string[] = [];
  let marketDate: string | null = null;

  results.forEach((r, i) => {
    if (r.status === 'fulfilled') {
      const { marketDate: md, ...market } = r.value;
      markets.push(market);
      if (!marketDate && md) marketDate = md;
    } else {
      errors.push(`${MARKETS[i].id}: ${r.reason?.message ?? 'Unknown error'}`);
    }
  });

  if (markets.length === 0) {
    throw new Error('No market data retrieved. ' + errors.join(', '));
  }

  return {
    markets,
    fetchedAt: new Date().toISOString(),
    date: new Date().toISOString().split('T')[0],
    marketDate: marketDate ?? undefined,
  };
}
