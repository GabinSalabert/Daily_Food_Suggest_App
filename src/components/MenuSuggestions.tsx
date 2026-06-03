import { useState } from 'react';
import { Clock, Users, ChefHat } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLang } from '../i18n';
import type { DailyMenu, ScoredRecipe } from '../menuBuilder';
import type { Difficulty } from '../recipes';

const DIFFICULTY_STYLES: Record<Difficulty, string> = {
  easy:   'bg-deal-bg text-deal-text border border-deal-border',
  medium: 'bg-amber-50 text-amber-700 border border-amber-200',
  hard:   'bg-rise-bg text-rise-text border border-rise-border',
};

function RecipeCard({ recipe }: { recipe: ScoredRecipe }) {
  const { t, lang } = useLang();
  const name = lang === 'fr' ? recipe.name_fr : recipe.name_en;
  const description = lang === 'fr' ? recipe.description_fr : recipe.description_en;
  const ingredients = lang === 'fr' ? recipe.ingredients_fr : recipe.ingredients_en;
  const totalTime = recipe.prepMin + recipe.cookMin;

  return (
    <div className="card p-4 flex flex-col gap-3 h-full">
      {/* Name + difficulty */}
      <div className="flex items-start justify-between gap-2">
        <h4 className="font-display font-semibold text-ink-900 leading-snug text-base">{name}</h4>
        <span className={`flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${DIFFICULTY_STYLES[recipe.difficulty]}`}>
          {t.difficultyLabel[recipe.difficulty]}
        </span>
      </div>

      {/* Description */}
      <p className="text-xs text-ink-500 leading-relaxed">{description}</p>

      {/* Ingredients */}
      <div className="flex flex-wrap gap-1.5">
        {ingredients.map(ing => (
          <span key={ing} className="px-2 py-0.5 bg-ink-50 border border-ink-100 rounded-full text-xs text-ink-600">
            {ing}
          </span>
        ))}
      </div>

      {/* Stats */}
      <div className="flex items-center gap-4 text-xs text-ink-400 mt-auto pt-2 border-t border-ink-50">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {totalTime} min
        </span>
        <span className="flex items-center gap-1">
          <Users className="w-3 h-3" />
          {t.menuServings(recipe.servings)}
        </span>
      </div>
    </div>
  );
}

type CourseKey = 'starters' | 'mains' | 'desserts';
const COURSES: { key: CourseKey; icon: string; labelKey: 'menuStarter' | 'menuMain' | 'menuDessert' }[] = [
  { key: 'starters', icon: '🥗', labelKey: 'menuStarter' },
  { key: 'mains',    icon: '🍽', labelKey: 'menuMain' },
  { key: 'desserts', icon: '🍮', labelKey: 'menuDessert' },
];

export function MenuSuggestions({ menu }: { menu: DailyMenu }) {
  const { t } = useLang();
  const [activeTab, setActiveTab] = useState<CourseKey>('starters');

  return (
    <section>
      {/* Header */}
      <div className="flex items-center gap-2.5 mb-5">
        <div className="w-8 h-8 rounded-xl bg-gold-600/10 flex items-center justify-center">
          <ChefHat className="w-4 h-4 text-gold-700" />
        </div>
        <div>
          <h2 className="font-display font-semibold text-ink-900 text-xl">{t.menuTitle}</h2>
          <p className="text-xs text-ink-400 mt-0.5">{t.menuSubtitle}</p>
        </div>
      </div>

      {/* ── DESKTOP: 3-column grid ───────────────────────────────────────────── */}
      <div className="hidden md:grid md:grid-cols-3 gap-6">
        {COURSES.map(({ key, icon, labelKey }) => (
          <div key={key} className="flex flex-col gap-3">
            <div className="flex items-center gap-2 pb-2 border-b border-ink-100">
              <span className="text-lg">{icon}</span>
              <h3 className="font-semibold text-ink-700 text-sm uppercase tracking-wide">{t[labelKey]}</h3>
            </div>
            {menu[key].map(r => <RecipeCard key={r.id} recipe={r} />)}
          </div>
        ))}
      </div>

      {/* ── MOBILE: tab switcher ─────────────────────────────────────────────── */}
      <div className="md:hidden">
        {/* Tab bar */}
        <div className="flex rounded-xl bg-ink-100 p-1 mb-4">
          {COURSES.map(({ key, icon, labelKey }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                activeTab === key
                  ? 'bg-white shadow-sm text-ink-900'
                  : 'text-ink-500'
              }`}
            >
              <span>{icon}</span>
              <span>{t[labelKey]}</span>
            </button>
          ))}
        </div>

        {/* Active tab content */}
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.18 }}
            className="flex flex-col gap-3"
          >
            {menu[activeTab].map(r => <RecipeCard key={r.id} recipe={r} />)}
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
