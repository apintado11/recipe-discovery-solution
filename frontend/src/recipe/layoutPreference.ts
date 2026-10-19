import { useCallback, useState } from 'react';

export type RecipeLayout = 'list' | 'card' | 'compact';

const STORAGE_KEY = 'recipe-discovery-layout';

export function readRecipeLayout(): RecipeLayout {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'list' || value === 'card' || value === 'compact') {
      return value;
    }
  } catch {
    // Private mode can block storage. The card layout still works.
  }
  return 'card';
}

export function writeRecipeLayout(layout: RecipeLayout) {
  try {
    localStorage.setItem(STORAGE_KEY, layout);
  } catch {
    // Ignore storage failures. The choice still applies for this visit.
  }
}

export function pageSizeFor(layout: RecipeLayout) {
  return layout === 'card' ? 12 : 24;
}

export function useRecipeLayout() {
  const [layout, setLayoutState] = useState<RecipeLayout>(() => readRecipeLayout());
  const setLayout = useCallback((next: RecipeLayout) => {
    setLayoutState(next);
    writeRecipeLayout(next);
  }, []);
  return [layout, setLayout] as const;
}
