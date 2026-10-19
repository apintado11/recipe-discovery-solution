import { useMutation, useQuery } from '@apollo/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { ADD_FAVORITE, FAVORITE_IDS_QUERY, RECIPE_QUERY } from '../graphql/operations';
import type { Recipe } from '../types';

export function DetailPage() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const { id = '' } = useParams();
  const [saveError, setSaveError] = useState<string | null>(null);
  const recipeQuery = useQuery<{ recipe: Recipe }>(RECIPE_QUERY, {
    variables: { id },
    skip: id.length === 0,
  });
  const favoritesQuery = useQuery<{ favorites: { id: string }[] }>(FAVORITE_IDS_QUERY, {
    variables: { userId },
    skip: userId.length === 0,
  });
  const [addFavorite, addState] = useMutation(ADD_FAVORITE);

  const recipe = recipeQuery.data?.recipe;
  const saved = (favoritesQuery.data?.favorites ?? []).some((favorite) => favorite.id === id);

  async function onSave() {
    setSaveError(null);
    try {
      await addFavorite({
        variables: { userId, recipeId: id },
        refetchQueries: ['FavoriteIds', 'Favorites'],
      });
    } catch (saveFailure: unknown) {
      setSaveError(errorMessage(saveFailure));
    }
  }

  return (
    <Box>
      <Button component={RouterLink} to="/" sx={{ mb: 2 }}>
        All recipes
      </Button>

      {recipeQuery.loading ? (
        <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress aria-label="Loading recipe" />
        </Box>
      ) : null}

      {recipeQuery.error ? (
        <Alert severity="error">{recipeQuery.error.graphQLErrors[0]?.message ?? errorMessage(recipeQuery.error)}</Alert>
      ) : null}

      {recipe ? (
        <Box sx={{ display: 'grid', gap: 3, gridTemplateColumns: { xs: '1fr', md: '1.1fr 0.9fr' } }}>
          {recipe.imageUrl ? (
            <Box
              component="img"
              src={recipe.imageUrl}
              alt=""
              sx={{ width: '100%', borderRadius: 3, aspectRatio: '16 / 10', objectFit: 'cover' }}
            />
          ) : (
            <Box sx={{ borderRadius: 3, aspectRatio: '16 / 10', bgcolor: 'primary.main' }} />
          )}
          <Box>
            <Chip label={recipe.cuisine} variant="outlined" color="primary" sx={{ mb: 1 }} />
            <Typography variant="h1" sx={{ fontSize: { xs: '2rem', md: '2.8rem' }, mb: 1 }}>
              {recipe.name}
            </Typography>
            <Typography color="text.secondary" sx={{ mb: 2 }}>
              {recipe.preparationTimeMinutes} min · {recipe.difficulty} · estimate
              {recipe.nutrition
                ? ` · ${Math.round(recipe.nutrition.calories)} kcal · ${recipe.nutrition.protein} g protein`
                : ''}
            </Typography>
            <Button variant="contained" color="secondary" disabled={saved || addState.loading} onClick={onSave}>
              {saved ? 'Saved to favorites' : 'Save to favorites'}
            </Button>
            {saveError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {saveError}
              </Alert>
            ) : null}
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1 }}>
              Ingredients
            </Typography>
            <List>
              {recipe.ingredients.map((ingredient) => (
                <ListItem key={`${ingredient.name}-${ingredient.measure}`} disableGutters>
                  <ListItemText primary={ingredient.name} secondary={ingredient.measure || undefined} />
                </ListItem>
              ))}
            </List>
          </Box>
          <Box>
            <Typography variant="h3" sx={{ fontSize: '1.5rem', mb: 1 }}>
              Method
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-line' }}>{recipe.description}</Typography>
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
