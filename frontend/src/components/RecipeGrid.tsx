import Box from '@mui/material/Box';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '../types';

type RecipeGridProps = {
  recipes: Recipe[];
  savedIds: ReadonlySet<string>;
  savingId: string | null;
  onSave: (recipeId: string) => void;
};

export function RecipeGrid({ recipes, savedIds, savingId, onSave }: RecipeGridProps) {
  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', md: '1fr 1fr 1fr' },
      }}
    >
      {recipes.map((recipe) => (
        <RecipeCard
          key={recipe.id}
          recipe={recipe}
          saved={savedIds.has(recipe.id)}
          saving={savingId === recipe.id}
          onSave={onSave}
        />
      ))}
    </Box>
  );
}
