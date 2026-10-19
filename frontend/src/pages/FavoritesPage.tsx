import { useQuery } from '@apollo/client';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../auth/AuthProvider';
import { displayName } from '../auth/session';
import { PageHero } from '../components/PageHero';
import { RecipeGrid } from '../components/RecipeGrid';
import { ResultsBar } from '../components/ViewSwitcher';
import { FAVORITES_QUERY } from '../graphql/operations';
import { useLook } from '../LookProvider';
import { useRecipeLayout } from '../recipe/layoutPreference';
import type { Recipe } from '../types';

export function FavoritesPage() {
  const { session } = useAuth();
  const look = useLook();
  const userId = session?.user.id ?? '';
  const { data, loading, error } = useQuery<{ favorites: Recipe[] }>(FAVORITES_QUERY, {
    variables: { userId },
    skip: userId.length === 0,
  });
  const favorites = data?.favorites ?? [];
  const savedIds = new Set(favorites.map((recipe) => recipe.id));
  const [layout, setLayout] = useRecipeLayout();

  return (
    <Box>
      <PageHero copy={look.copy.favorites} kicker={look.nav === 'editorial' ? 'Your collection' : undefined}>
        Favorites for {session ? displayName(session.user.username) : 'you'}.
      </PageHero>

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
        <>
          <ResultsBar countLabel={`${favorites.length} saved`} layout={layout} onLayout={setLayout} />
          <RecipeGrid recipes={favorites} savedIds={savedIds} savingId={null} onSave={() => undefined} layout={layout} />
        </>
      ) : null}
    </Box>
  );
}
