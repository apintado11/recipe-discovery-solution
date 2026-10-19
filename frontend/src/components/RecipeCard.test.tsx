import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import { RecipeCard } from './RecipeCard';
import type { Recipe } from '../types';

const recipe: Recipe = {
  id: '1',
  name: 'Test Lemon Pasta',
  description: 'Boil the pasta.',
  cuisine: 'Italian',
  preparationTimeMinutes: 21,
  difficulty: 'Easy',
  ingredients: [{ name: 'pasta', measure: '200 g' }],
};

describe('RecipeCard', () => {
  it('shows the recipe name, cuisine, and time', () => {
    render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} saved={false} saving={false} onSave={() => undefined} />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Test Lemon Pasta' })).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();
    expect(screen.getByText('21 min · Easy')).toBeInTheDocument();
  });

  it('keeps the name and region in the compact and list layouts', () => {
    const { rerender } = render(
      <MemoryRouter>
        <RecipeCard recipe={recipe} saved={false} saving={false} onSave={() => undefined} layout="compact" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Test Lemon Pasta' })).toBeInTheDocument();
    expect(screen.getByText('Italian')).toBeInTheDocument();

    rerender(
      <MemoryRouter>
        <RecipeCard recipe={recipe} saved={false} saving={false} onSave={() => undefined} layout="list" />
      </MemoryRouter>,
    );

    expect(screen.getByRole('heading', { name: 'Test Lemon Pasta' })).toBeInTheDocument();
    expect(screen.getByText('21 min · Easy')).toBeInTheDocument();
  });
});
