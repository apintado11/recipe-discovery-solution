import Box from '@mui/material/Box';
import { useLook } from '../LookProvider';
import type { RecipeLayout } from '../recipe/layoutPreference';
import type { Recipe } from '../types';
import { RecipeCard } from './RecipeCard';

type RecipeGridProps = {
  recipes: Recipe[];
  savedIds: ReadonlySet<string>;
  savingId: string | null;
  onSave: (recipeId: string) => void;
  layout?: RecipeLayout;
  startIndex?: number;
};

export function RecipeGrid({ recipes, savedIds, savingId, onSave, layout = 'card', startIndex = 0 }: RecipeGridProps) {
  const look = useLook();
  const columns =
    layout === 'compact'
      ? { xs: '1fr 1fr', sm: 'repeat(3, 1fr)', lg: 'repeat(4, 1fr)' }
      : layout === 'list'
        ? { xs: '1fr', lg: '1fr 1fr' }
        : { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr' };
  const ruledList = layout === 'list' && look.card.listSurface !== 'card';
  const gap = ruledList ? { rowGap: 0, columnGap: 4 } : { gap: layout === 'card' ? (look.card.tilt ? 3 : 2.5) : 1.5 };

  return (
    <Box sx={{ display: 'grid', gridTemplateColumns: columns, alignItems: 'stretch', ...gap }}>
      {recipes.map((recipe, index) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          saved={savedIds.has(recipe.id)}
          saving={savingId === recipe.id}
          onSave={onSave}
          layout={layout}
          index={startIndex + index}
        />
      ))}
    </Box>
  );
}
