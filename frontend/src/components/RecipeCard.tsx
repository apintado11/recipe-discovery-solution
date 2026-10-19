import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import { useLook } from '../LookProvider';
import type { RecipeLayout } from '../recipe/layoutPreference';
import type { Look } from '../theme';
import type { Recipe } from '../types';
import { CuisineChip } from './CuisineChip';

type RecipeCardProps = {
  recipe: Recipe;
  saved: boolean;
  saving: boolean;
  onSave: (recipeId: string) => void;
  layout?: RecipeLayout;
  index?: number;
};

type VariantProps = Required<Omit<RecipeCardProps, 'layout'>> & { look: Look };

function recipeMeta(recipe: Recipe) {
  return `${recipe.preparationTimeMinutes} min · ${recipe.difficulty}`;
}

function clamped(lines: number) {
  return {
    display: '-webkit-box',
    WebkitLineClamp: lines,
    WebkitBoxOrient: 'vertical',
    overflow: 'hidden',
  } as const;
}

function metaSx(look: Look, color: string) {
  return {
    color,
    fontSize: look.card.metaCaps ? '0.7rem' : '0.82rem',
    letterSpacing: look.card.metaCaps ? '0.1em' : 0,
    textTransform: look.card.metaCaps ? 'uppercase' : 'none',
  } as const;
}

function SaveButton({
  recipe,
  saved,
  saving,
  onSave,
  look,
  floating = false,
  color,
}: Pick<VariantProps, 'recipe' | 'saved' | 'saving' | 'onSave' | 'look'> & { floating?: boolean; color?: string }) {
  const ring = look.card.heartBorder !== 'transparent';
  return (
    <IconButton
      aria-label={saved ? `${recipe.name} is saved to favorites` : `Save ${recipe.name} to favorites`}
      aria-pressed={saved}
      disabled={saved || saving}
      onClick={() => onSave(recipe.id)}
      size={floating ? 'small' : 'medium'}
      sx={{
        color: color ?? look.card.heart,
        '&.Mui-disabled': { color: color ?? look.card.heart, opacity: saved ? 1 : 0.5 },
        ...(floating
          ? {
              width: 38,
              height: 38,
              bgcolor: look.card.heartBg,
              border: `1px solid ${look.card.heartBorder}`,
              backdropFilter: 'blur(12px)',
              '&:hover': { bgcolor: look.card.heartBg },
            }
          : ring
            ? { width: 38, height: 38, border: `1px solid ${look.card.heartBorder}` }
            : {}),
      }}
    >
      {saved ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
    </IconButton>
  );
}

function Photo({ recipe, ratio, radius }: { recipe: Recipe; ratio: string; radius: string }) {
  const sx = { width: '100%', aspectRatio: ratio, borderRadius: radius, display: 'block' } as const;
  if (!recipe.imageUrl) {
    return <Box sx={{ ...sx, bgcolor: 'rgba(127, 127, 127, 0.25)' }} />;
  }
  return <Box component="img" src={recipe.imageUrl} alt="" loading="lazy" sx={{ ...sx, objectFit: 'cover' }} />;
}

function cardSurface(look: Look, index: number) {
  const tilt = look.card.tilt ? (index % 2 === 0 ? -0.7 : 0.6) : 0;
  return {
    bgcolor: look.card.surface,
    color: look.card.ink,
    border: `1px solid ${look.card.border}`,
    borderRadius: look.card.radius,
    boxShadow: look.card.shadow,
    transform: tilt ? `rotate(${tilt}deg)` : 'none',
    transition: 'transform 160ms ease',
    '&:hover': tilt ? { transform: 'rotate(0deg) translateY(-2px)' } : {},
    ...(look.panel.blur && look.card.surface.startsWith('rgba') ? { backdropFilter: 'blur(18px)' } : {}),
  } as const;
}

function OverlayCard({ recipe, saved, saving, onSave, look }: VariantProps) {
  return (
    <Card elevation={0} sx={{ position: 'relative', borderRadius: look.card.radius, overflow: 'hidden', height: { xs: 300, md: 320 } }}>
      <CardActionArea component={RouterLink} to={`/recipes/${recipe.id}`} sx={{ height: '100%', display: 'block' }}>
        {recipe.imageUrl ? (
          <Box component="img" src={recipe.imageUrl} alt="" loading="lazy" sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : null}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0) 35%, rgba(8,16,12,0.94))' }} />
        <Box sx={{ position: 'absolute', left: 18, right: 18, bottom: 16, color: look.card.ink }}>
          <CuisineChip cuisine={recipe.cuisine} tone="card" flagHeight={12} />
          <Typography variant="h4" component="h2" sx={{ fontSize: '1.5rem', lineHeight: 1.1, mt: 1, ...clamped(2) }}>
            {recipe.name}
          </Typography>
          <Typography sx={{ ...metaSx(look, look.card.inkSoft), mt: 0.75 }}>{recipeMeta(recipe)}</Typography>
        </Box>
      </CardActionArea>
      <Box sx={{ position: 'absolute', top: 12, right: 12 }}>
        <SaveButton recipe={recipe} saved={saved} saving={saving} onSave={onSave} look={look} floating />
      </Box>
    </Card>
  );
}

function RecipePanel(props: VariantProps) {
  const { recipe, saved, saving, onSave, look, index } = props;
  if (look.card.overlay) {
    return <OverlayCard {...props} />;
  }
  const preview = recipe.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.name)
    .join(', ');

  return (
    <Card elevation={0} sx={{ ...cardSurface(look, index), height: '100%', display: 'flex', flexDirection: 'column', minWidth: 0, overflow: 'hidden' }}>
      <CardActionArea component={RouterLink} to={`/recipes/${recipe.id}`} sx={{ flexGrow: 1, display: 'block' }}>
        <Box sx={{ p: look.card.mat, pb: 0, position: 'relative' }}>
          <Photo recipe={recipe} ratio="16 / 10" radius={look.card.photoRadius} />
          {look.card.tagOnPhoto ? (
            <Box sx={{ position: 'absolute', left: 10, top: 10 }}>
              <CuisineChip cuisine={recipe.cuisine} tone="card" flagHeight={12} />
            </Box>
          ) : null}
        </Box>
        <Box sx={{ px: look.card.mat ? 1.75 : 0, pt: 1.5, pb: 1 }}>
          {look.card.tagOnPhoto ? null : <CuisineChip cuisine={recipe.cuisine} tone="card" />}
          <Typography variant="h4" component="h2" sx={{ fontSize: '1.3rem', lineHeight: 1.2, mt: look.card.tagOnPhoto ? 0 : 1, mb: 0.75, ...clamped(3) }}>
            {recipe.name}
          </Typography>
          <Typography sx={metaSx(look, look.card.inkSoft)}>{recipeMeta(recipe)}</Typography>
          {recipe.nutrition ? (
            <Typography sx={metaSx(look, look.card.inkSoft)}>
              {Math.round(recipe.nutrition.calories)} kcal · {recipe.nutrition.protein} g protein
            </Typography>
          ) : null}
          {preview ? (
            <Typography variant="body2" sx={{ mt: 1, color: look.card.ink, ...clamped(2) }}>
              {preview}
            </Typography>
          ) : null}
        </Box>
      </CardActionArea>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: look.card.mat ? 1 : 0, pb: 1 }}>
        <SaveButton recipe={recipe} saved={saved} saving={saving} onSave={onSave} look={look} />
      </Box>
    </Card>
  );
}

function RecipeCompact({ recipe, saved, saving, onSave, look, index }: VariantProps) {
  return (
    <Card elevation={0} sx={{ ...cardSurface(look, index), height: '100%', position: 'relative', minWidth: 0, overflow: 'hidden' }}>
      <CardActionArea component={RouterLink} to={`/recipes/${recipe.id}`} sx={{ height: '100%', display: 'block' }}>
        <Box sx={{ p: look.card.mat ? 0.75 : 0, pb: 0 }}>
          <Photo recipe={recipe} ratio="1 / 1" radius={look.card.photoRadius} />
        </Box>
        <Box sx={{ px: look.card.mat || look.card.surface !== 'transparent' ? 1.25 : 0, pt: 1, pb: 1.25 }}>
          <Typography component="h2" sx={{ fontFamily: look.fonts.title, fontWeight: 600, fontSize: '0.98rem', lineHeight: 1.25, mb: 0.75, ...clamped(2) }}>
            {recipe.name}
          </Typography>
          <CuisineChip cuisine={recipe.cuisine} tone="card" flagHeight={12} />
          <Typography sx={{ ...metaSx(look, look.card.inkSoft), mt: 0.75 }}>{recipeMeta(recipe)}</Typography>
        </Box>
      </CardActionArea>
      <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
        <SaveButton recipe={recipe} saved={saved} saving={saving} onSave={onSave} look={look} floating />
      </Box>
    </Card>
  );
}

function RecipeListItem({ recipe, saved, saving, onSave, look, index }: VariantProps) {
  const onCard = look.card.listSurface === 'card';
  const ink = onCard ? look.card.ink : look.ink;
  const soft = onCard ? look.card.inkSoft : look.inkSoft;
  const thumbFirst = !look.card.numbered;
  const thumb = (
    <Box sx={{ width: { xs: 72, sm: 84 }, flexShrink: 0, m: onCard ? 1 : 0 }}>
      <Photo recipe={recipe} ratio="1 / 1" radius={onCard ? '14px' : look.card.numbered ? look.card.photoRadius : '12px'} />
    </Box>
  );

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        minWidth: 0,
        height: '100%',
        color: ink,
        ...(onCard
          ? { bgcolor: look.card.surface, border: `1px solid ${look.card.border}`, borderRadius: '18px' }
          : { borderTop: `1px ${look.card.listSurface === 'dashed' ? 'dashed' : 'solid'} ${look.line}`, py: 1.25 }),
      }}
    >
      <CardActionArea
        component={RouterLink}
        to={`/recipes/${recipe.id}`}
        sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-start', gap: 1.5, flexGrow: 1, minWidth: 0, borderRadius: onCard ? '18px' : 1 }}
      >
        {look.card.numbered ? (
          <Typography sx={{ fontFamily: look.fonts.title, fontStyle: 'italic', fontSize: '1.4rem', color: look.accent, width: 34, flexShrink: 0 }}>
            {String(index + 1).padStart(2, '0')}
          </Typography>
        ) : null}
        {thumbFirst ? thumb : null}
        <Box sx={{ minWidth: 0, flexGrow: 1, py: onCard ? 1 : 0 }}>
          <Typography component="h2" sx={{ fontFamily: look.fonts.title, fontWeight: 600, fontSize: '1.02rem', lineHeight: 1.25, mb: 0.5, ...clamped(2) }}>
            {recipe.name}
          </Typography>
          <CuisineChip cuisine={recipe.cuisine} tone={onCard ? 'card' : 'page'} flagHeight={12} />
          <Typography sx={{ ...metaSx(look, soft), mt: 0.5 }}>{recipeMeta(recipe)}</Typography>
        </Box>
        {thumbFirst ? null : thumb}
      </CardActionArea>
      <Box sx={{ pl: 0.5, pr: onCard ? 1 : 0, flexShrink: 0 }}>
        <SaveButton recipe={recipe} saved={saved} saving={saving} onSave={onSave} look={look} color={onCard ? look.card.heart : look.accent} />
      </Box>
    </Box>
  );
}

export function RecipeCard({ recipe, saved, saving, onSave, layout = 'card', index = 0 }: RecipeCardProps) {
  const look = useLook();
  const props = { recipe, saved, saving, onSave, index, look };
  if (layout === 'list') {
    return <RecipeListItem {...props} />;
  }
  if (layout === 'compact') {
    return <RecipeCompact {...props} />;
  }
  return <RecipePanel {...props} />;
}
