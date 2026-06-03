import { createContext, useContext, useState, type ReactNode } from 'react';
import { fr, enUS } from 'date-fns/locale';

export type Lang = 'en' | 'fr';

export const translations = {
  en: {
    appName: 'Market of the Day',
    refresh: 'Refresh',
    clearCache: 'Clear cache',
    loading: 'Fetching market prices…',
    errorTitle: 'Unable to fetch data',
    pricesDown: 'Prices down',
    pricesUp: 'Prices up',
    dealsSectionTitle: 'Best deals today',
    productsCount: (n: number) => `${n} product${n !== 1 ? 's' : ''}`,
    noDown: 'No price drops today',
    noUp: 'No price rises today',
    footer: 'Source: RNM FranceAgrimer · Daily cache (clear to force refresh)',
    menuTitle: "Today's Menu Suggestions",
    menuSubtitle: 'Built around today\'s best-priced ingredients',
    menuStarter: 'Starter',
    menuMain: 'Main',
    menuDessert: 'Dessert',
    menuDeal: 'On sale today',
    menuPrepTime: (min: number) => `${min} min prep`,
    menuCookTime: (min: number) => `${min} min cook`,
    menuServings: (n: number) => `${n} servings`,
    difficultyLabel: { easy: 'Easy', medium: 'Medium', hard: 'Hard' },
    loadedAt: (age: string) => `Loaded ${age}`,
    justNow: 'just now',
    minutesAgo: (n: number) => `${n} min ago`,
    hoursAgo: (n: number) => `${n}h ago`,
    dateLocale: enUS,
    dateFormat: "EEEE, MMMM d yyyy",
    markets: { M0162: 'Meats', M0123: 'Fruits & Veg', M0155: 'Fresh Produce' },
  },
  fr: {
    appName: 'Marché du Jour',
    refresh: 'Actualiser',
    clearCache: 'Vider le cache',
    loading: 'Récupération des cours du marché…',
    errorTitle: 'Impossible de récupérer les données',
    pricesDown: 'Prix en baisse',
    pricesUp: 'Prix en hausse',
    dealsSectionTitle: 'Meilleures affaires du jour',
    productsCount: (n: number) => `${n} produit${n !== 1 ? 's' : ''}`,
    noDown: 'Aucun produit en baisse aujourd\'hui',
    noUp: 'Aucun produit en hausse aujourd\'hui',
    footer: 'Source : RNM FranceAgrimer · Cache journalier (vider pour forcer la mise à jour)',
    menuTitle: 'Suggestions de menu du jour',
    menuSubtitle: 'Composé autour des ingrédients les moins chers aujourd\'hui',
    menuStarter: 'Entrée',
    menuMain: 'Plat',
    menuDessert: 'Dessert',
    menuDeal: 'En promotion',
    menuPrepTime: (min: number) => `${min} min prép.`,
    menuCookTime: (min: number) => `${min} min cuiss.`,
    menuServings: (n: number) => `${n} pers.`,
    difficultyLabel: { easy: 'Facile', medium: 'Moyen', hard: 'Difficile' },
    loadedAt: (age: string) => `Chargé ${age}`,
    justNow: 'à l\'instant',
    minutesAgo: (n: number) => `il y a ${n} min`,
    hoursAgo: (n: number) => `il y a ${n}h`,
    dateLocale: fr,
    dateFormat: "EEEE d MMMM yyyy",
    markets: { M0162: 'Viandes', M0123: 'Fruits & Légumes', M0155: 'Primeurs' },
  },
} as const;

export type T = typeof translations.en | typeof translations.fr;

interface LangCtx { lang: Lang; t: T; toggle: () => void }
const Ctx = createContext<LangCtx>(null!);

export function LangProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Lang>('en');
  const toggle = () => setLang(l => l === 'en' ? 'fr' : 'en');
  return <Ctx.Provider value={{ lang, t: translations[lang], toggle }}>{children}</Ctx.Provider>;
}

export function useLang() { return useContext(Ctx); }

export function formatAge(minutes: number, t: T): string {
  if (minutes < 1) return t.justNow;
  if (minutes < 60) return t.minutesAgo(minutes);
  return t.hoursAgo(Math.round(minutes / 60));
}
