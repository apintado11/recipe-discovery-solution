import Box from '@mui/material/Box';
import Checkbox from '@mui/material/Checkbox';
import LinearProgress from '@mui/material/LinearProgress';
import Typography from '@mui/material/Typography';
import { useState } from 'react';
import type { Ingredient } from '../types';

type ShoppingListProps = {
  ingredients: Ingredient[];
};

export function ShoppingList({ ingredients }: ShoppingListProps) {
  const [checked, setChecked] = useState<boolean[]>(() => ingredients.map(() => false));
  const packed = checked.filter(Boolean).length;
  const total = ingredients.length;
  const done = total > 0 && packed === total;

  function toggle(index: number) {
    setChecked((current) => current.map((value, itemIndex) => (itemIndex === index ? !value : value)));
  }

  return (
    <Box
      sx={{
        bgcolor: 'background.paper',
        border: '1px solid #e4dccb',
        borderRadius: 3,
        p: 2.5,
        position: { md: 'sticky' },
        top: 88,
      }}
    >
      <Typography variant="h3" sx={{ fontSize: '1.5rem' }}>
        Shopping list
      </Typography>
      <Typography color="text.secondary" sx={{ mt: 0.5, mb: 1.5 }}>
        {total === 0 ? 'No ingredients listed.' : done ? 'All packed. Ready to cook.' : `${packed} of ${total} packed`}
      </Typography>
      {total > 0 ? (
        <LinearProgress
          variant="determinate"
          value={(packed / total) * 100}
          aria-label={`${packed} of ${total} ingredients packed`}
          sx={{ mb: 2, height: 6, borderRadius: 99, bgcolor: '#e7efe9' }}
        />
      ) : null}
      <Box component="ul" aria-label="Shopping list" sx={{ listStyle: 'none', m: 0, p: 0, display: 'grid', gap: 1 }}>
        {ingredients.map((ingredient, index) => {
          const isChecked = checked[index] ?? false;
          const measure = ingredient.measure.trim();
          return (
            <Box component="li" key={`${ingredient.name}-${measure}-${index}`}>
              <Box
                component="label"
                sx={{
                  display: 'grid',
                  gridTemplateColumns: measure ? 'auto minmax(4.75rem, auto) 1fr' : 'auto 1fr',
                  gap: 1,
                  alignItems: 'center',
                  px: 1,
                  py: 0.75,
                  borderRadius: 2,
                  border: '1px solid',
                  borderColor: isChecked ? 'transparent' : '#e4dccb',
                  bgcolor: isChecked ? '#f6f1e7' : '#fff',
                  cursor: 'pointer',
                }}
              >
                <Checkbox
                  size="small"
                  checked={isChecked}
                  onChange={() => toggle(index)}
                  slotProps={{ input: { 'aria-label': shoppingLabel(measure, ingredient.name) } }}
                  sx={{ p: 0.5 }}
                />
                {measure ? (
                  <Typography
                    component="span"
                    sx={{
                      fontWeight: 700,
                      color: '#8a341f',
                      bgcolor: '#f3d6cf',
                      borderRadius: 1,
                      px: 0.75,
                      py: 0.25,
                      lineHeight: 1.3,
                      textDecoration: isChecked ? 'line-through' : 'none',
                    }}
                  >
                    {measure}
                  </Typography>
                ) : null}
                <Typography
                  component="span"
                  sx={{
                    textDecoration: isChecked ? 'line-through' : 'none',
                    color: isChecked ? 'text.secondary' : 'text.primary',
                  }}
                >
                  {ingredient.name}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>
      {packed > 0 ? (
        <Box
          component="button"
          type="button"
          onClick={() => setChecked(ingredients.map(() => false))}
          sx={{
            mt: 1.5,
            border: 0,
            background: 'none',
            color: 'primary.main',
            font: 'inherit',
            cursor: 'pointer',
            p: 0,
          }}
        >
          Clear checks
        </Box>
      ) : null}
    </Box>
  );
}

function shoppingLabel(measure: string, name: string): string {
  return measure ? `${measure} ${name}` : name;
}
