import { useMutation, useQuery } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { errorMessage } from '../api/errors';
import { fetchCuisines, fetchRecipes } from '../api/recipes';
import { useAuth } from '../auth/AuthProvider';
import { displayName } from '../auth/session';
import { RecipeGrid } from '../components/RecipeGrid';
import { ADD_FAVORITE, FAVORITE_IDS_QUERY } from '../graphql/operations';
import type { RecipePage } from '../types';

const SORTS = [
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'prepTime:asc', label: 'Prep time (short)' },
  { value: 'prepTime:desc', label: 'Prep time (long)' },
  { value: 'difficulty:asc', label: 'Difficulty (easy first)' },
  { value: 'difficulty:desc', label: 'Difficulty (hard first)' },
];

const PAGE_SIZE = 12;

export function BrowsePage() {
  const { session } = useAuth();
  const userId = session?.user.id ?? '';
  const [searchInput, setSearchInput] = useState('');
  const [ingredientInput, setIngredientInput] = useState('');
  const [cuisine, setCuisine] = useState('');
  const [sortChoice, setSortChoice] = useState('name:asc');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [debouncedIngredient, setDebouncedIngredient] = useState('');
  const [cuisines, setCuisines] = useState<string[]>([]);
  const [recipes, setRecipes] = useState<RecipePage | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);

  const favoritesQuery = useQuery<{ favorites: { id: string }[] }>(FAVORITE_IDS_QUERY, {
    variables: { userId },
    skip: userId.length === 0,
  });
  const [addFavorite] = useMutation(ADD_FAVORITE);

  useEffect(() => {
    const handle = window.setTimeout(() => {
      setDebouncedSearch(searchInput.trim());
      setDebouncedIngredient(ingredientInput.trim());
    }, 300);
    return () => window.clearTimeout(handle);
  }, [searchInput, ingredientInput]);

  useEffect(() => {
    const controller = new AbortController();
    fetchCuisines(controller.signal)
      .then((names) => {
        if (!controller.signal.aborted) {
          setCuisines(names);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(fetchError));
        }
      });
    return () => controller.abort();
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoading(true);
    const [sort, direction] = sortChoice.split(':');
    fetchRecipes(
      {
        cuisine,
        ingredient: debouncedIngredient,
        search: debouncedSearch,
        sort,
        direction,
        page,
        pageSize: PAGE_SIZE,
      },
      controller.signal,
    )
      .then((result) => {
        if (!controller.signal.aborted) {
          setRecipes(result);
          setError(null);
        }
      })
      .catch((fetchError: unknown) => {
        if (!controller.signal.aborted) {
          setError(errorMessage(fetchError));
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      });
    return () => controller.abort();
  }, [cuisine, debouncedIngredient, debouncedSearch, page, sortChoice]);

  const savedIds = new Set((favoritesQuery.data?.favorites ?? []).map((favorite) => favorite.id));
  const pageCount = recipes ? Math.max(1, Math.ceil(recipes.total / recipes.pageSize)) : 1;

  async function onSave(recipeId: string) {
    setSavingId(recipeId);
    setError(null);
    try {
      await addFavorite({
        variables: { userId, recipeId },
        refetchQueries: ['FavoriteIds', 'Favorites'],
      });
    } catch (saveError: unknown) {
      setError(errorMessage(saveError));
    } finally {
      setSavingId(null);
    }
  }

  return (
    <Box>
      <Typography variant="h1" sx={{ fontSize: { xs: '2.2rem', md: '3rem' }, mb: 1 }}>
        Find a meal worth cooking
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3, maxWidth: 640 }}>
        Recipes come from TheMealDB. Prep time and difficulty are estimates. Favorites are saved for{' '}
        {session ? displayName(session.user.username) : 'you'}.
      </Typography>

      <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns: { xs: '1fr', md: '1.3fr 1fr 1fr 1fr' }, mb: 3 }}>
        <TextField
          label="Search"
          value={searchInput}
          onChange={(event) => {
            setSearchInput(event.target.value);
            setPage(1);
          }}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              setDebouncedSearch(searchInput.trim());
            }
          }}
          placeholder="Chicken, pasta, stew"
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton
                  aria-label="Search recipes"
                  edge="end"
                  onClick={() => {
                    setDebouncedSearch(searchInput.trim());
                    setPage(1);
                  }}
                >
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
        <TextField
          select
          label="Cuisine"
          value={cuisine}
          onChange={(event) => {
            setCuisine(event.target.value);
            setPage(1);
          }}
        >
          <MenuItem value="">All cuisines</MenuItem>
          {cuisines.map((name) => (
            <MenuItem key={name} value={name}>
              {name}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Ingredient"
          value={ingredientInput}
          onChange={(event) => {
            setIngredientInput(event.target.value);
            setPage(1);
          }}
          placeholder="chicken breast"
          helperText="Matches an ingredient name, such as chicken breast"
        />
        <TextField
          select
          label="Sort"
          value={sortChoice}
          onChange={(event) => {
            setSortChoice(event.target.value);
            setPage(1);
          }}
        >
          {SORTS.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
      </Box>

      {error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      ) : null}
      {favoritesQuery.error ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          {favoritesQuery.error.graphQLErrors[0]?.message ?? 'Favorites could not be loaded.'}
        </Alert>
      ) : null}

      {loading ? (
        <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress aria-label="Loading recipes" />
        </Box>
      ) : null}

      {!loading && recipes && recipes.items.length === 0 ? (
        <Typography>No recipes match those filters.</Typography>
      ) : null}

      {!loading && recipes && recipes.items.length > 0 ? (
        <>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {recipes.total} recipes
          </Typography>
          <RecipeGrid recipes={recipes.items} savedIds={savedIds} savingId={savingId} onSave={onSave} />
          {recipes.total > recipes.pageSize ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                page={recipes.page}
                count={pageCount}
                onChange={(_event, nextPage) => setPage(nextPage)}
                color="primary"
              />
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
