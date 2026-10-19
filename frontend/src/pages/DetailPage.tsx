import { useMutation, useQuery } from '@apollo/client';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { errorMessage } from '../api/errors';
import { useAuth } from '../auth/AuthProvider';
import { CuisineChip } from '../components/CuisineChip';
import { MenuRule } from '../components/MenuRule';
import { MethodSteps } from '../components/MethodSteps';
import { ShoppingList } from '../components/ShoppingList';
import { useLook } from '../LookProvider';
import { panelSx } from '../theme';
import { ADD_FAVORITE, FAVORITE_IDS_QUERY, RECIPE_QUERY } from '../graphql/operations';
import type { Recipe } from '../types';

export function DetailPage() {
  const { session } = useAuth();
  const look = useLook();
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
      <Button
        component={RouterLink}
        to="/"
        startIcon={<ArrowBackIcon />}
        sx={{
          mb: 1.5,
          px: 1,
          color: look.ink,
          ...(look.nav === 'journal'
            ? { fontFamily: look.fonts.note, fontSize: '1.35rem', fontWeight: 700 }
            : look.nav === 'editorial'
              ? { fontSize: '0.72rem', letterSpacing: '0.16em', textTransform: 'uppercase' }
              : { bgcolor: look.field, px: 1.75 }),
        }}
      >
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
              sx={{
                bgcolor: look.card.surface,
                p: look.card.mat,
                borderRadius: look.card.radius,
                boxShadow: look.card.shadow,
                overflow: 'hidden',
                transform: look.card.tilt ? 'rotate(-0.8deg)' : 'none',
              }}
            >
              <Box
                component="img"
                src={recipe.imageUrl}
                alt=""
                sx={{ width: '100%', borderRadius: look.card.photoRadius, aspectRatio: '16 / 10', objectFit: 'cover', display: 'block' }}
              />
            </Box>
          ) : (
            <Box sx={{ ...panelSx(look), aspectRatio: '16 / 10' }} />
          )}
          <Box>
            <CuisineChip cuisine={recipe.cuisine} flagHeight={16} />
            <Typography variant="h1" sx={{ fontSize: look.nav === 'dock' ? { xs: '2rem', md: '2.8rem' } : { xs: '2.4rem', md: '3.4rem' }, mt: 1.25, lineHeight: 1.05 }}>
              {recipe.name}
            </Typography>
            <MenuRule />
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
          <Box
            sx={{
              gridColumn: { md: '1 / -1' },
              display: 'grid',
              gap: 3,
              alignItems: 'start',
              gridTemplateColumns: { xs: '1fr', md: 'minmax(260px, 340px) 1fr' },
            }}
          >
            <ShoppingList key={recipe.id} ingredients={recipe.ingredients} />
            <MethodSteps key={recipe.id} description={recipe.description} />
          </Box>
        </Box>
      ) : null}
    </Box>
  );
}
