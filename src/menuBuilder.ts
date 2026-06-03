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

function pickBest(recipes: ScoredRecipe[], course: Course, count: number): ScoredRecipe[] {
  const byCourse = recipes.filter(r => r.course === course);
  // Prioritise recipes with deal matches, then vary by difficulty
  const withMatch = byCourse.filter(r => r.score > 0).sort((a, b) => b.score - a.score);
  const fallback = byCourse.filter(r => r.score === 0);

  const pool = [...withMatch, ...fallback];
  // Deduplicate by id and pick top `count`
  const seen = new Set<string>();
  const result: ScoredRecipe[] = [];
  for (const r of pool) {
    if (!seen.has(r.id)) { seen.add(r.id); result.push(r); }
    if (result.length >= count) break;
  }
  return result;
}

export function buildDailyMenu(allProducts: Product[]): DailyMenu {
  const deals = allProducts.filter(p => p.variation < 0);
  const scored = RECIPES.map(r => scoreRecipe(r, deals));
  const hasAnyMatch = scored.some(r => r.score > 0);

  return {
    starters: pickBest(scored, 'starter', 2),
    mains: pickBest(scored, 'main', 3),
    desserts: pickBest(scored, 'dessert', 2),
    hasAnyMatch,
  };
}
