import type { MarketData } from './types';

const KEY = 'marche_du_jour_v1';
const SUGGESTION_KEY = 'marche_suggestions_v1';
// Cache lasts until end of day — prices are daily
const ONE_DAY_MS = 24 * 60 * 60 * 1000;

interface CacheEntry {
  data: MarketData;
  savedAt: number;
}

export function loadCache(): MarketData | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const entry: CacheEntry = JSON.parse(raw);
    const age = Date.now() - entry.savedAt;
    if (age > ONE_DAY_MS) { clearCache(); return null; }
    // Also invalidate if the cached date is not today
    const today = new Date().toISOString().split('T')[0];
    if (entry.data.date !== today) { clearCache(); return null; }
    return entry.data;
  } catch {
    return null;
  }
}

export function saveCache(data: MarketData): void {
  const entry: CacheEntry = { data, savedAt: Date.now() };
  localStorage.setItem(KEY, JSON.stringify(entry));
}

export function clearCache(): void {
  localStorage.removeItem(KEY);
}

export function cacheAgeMinutes(): number | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const { savedAt } = JSON.parse(raw) as CacheEntry;
    return Math.round((Date.now() - savedAt) / 60_000);
  } catch {
    return null;
  }
}

// ── Suggestion history ──────────────────────────────────────────────────────

export interface SuggestionEntry {
  marketDate: string;
  suggestedIds: string[];
}

export function loadSuggestionHistory(): SuggestionEntry | null {
  try {
    const raw = localStorage.getItem(SUGGESTION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as SuggestionEntry;
  } catch {
    return null;
  }
}

export function saveSuggestionHistory(entry: SuggestionEntry): void {
  localStorage.setItem(SUGGESTION_KEY, JSON.stringify(entry));
}
