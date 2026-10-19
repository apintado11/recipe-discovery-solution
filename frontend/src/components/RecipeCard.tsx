import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardActionArea from '@mui/material/CardActionArea';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Link as RouterLink } from 'react-router-dom';
import type { Recipe } from '../types';

type RecipeCardProps = {
  recipe: Recipe;
  saved: boolean;
  saving: boolean;
  onSave: (recipeId: string) => void;
};

export function RecipeCard({ recipe, saved, saving, onSave }: RecipeCardProps) {
  const preview = recipe.ingredients
    .slice(0, 3)
    .map((ingredient) => ingredient.name)
    .join(', ');

  return (
    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column', border: '1px solid #e4dccb' }} elevation={0}>
      <CardActionArea component={RouterLink} to={`/recipes/${recipe.id}`} sx={{ alignItems: 'stretch', flexGrow: 1 }}>
        {recipe.imageUrl ? (
          <CardMedia
            component="img"
            image={recipe.imageUrl}
            alt=""
            sx={{ aspectRatio: '16 / 10', objectFit: 'cover' }}
          />
        ) : (
          <Box sx={{ aspectRatio: '16 / 10', bgcolor: 'primary.main' }} />
        )}
        <CardContent>
          <Chip label={recipe.cuisine} size="small" variant="outlined" color="primary" sx={{ mb: 1 }} />
          <Typography variant="h4" component="h2" sx={{ fontSize: '1.35rem', lineHeight: 1.2, mb: 1 }}>
            {recipe.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {recipe.preparationTimeMinutes} min · {recipe.difficulty}
          </Typography>
          {preview ? (
            <Typography variant="body2" sx={{ mt: 1 }}>
              {preview}
            </Typography>
          ) : null}
        </CardContent>
      </CardActionArea>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', px: 1, pb: 1 }}>
        <IconButton
          aria-label={saved ? `${recipe.name} is saved to favorites` : `Save ${recipe.name} to favorites`}
          aria-pressed={saved}
          color="secondary"
          disabled={saved || saving}
          onClick={() => onSave(recipe.id)}
        >
          {saved ? <FavoriteIcon /> : <FavoriteBorderIcon />}
        </IconButton>
      </Box>
    </Card>
  );
}
