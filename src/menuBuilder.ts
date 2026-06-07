import { RECIPES, type Recipe, type Course } from './recipes';
import type { Product } from './types';

export interface ScoredRecipe extends Recipe {
  matchedDeals: string[]; // product names that matched
  score: number;
}

export interface DailyMenu {
  starters: ScoredRecipe[];
  mains: ScoredRecipe[];
  desserts: ScoredRecipe[];
  hasAnyMatch: boolean;
}

function extractKeywords(productName: string): string[] {
  return productName.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').split(/\s+/);
}

function scoreRecipe(recipe: Recipe, dealProducts: Product[]): ScoredRecipe {
  const matchedDeals: string[] = [];

  for (const product of dealProducts) {
    const productWords = extractKeywords(product.name);
    const matched = recipe.keywords.some(kw => {
      const kwNorm = kw.normalize('NFD').replace(/[̀-ͯ]/g, '');
      return productWords.some(w => w.includes(kwNorm) || kwNorm.includes(w));
    });
    if (matched) matchedDeals.push(product.name);
  }

  return { ...recipe, matchedDeals, score: matchedDeals.length };
}

function pickBest(
  recipes: ScoredRecipe[],
  course: Course,
  count: number,
  excludeIds: Set<string>,
): ScoredRecipe[] {
  const byCourse = recipes.filter(r => r.course === course);
  const withMatch = byCourse.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  const fallback = byCourse.filter(r => r.score === 0);

  const pool = [...withMatch, ...fallback];
  // Fresh recipes (not shown last market) come first; repeats are last resort
  const fresh = pool.filter(r => !excludeIds.has(r.id));
  const repeats = pool.filter(r => excludeIds.has(r.id));
  const ordered = [...fresh, ...repeats];

  const seen = new Set<string>();
  const result: ScoredRecipe[] = [];
  for (const r of ordered) {
    if (!seen.has(r.id)) { seen.add(r.id); result.push(r); }
    if (result.length >= count) break;
  }
  return result;
}

export function buildDailyMenu(allProducts: Product[], excludeIds: Set<string> = new Set()): DailyMenu {
  const deals = allProducts.filter(p => p.variation < 0);
  const scored = RECIPES.map(r => scoreRecipe(r, deals));
  const hasAnyMatch = scored.some(r => r.score > 0);

  return {
    starters: pickBest(scored, 'starter', 2, excludeIds),
    mains: pickBest(scored, 'main', 3, excludeIds),
    desserts: pickBest(scored, 'dessert', 2, excludeIds),
    hasAnyMatch,
  };
}
