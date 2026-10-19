import { useQuery } from '@apollo/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { RecipeGrid } from '../components/RecipeGrid';
import { FAVORITES_QUERY } from '../graphql/operations';
import type { Recipe } from '../types';
import { USER_ID } from '../user';

export function FavoritesPage() {
  const { data, loading, error } = useQuery<{ favorites: Recipe[] }>(FAVORITES_QUERY, {
    variables: { userId: USER_ID },
  });
  const favorites = data?.favorites ?? [];
  const savedIds = new Set(favorites.map((recipe) => recipe.id));

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: '2.2rem', md: '3rem' }, mb: 1 }}>
        Saved recipes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Favorites for user {USER_ID}.
      </Typography>

      {loading ? (
        <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress aria-label="Loading favorites" />
        </Box>
      ) : null}

      {error ? (
        <Alert severity="error">{error.graphQLErrors[0]?.message ?? 'Favorites could not be loaded.'}</Alert>
      ) : null}

      {!loading && !error && favorites.length === 0 ? (
        <Box>
          <Typography sx={{ mb: 2 }}>Nothing saved yet.</Typography>
          <Button component={RouterLink} to="/" variant="contained">
            Browse recipes
          </Button>
        </Box>
      ) : null}

      {!loading && favorites.length > 0 ? (
        <RecipeGrid recipes={favorites} savedIds={savedIds} savingId={null} onSave={() => undefined} />
      ) : null}
    </Box>
  );
}
