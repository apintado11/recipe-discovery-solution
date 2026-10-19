import { useMutation, useQuery } from '@apollo/client';
import SearchIcon from '@mui/icons-material/Search';
import TuneIcon from '@mui/icons-material/Tune';
import Alert from '@mui/material/Alert';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress from '@mui/material/LinearProgress';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import type { SxProps, Theme } from '@mui/material/styles';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { useEffect, useState } from 'react';
import { errorMessage } from '../api/errors';
import { fetchCuisines, fetchRecipes } from '../api/recipes';
import { useAuth } from '../auth/AuthProvider';
import { displayName } from '../auth/session';
import { MenuRule } from '../components/MenuRule';
import { MiniFlag } from '../components/MiniFlag';
import { PageHero } from '../components/PageHero';
import { RecipeGrid } from '../components/RecipeGrid';
import { ResultsBar } from '../components/ViewSwitcher';
import { ADD_FAVORITE, FAVORITE_IDS_QUERY } from '../graphql/operations';
import { useLook } from '../LookProvider';
import { pageSizeFor, useRecipeLayout, type RecipeLayout } from '../recipe/layoutPreference';
import type { Look } from '../theme';
import type { RecipePage } from '../types';

function season(now = new Date()) {
  const month = now.getMonth();
  if (month >= 2 && month <= 4) return 'Spring';
  if (month >= 5 && month <= 7) return 'Summer';
  if (month >= 8 && month <= 10) return 'Autumn';
  return 'Winter';
}

function searchFieldSx(look: Look): SxProps<Theme> {
  if (look.nav === 'journal') {
    return {
      '& .MuiInputBase-root': { fontFamily: look.fonts.note, fontSize: '1.45rem', color: look.ink, pb: 0.25 },
      '& .MuiInput-underline:before': { borderBottom: `1.5px solid ${look.ink}` },
      '& .MuiInput-underline:hover:not(.Mui-disabled):before': { borderBottom: `1.5px solid ${look.ink}` },
      '& .MuiInput-underline:after': { borderBottom: `2px solid ${look.accent}` },
      '& input::placeholder': { color: look.inkSoft, opacity: 1 },
    };
  }
  return {
    '& .MuiOutlinedInput-root': {
      borderRadius: look.nav === 'dock' ? '18px' : '999px',
      height: look.nav === 'dock' ? 50 : 46,
      bgcolor: look.field,
      ...(look.nav === 'dock' ? { backdropFilter: 'blur(20px)' } : {}),
    },
    '& .MuiOutlinedInput-notchedOutline': { borderColor: look.line },
    '& input::placeholder': { color: look.inkSoft, opacity: 1 },
  };
}

function filterButtonSx(look: Look) {
  if (look.nav === 'dock') {
    return {
      width: 42,
      height: 42,
      borderRadius: '13px',
      bgcolor: look.accent,
      color: look.onAccent,
      '&:hover': { bgcolor: look.accent },
    };
  }
  return {
    width: 42,
    height: 42,
    borderRadius: '50%',
    border: `1px solid ${look.lineStrong}`,
    bgcolor: look.field,
    color: look.ink,
  };
}

function CuisineStrip({ cuisines, value, onChange, look }: { cuisines: string[]; value: string; onChange: (value: string) => void; look: Look }) {
  const options = ['', ...cuisines];
  return (
    <Box
      role="toolbar"
      aria-label="Quick cuisine filter"
      sx={{
        display: 'flex',
        gap: 1,
        overflowX: 'auto',
        mx: { xs: -2, sm: -3 },
        px: { xs: 2, sm: 3 },
        py: 0.5,
        scrollbarWidth: 'none',
        '&::-webkit-scrollbar': { display: 'none' },
      }}
    >
      {options.map((name) => {
        const current = name === value;
        return (
          <Chip
            key={name || 'all'}
            clickable
            aria-pressed={current}
            onClick={() => onChange(name)}
            icon={name ? <MiniFlag cuisine={name} height={12} /> : undefined}
            label={name || 'All'}
            sx={{
              flexShrink: 0,
              height: 34,
              borderRadius: look.chip.radius,
              fontWeight: 600,
              ...(look.chip.caps ? { fontSize: '0.68rem', letterSpacing: '0.12em', textTransform: 'uppercase' } : { fontSize: '0.84rem' }),
              color: current ? look.onPrimary : look.pageTone.ink,
              bgcolor: current ? look.primary : look.pageTone.chipBg,
              border: `1px solid ${current ? look.primary : look.pageTone.chipBorder === 'transparent' ? look.line : look.pageTone.chipBorder}`,
              '&:hover': { bgcolor: current ? look.primary : look.field },
              '& .MuiChip-icon': { width: 18, height: 12, minWidth: 18, ml: '12px', mr: '-2px' },
            }}
          />
        );
      })}
    </Box>
  );
}

const SORTS = [
  { value: 'name:asc', label: 'Name (A–Z)' },
  { value: 'name:desc', label: 'Name (Z–A)' },
  { value: 'prepTime:asc', label: 'Prep time (short)' },
  { value: 'prepTime:desc', label: 'Prep time (long)' },
  { value: 'difficulty:asc', label: 'Difficulty (easy first)' },
  { value: 'difficulty:desc', label: 'Difficulty (hard first)' },
];

type FilterFieldsProps = {
  cuisine: string;
  cuisines: string[];
  ingredient: string;
  sortChoice: string;
  showHelper?: boolean;
  onCuisine: (value: string) => void;
  onIngredient: (value: string) => void;
  onSort: (value: string) => void;
};

function FilterFields({
  cuisine,
  cuisines,
  ingredient,
  sortChoice,
  showHelper = false,
  onCuisine,
  onIngredient,
  onSort,
}: FilterFieldsProps) {
  return (
    <>
      <TextField
        select
        size="small"
        fullWidth
        label="Cuisine"
        value={cuisine}
        onChange={(event) => onCuisine(event.target.value)}
      >
        <MenuItem value="">All cuisines</MenuItem>
        {cuisines.map((name) => (
          <MenuItem key={name} value={name}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <MiniFlag cuisine={name} />
              {name}
            </Box>
          </MenuItem>
        ))}
      </TextField>
      <TextField
        size="small"
        fullWidth
        label="Ingredient"
        value={ingredient}
        onChange={(event) => onIngredient(event.target.value)}
        placeholder="chicken breast"
        helperText={showHelper ? 'Matches an ingredient name, such as chicken breast' : undefined}
        sx={showHelper ? { '& .MuiFormHelperText-root': { mb: 0.5 } } : undefined}
      />
      <TextField
        select
        size="small"
        fullWidth
        label="Sort"
        value={sortChoice}
        onChange={(event) => onSort(event.target.value)}
      >
        {SORTS.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    </>
  );
}

export function BrowsePage() {
  const { session } = useAuth();
  const look = useLook();
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
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [layout, setLayout] = useRecipeLayout();

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
        pageSize: pageSizeFor(layout),
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
  }, [cuisine, debouncedIngredient, debouncedSearch, page, sortChoice, layout]);

  const savedIds = new Set((favoritesQuery.data?.favorites ?? []).map((favorite) => favorite.id));
  const pageCount = recipes ? Math.max(1, Math.ceil(recipes.total / recipes.pageSize)) : 1;
  const activeFilterCount = (cuisine ? 1 : 0) + (ingredientInput.trim() ? 1 : 0) + (sortChoice === 'name:asc' ? 0 : 1);

  function runSearch() {
    setDebouncedSearch(searchInput.trim());
    setPage(1);
  }

  function chooseLayout(next: RecipeLayout) {
    setLayout(next);
    setPage(1);
  }

  function clearFilters() {
    setCuisine('');
    setIngredientInput('');
    setSortChoice('name:asc');
    setPage(1);
  }

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

  const filterFields = (
    <FilterFields
      cuisine={cuisine}
      cuisines={cuisines}
      ingredient={ingredientInput}
      sortChoice={sortChoice}
      onCuisine={(value) => {
        setCuisine(value);
        setPage(1);
      }}
      onIngredient={(value) => {
        setIngredientInput(value);
        setPage(1);
      }}
      onSort={(value) => {
        setSortChoice(value);
        setPage(1);
      }}
    />
  );

  return (
    <Box>
      <PageHero
        copy={look.copy.browse}
        kicker={look.nav === 'editorial' ? `Vol. ${recipes?.total ?? '…'} · ${season()} kitchen` : undefined}
      >
        Recipes come from TheMealDB. Prep time and difficulty are estimates. Favorites are saved for{' '}
        {session ? displayName(session.user.username) : 'you'}.
      </PageHero>

      <Box sx={{ mb: 2.5 }}>
        <Box
          sx={{
            display: 'grid',
            gap: 1.5,
            gridTemplateColumns: { xs: 'minmax(0, 1fr) auto', md: '1.4fr 1fr 1fr 0.9fr' },
            alignItems: 'center',
          }}
        >
          <TextField
            size="small"
            fullWidth
            variant={look.nav === 'journal' ? 'standard' : 'outlined'}
            inputProps={{ 'aria-label': 'Search' }}
            value={searchInput}
            onChange={(event) => {
              setSearchInput(event.target.value);
              setPage(1);
            }}
            onKeyDown={(event) => {
              if (event.key === 'Enter') {
                runSearch();
              }
            }}
            placeholder={look.nav === 'journal' ? 'chicken, pasta, stew…' : 'Search recipes'}
            sx={searchFieldSx(look)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IconButton aria-label="Search recipes" edge="start" size="small" onClick={runSearch} sx={{ color: look.ink }}>
                    <SearchIcon fontSize="small" />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
          <Box
            sx={{
              display: { xs: 'none', md: 'grid' },
              gridColumn: { md: '2 / -1' },
              gridTemplateColumns: '1fr 1fr 0.9fr',
              gap: 1.5,
            }}
          >
            {filterFields}
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center' }}>
            <Badge color="secondary" badgeContent={activeFilterCount} invisible={activeFilterCount === 0}>
              <IconButton
                aria-label={activeFilterCount > 0 ? `Filters, ${activeFilterCount} active` : 'Filters'}
                aria-expanded={filtersOpen}
                aria-controls="recipe-filters"
                onClick={() => setFiltersOpen(true)}
                sx={filterButtonSx(look)}
              >
                <TuneIcon fontSize="small" />
              </IconButton>
            </Badge>
          </Box>
        </Box>

        <Box sx={{ mt: 2 }}>
          <CuisineStrip
            cuisines={cuisines}
            value={cuisine}
            look={look}
            onChange={(value) => {
              setCuisine(value);
              setPage(1);
            }}
          />
        </Box>

        {ingredientInput.trim() ? (
          <Box sx={{ display: { xs: 'flex', md: 'none' }, gap: 1, flexWrap: 'wrap', mt: 1.25 }}>
            <Chip
              size="small"
              variant="outlined"
              label={`Ingredient: ${ingredientInput.trim()}`}
              onDelete={() => {
                setIngredientInput('');
                setPage(1);
              }}
            />
          </Box>
        ) : null}
      </Box>

      <Drawer
        anchor="bottom"
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        slotProps={{
          paper: {
            id: 'recipe-filters',
            sx: {
              bgcolor: look.paper,
              color: look.ink,
              borderTop: `1px solid ${look.line}`,
              borderTopLeftRadius: 18,
              borderTopRightRadius: 18,
              borderBottomLeftRadius: 0,
              borderBottomRightRadius: 0,
              px: 2,
              pt: 1.25,
              pb: 'max(20px, env(safe-area-inset-bottom))',
              maxHeight: 'min(80vh, 560px)',
            },
          },
        }}
      >
        <Box
          aria-hidden
          sx={{ width: 40, height: 4, borderRadius: 99, bgcolor: look.lineStrong, mx: 'auto', mb: 1.5 }}
        />
        <Typography variant="h3" sx={{ mb: 0.25 }}>
          Filters
        </Typography>
        <MenuRule />
        <Box sx={{ display: 'grid', gap: 2.75, mt: 0.5 }}>
          <FilterFields
            cuisine={cuisine}
            cuisines={cuisines}
            ingredient={ingredientInput}
            sortChoice={sortChoice}
            showHelper
            onCuisine={(value) => {
              setCuisine(value);
              setPage(1);
            }}
            onIngredient={(value) => {
              setIngredientInput(value);
              setPage(1);
            }}
            onSort={(value) => {
              setSortChoice(value);
              setPage(1);
            }}
          />
        </Box>
        <Box sx={{ display: 'flex', gap: 1, mt: 2.5 }}>
          <Button variant="text" onClick={clearFilters} disabled={activeFilterCount === 0}>
            Clear
          </Button>
          <Button variant="contained" fullWidth onClick={() => setFiltersOpen(false)}>
            Done
          </Button>
        </Box>
      </Drawer>

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

      {loading && !recipes ? (
        <Box role="status" aria-live="polite" sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress aria-label="Loading recipes" />
        </Box>
      ) : null}

      {!loading && !error && recipes && recipes.items.length === 0 ? (
        <Typography>No recipes match those filters.</Typography>
      ) : null}

      {!error && recipes && recipes.items.length > 0 ? (
        <>
          <ResultsBar
            countLabel={`${recipes.total} ${recipes.total === 1 ? 'recipe' : 'recipes'}`}
            layout={layout}
            onLayout={chooseLayout}
          />
          {loading ? (
            <LinearProgress aria-label="Loading recipes" sx={{ mb: 1.5, borderRadius: 99, color: 'primary.main' }} />
          ) : null}
          <Box sx={{ opacity: loading ? 0.6 : 1, transition: 'opacity 120ms linear' }}>
            <RecipeGrid
              recipes={recipes.items}
              savedIds={savedIds}
              savingId={savingId}
              onSave={onSave}
              layout={layout}
              startIndex={(recipes.page - 1) * recipes.pageSize}
            />
          </Box>
          {recipes.total > recipes.pageSize ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
              <Pagination
                page={recipes.page}
                count={pageCount}
                onChange={(_event, nextPage) => setPage(nextPage)}
                color="primary"
                size="small"
                shape="rounded"
                siblingCount={0}
                boundaryCount={1}
              />
            </Box>
          ) : null}
        </>
      ) : null}
    </Box>
  );
}
